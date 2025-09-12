"use client";

import { create } from "zustand";
import { Position, Transaction } from "utils/types";
import {
  hasPortfolioData,
  loadPortfolioFromLocalStorage,
} from "utils/localStorage";
import getStockPrice from "../actions/getStockPrice";
import getExchangeRate from "../actions/getExchangeRate";

type PortfolioState = {
  positions: Position[];
  processedTransactions: Transaction[];
  holdingsMap: Record<string, Position>;
  calculatedIsins: Record<string, boolean>;
  errors: Record<string, string | undefined>;
  ratesToUSD: Record<string, number>;
  investedUSD: number;
  totalCurrentValueUSD: number;
  lastPriceUpdate: Date | null;
  isCalculating: boolean;
  initFromLocalStorage: () => void;
  startCalculations: () => Promise<void>;
  isAllCalculated: () => boolean;
  convertCurrency: (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ) => number;
  getTransactionsForStock: (isin: string) => Transaction[];
};

function normalizeCurrencyCode(input: string): string {
  const upper = (input || "").toUpperCase();
  if (upper === "GBX" || upper === "GBP" || upper === "GBp") return "GBP";
  return upper;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  positions: [],
  processedTransactions: [],
  holdingsMap: {},
  calculatedIsins: {},
  errors: {},
  ratesToUSD: { USD: 1 },
  investedUSD: 0,
  totalCurrentValueUSD: 0,
  lastPriceUpdate: null,
  isCalculating: false,

  initFromLocalStorage: () => {
    if (!hasPortfolioData()) return;
    const data = loadPortfolioFromLocalStorage();
    const initialHoldings: Record<string, Position> = {};
    data.portfolioSummary.forEach((p) => {
      initialHoldings[p.isin] = { ...p };
    });
    set({
      positions: data.portfolioSummary,
      processedTransactions: data.processedTransactions,
      holdingsMap: initialHoldings,
      calculatedIsins: {},
      investedUSD: 0,
      totalCurrentValueUSD: 0,
    });
  },

  startCalculations: async () => {
    const { positions, ratesToUSD } = get();
    if (!positions.length) return;
    set({ isCalculating: true });

    // Ensure we have EUR->USD rate pre-fetched for header display
    const currencies = Array.from(
      new Set([
        ...positions.map((p) => normalizeCurrencyCode(p.currency)),
        "EUR",
      ])
    ).filter((c) => c !== "USD");

    // Fetch missing currency rates to USD
    await Promise.all(
      currencies
        .filter((c) => !ratesToUSD[c])
        .map(async (cur) => {
          try {
            const rate = await getExchangeRate(cur, "USD");
            set((s) => ({
              ratesToUSD: { ...s.ratesToUSD, [cur]: rate, USD: 1 },
            }));
          } catch {
            // best-effort; leave unset
          }
        })
    );

    // Fetch prices for each position concurrently and update holdings map progressively
    await Promise.allSettled(
      positions.map(async (position) => {
        try {
          const price = await getStockPrice(position.isin);
          const priceCurrencyRaw = price.currency ?? "USD";
          const normalizedPriceCurrency =
            normalizeCurrencyCode(priceCurrencyRaw);

          let ratePriceToUSD = 1;
          if (normalizedPriceCurrency !== "USD") {
            let r = get().ratesToUSD[normalizedPriceCurrency];
            if (!r) {
              r = await getExchangeRate(normalizedPriceCurrency, "USD");
              set((s) => ({
                ratesToUSD: {
                  ...s.ratesToUSD,
                  [normalizedPriceCurrency]: r,
                  USD: 1,
                },
              }));
            }
            ratePriceToUSD = r;
          }

          const priceNumberNormalized =
            priceCurrencyRaw === "GBp" || priceCurrencyRaw === "GBX"
              ? price.price / 100
              : price.price;
          const currentPriceUSD = priceNumberNormalized * ratePriceToUSD;
          const currentValueUSD = position.totalShares * currentPriceUSD;

          set((s) => ({
            holdingsMap: {
              ...s.holdingsMap,
              [position.isin]: {
                ...s.holdingsMap[position.isin],
                currentValue: currentValueUSD,
                currentPrice: price.price,
                currentPriceCurrency: price.currency,
              },
            },
            calculatedIsins: { ...s.calculatedIsins, [position.isin]: true },
          }));
        } catch (e: any) {
          // On error, mark calculated with fallback to invested value in USD
          // Use position currency rate to USD (best-effort)
          let rateToUSD = 1;
          const normalized = normalizeCurrencyCode(position.currency);
          if (normalized !== "USD") {
            try {
              let r = get().ratesToUSD[normalized];
              if (!r) {
                r = await getExchangeRate(normalized, "USD");
                set((s) => ({
                  ratesToUSD: { ...s.ratesToUSD, [normalized]: r, USD: 1 },
                }));
              }
              rateToUSD = r;
            } catch {
              rateToUSD = 1;
            }
          }
          const fallbackValueUSD =
            position.totalShares * position.averagePrice * rateToUSD;
          set((s) => ({
            holdingsMap: {
              ...s.holdingsMap,
              [position.isin]: {
                ...s.holdingsMap[position.isin],
                currentValue: fallbackValueUSD,
                currentPrice: position.averagePrice,
                currentPriceCurrency: position.currency,
              },
            },
            calculatedIsins: { ...s.calculatedIsins, [position.isin]: true },
            errors: {
              ...s.errors,
              [position.isin]: e?.message || "Price fetch failed",
            },
          }));
        }
      })
    );

    // Compute totals only when all are calculated
    const allDone = get().isAllCalculated();
    if (allDone) {
      const { holdingsMap } = get();
      const totalCurrentValueUSD = Object.values(holdingsMap).reduce(
        (sum, p) => sum + (p.currentValue || 0),
        0
      );

      // Invested in USD across all positions
      const investedUSD = get().positions.reduce((sum, p) => {
        const cur = normalizeCurrencyCode(p.currency);
        const rate = cur === "USD" ? 1 : get().ratesToUSD[cur] || 1;
        return sum + p.totalShares * p.averagePrice * rate;
      }, 0);

      set({
        totalCurrentValueUSD,
        investedUSD,
        lastPriceUpdate: new Date(),
        isCalculating: false,
      });
    } else {
      set({ isCalculating: false });
    }
  },

  isAllCalculated: () => {
    const { positions, calculatedIsins } = get();
    if (!positions.length) return false;
    return positions.every((p) => calculatedIsins[p.isin]);
  },

  convertCurrency: (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number => {
    if (fromCurrency === toCurrency) return amount;
    const normalize = (cur: string) =>
      cur === "GBp" || cur === "GBX" ? "GBP" : cur;
    const from = normalize(fromCurrency);
    const to = normalize(toCurrency);
    const rates = get().ratesToUSD;
    const fromRateToUSD = from === "USD" ? 1 : rates[from] || 1;
    const toRateToUSD = to === "USD" ? 1 : rates[to] || 1;
    const baseAmount =
      fromCurrency === "GBp" || fromCurrency === "GBX" ? amount / 100 : amount;
    const amountInUSD = baseAmount * fromRateToUSD;
    if (to === "USD") return amountInUSD;
    return amountInUSD / toRateToUSD;
  },

  getTransactionsForStock: (isin: string) => {
    const { processedTransactions } = get();
    return processedTransactions.filter((t) => t.isin === isin);
  },
}));

