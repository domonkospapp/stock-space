"use client";

import { create } from "zustand";
import { Position, Transaction } from "utils/types";
import {
  hasPortfolioData,
  loadPortfolioFromLocalStorage,
  loadExchangeRates,
  loadCalculatedData,
  saveExchangeRates,
  saveCalculatedData,
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
  roundedTotalUSD: number;
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
  roundedTotalUSD: 0,
  lastPriceUpdate: null,
  isCalculating: false,

  initFromLocalStorage: () => {
    if (!hasPortfolioData()) return;

    // Load portfolio data
    const data = loadPortfolioFromLocalStorage();

    // Load cached exchange rates
    const cachedRates = loadExchangeRates();

    // Load cached calculated data
    const cachedData = loadCalculatedData();

    // If we have cached calculated data, use it
    const initialHoldings: Record<string, Position> = {};
    if (Object.keys(cachedData.holdingsMap).length > 0) {
      // Use cached holdings with all calculated prices
      data.portfolioSummary.forEach((p) => {
        initialHoldings[p.isin] = cachedData.holdingsMap[p.isin] || { ...p };
      });
    } else {
      // No cache, start with basic holdings
      data.portfolioSummary.forEach((p) => {
        initialHoldings[p.isin] = { ...p };
      });
    }

    // Calculate totals from cached data if available
    let totalCurrentValueUSD = 0;
    let investedUSD = 0;

    if (Object.keys(cachedData.calculatedIsins).length > 0) {
      totalCurrentValueUSD = Object.values(initialHoldings).reduce(
        (sum, p) => sum + (p.currentValue || 0),
        0
      );

      // Calculate invested with cached rates
      investedUSD = data.portfolioSummary.reduce((sum, p) => {
        const cur = normalizeCurrencyCode(p.currency);
        const rate = cur === "USD" ? 1 : cachedRates[cur] || 1;
        return sum + p.totalShares * p.averagePrice * rate;
      }, 0);
    }

    set({
      positions: data.portfolioSummary,
      processedTransactions: data.processedTransactions,
      holdingsMap: initialHoldings,
      calculatedIsins: cachedData.calculatedIsins,
      ratesToUSD: cachedRates,
      investedUSD,
      totalCurrentValueUSD,
      roundedTotalUSD: Math.round(totalCurrentValueUSD),
      lastPriceUpdate: cachedData.lastUpdate,
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
            const newRates = { ...get().ratesToUSD, [cur]: rate, USD: 1 };
            set({ ratesToUSD: newRates });
            saveExchangeRates(newRates);
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
              const newRates = {
                ...get().ratesToUSD,
                [normalizedPriceCurrency]: r,
                USD: 1,
              };
              set({ ratesToUSD: newRates });
              saveExchangeRates(newRates);
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
                ticker: price.ticker,
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
                const newRates = {
                  ...get().ratesToUSD,
                  [normalized]: r,
                  USD: 1,
                };
                set({ ratesToUSD: newRates });
                saveExchangeRates(newRates);
              }
              rateToUSD = r;
            } catch {
              rateToUSD = 1;
            }
          }
          const fallbackValueUSD =
            position.totalShares * position.averagePrice * rateToUSD;
          // Try to extract a better ticker from the company name
          let fallbackTicker = position.stockName;

          // Check if this looks like an ISIN (starts with letters followed by numbers)
          const isinPattern = /^[A-Z]{2}[0-9]+/;
          if (isinPattern.test(position.stockName)) {
            // This looks like an ISIN, try to find the company name from the original transaction data
            const { processedTransactions } = get();
            const matchingTransaction = processedTransactions.find(
              (t) => t.isin === position.isin
            );

            if (
              matchingTransaction &&
              matchingTransaction.stockName !== position.stockName
            ) {
              // Use the actual company name from the transaction
              const words = matchingTransaction.stockName.split(" ");
              if (words.length > 0) {
                let firstWord = words[0];
                firstWord = firstWord
                  .replace(/\.(COM|INC|CORP|LTD|LLC|ADR|AG|SA|NV|SE)$/i, "")
                  .replace(/[^A-Z0-9]/g, "")
                  .substring(0, 8);

                if (firstWord.length >= 2) {
                  fallbackTicker = firstWord;
                }
              }
            } else {
              // Fallback: take first 2-4 letters from ISIN
              const letters = position.stockName.match(/[A-Z]+/g);
              if (letters && letters.length > 0) {
                fallbackTicker = letters[0].substring(0, 4);
              }
            }
          } else {
            // Extract first word from company name for cleaner display
            const words = position.stockName.split(" ");
            if (words.length > 0) {
              // Take the first word and clean it up
              let firstWord = words[0];

              // Remove common suffixes and clean up
              firstWord = firstWord
                .replace(/\.(COM|INC|CORP|LTD|LLC|ADR|AG|SA|NV|SE)$/i, "") // Remove common company suffixes
                .replace(/[^A-Z0-9]/g, "") // Keep only letters and numbers
                .substring(0, 8); // Limit to 8 characters for readability

              if (firstWord.length >= 2) {
                fallbackTicker = firstWord;
              }
            }
          }

          set((s) => ({
            holdingsMap: {
              ...s.holdingsMap,
              [position.isin]: {
                ...s.holdingsMap[position.isin],
                currentValue: fallbackValueUSD,
                currentPrice: position.averagePrice,
                currentPriceCurrency: position.currency,
                ticker: fallbackTicker,
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
        roundedTotalUSD: Math.round(totalCurrentValueUSD),
        investedUSD,
        lastPriceUpdate: new Date(),
        isCalculating: false,
      });

      // Save calculated data to local storage
      const {
        holdingsMap: finalHoldingsMap,
        calculatedIsins: finalCalculatedIsins,
      } = get();
      saveCalculatedData(finalHoldingsMap, finalCalculatedIsins);
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
