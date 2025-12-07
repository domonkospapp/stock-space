"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Position, Transaction, MonthlyHoldingValue } from "utils/types";
import getStockPrice from "../actions/getStockPrice";
import getExchangeRate from "../actions/getExchangeRate";
import { calculateMonthlyHoldings } from "../utils/transactions/calculateMonthlyHoldings";
import { getHistoricalStockPrice } from "../actions/getHistoricalStockPrice";
import { getBatchHistoricalStockPrices } from "../actions/getBatchHistoricalStockPrices";
import { shouldFetchMarketData, isBrowserOnline } from "../utils/marketUtils";

type PortfolioState = {
  positions: Position[];
  processedTransactions: Transaction[];
  monthlyHoldingValues: MonthlyHoldingValue[];
  holdingsMap: Record<string, Position>;
  calculatedIsins: Record<string, boolean>;
  errors: Record<string, string | undefined>;
  ratesToUSD: Record<string, number>;
  tickerMap: Record<string, string>; // ISIN -> ticker cache
  inFlightRequests: Set<string>; // Track in-flight API requests to prevent duplicates
  investedUSD: number;
  totalCurrentValueUSD: number;
  roundedTotalUSD: number;
  lastPriceUpdate: Date | null;
  lastGrowthDataUpdate: Date | null;
  isCalculating: boolean;
  isGrowthDataCalculating: boolean;
  setPortfolioData: (
    positions: Position[],
    transactions: Transaction[]
  ) => void;
  clearAllData: () => void;
  startCalculations: () => Promise<void>;
  startGrowthDataCalculations: (
    processedTransactions: Transaction[],
    selectedCurrency: string,
    convertCurrency: (
      amount: number,
      fromCurrency: string,
      toCurrency: string
    ) => number
  ) => Promise<void>;
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

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      positions: [],
      processedTransactions: [],
      monthlyHoldingValues: [],
      holdingsMap: {},
      calculatedIsins: {},
      errors: {},
      ratesToUSD: { USD: 1 },
      tickerMap: {},
      inFlightRequests: new Set<string>(),
      investedUSD: 0,
      totalCurrentValueUSD: 0,
      roundedTotalUSD: 0,
      lastPriceUpdate: null,
      lastGrowthDataUpdate: null,
      isCalculating: false,
      isGrowthDataCalculating: false,

      setPortfolioData: (
        positions: Position[],
        transactions: Transaction[]
      ) => {
        const initialHoldings: Record<string, Position> = {};
        positions.forEach((p) => {
          initialHoldings[p.isin] = { ...p };
        });

        set({
          positions,
          processedTransactions: transactions,
          holdingsMap: initialHoldings,
          calculatedIsins: {},
          investedUSD: 0,
          totalCurrentValueUSD: 0,
        });
      },

      clearAllData: () => {
        set({
          positions: [],
          processedTransactions: [],
          holdingsMap: {},
          calculatedIsins: {},
          errors: {},
          ratesToUSD: { USD: 1 },
          tickerMap: {},
          inFlightRequests: new Set<string>(),
          investedUSD: 0,
          totalCurrentValueUSD: 0,
          roundedTotalUSD: 0,
          lastPriceUpdate: null,
          lastGrowthDataUpdate: null,
          isCalculating: false,
          isGrowthDataCalculating: false,
          monthlyHoldingValues: [],
        });
      },

      startCalculations: async () => {
        const calculationStartTime = performance.now();
        const { positions, ratesToUSD, holdingsMap, tickerMap } = get();

        console.log(
          `[startCalculations] 🚀 Starting calculations for ${positions.length} positions`
        );

        if (!positions.length) {
          console.log(`[startCalculations] ⏭️ No positions to calculate`);
          return;
        }

        // Check if we have existing data
        const hasExistingData = Object.keys(holdingsMap).length > 0;
        const cachedTickersCount = Object.keys(tickerMap).length;
        const hasTickersInHoldings = Object.values(holdingsMap).some(
          (h) => h.ticker
        );
        const { lastPriceUpdate } = get();

        console.log(
          `[startCalculations] 📊 Stats: ${cachedTickersCount} cached tickers, ${
            Object.keys(holdingsMap).length
          } existing holdings, tickers in holdings: ${hasTickersInHoldings}`
        );

        // Determine if we need to fetch:
        // 1. No tickers cached at all (need to populate cache)
        // 2. No tickers in holdings (need to fetch prices)
        // 3. Data is stale (older than 1 hour)
        // 4. Markets are open (always fetch when markets are open)
        const needsTickerCache =
          cachedTickersCount === 0 && !hasTickersInHoldings;
        const isDataStale =
          !lastPriceUpdate ||
          Date.now() - lastPriceUpdate.getTime() > 60 * 60 * 1000; // 1 hour
        const marketsOpen = shouldFetchMarketData();
        const browserOnline = isBrowserOnline();
        // Only fetch if browser is online AND (we need tickers OR data is stale OR markets are open)
        const shouldFetch =
          browserOnline && (needsTickerCache || isDataStale || marketsOpen);

        // If we have existing data but don't need to fetch, skip
        if (hasExistingData && !shouldFetch) {
          console.log(
            `[startCalculations] ⏭️ Skipping fetch - browser online: ${browserOnline}, markets closed: ${!marketsOpen}, data fresh: ${!isDataStale}, has tickers: ${hasTickersInHoldings}, needs cache: ${needsTickerCache}`
          );
          return;
        }

        if (!browserOnline) {
          console.log(
            `[startCalculations] ⏭️ Skipping fetch - browser is offline`
          );
          return;
        }

        if (needsTickerCache) {
          console.log(
            `[startCalculations] 🔄 Need to populate ticker cache (${cachedTickersCount} cached, ${
              hasTickersInHoldings ? "has" : "no"
            } tickers in holdings)`
          );
        }
        if (isDataStale) {
          console.log(
            `[startCalculations] 🔄 Data is stale, last update: ${lastPriceUpdate?.toISOString()}`
          );
        }

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
        // Only update if fetch succeeds - preserve existing data on failure
        const fetchStartTime = performance.now();
        let cacheHits = 0;
        let cacheMisses = 0;

        await Promise.allSettled(
          positions.map(async (position) => {
            const positionStartTime = performance.now();
            const existingHolding = get().holdingsMap[position.isin];

            // Check for request deduplication
            const { inFlightRequests, tickerMap } = get();
            if (inFlightRequests.has(position.isin)) {
              console.log(
                `[startCalculations] ⏭️ Request for ${position.isin} already in flight, skipping duplicate`
              );
              return;
            }

            // Mark request as in-flight
            set((s) => ({
              inFlightRequests: new Set(s.inFlightRequests).add(position.isin),
            }));

            try {
              // Try to get ticker from holdingsMap first, then tickerMap
              let cachedTicker =
                existingHolding?.ticker || tickerMap[position.isin];

              if (cachedTicker) {
                cacheHits++;
                console.log(
                  `[startCalculations] ✅ Cache HIT for ${position.isin}: ${cachedTicker}`
                );
              } else {
                cacheMisses++;
                console.log(
                  `[startCalculations] ❌ Cache MISS for ${position.isin}, will search`
                );
              }

              const price = await getStockPrice(position.isin, cachedTicker);
              const positionTime = performance.now() - positionStartTime;
              console.log(
                `[startCalculations] ✅ Completed ${
                  position.isin
                } in ${positionTime.toFixed(2)}ms`
              );
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
                    ticker: price.ticker,
                  },
                },
                calculatedIsins: {
                  ...s.calculatedIsins,
                  [position.isin]: true,
                },
                tickerMap: {
                  ...s.tickerMap,
                  [position.isin]: price.ticker,
                },
                inFlightRequests: (() => {
                  const newSet = new Set(s.inFlightRequests);
                  newSet.delete(position.isin);
                  return newSet;
                })(),
              }));
            } catch (e: any) {
              // Remove from in-flight requests
              set((s) => {
                const newSet = new Set(s.inFlightRequests);
                newSet.delete(position.isin);
                return { inFlightRequests: newSet };
              });

              // If we have existing data for this position, preserve it instead of overwriting
              if (existingHolding && existingHolding.currentPrice) {
                console.log(
                  `[startCalculations] Preserving existing data for ${position.isin} due to fetch error:`,
                  e?.message
                );
                // Mark as calculated but keep existing data
                set((s) => ({
                  calculatedIsins: {
                    ...s.calculatedIsins,
                    [position.isin]: true,
                  },
                  errors: {
                    ...s.errors,
                    [position.isin]: e?.message || "Price fetch failed",
                  },
                }));
                return;
              }

              // On error with no existing data, mark calculated with fallback to invested value in USD
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
                tickerMap: {
                  ...s.tickerMap,
                  [position.isin]: fallbackTicker,
                },
                calculatedIsins: {
                  ...s.calculatedIsins,
                  [position.isin]: true,
                },
                errors: {
                  ...s.errors,
                  [position.isin]: e?.message || "Price fetch failed",
                },
                inFlightRequests: (() => {
                  const newSet = new Set(s.inFlightRequests);
                  newSet.delete(position.isin);
                  return newSet;
                })(),
              }));
            }
          })
        );

        // Compute totals only when all are calculated
        const fetchTime = performance.now() - fetchStartTime;
        const allDone = get().isAllCalculated();

        console.log(
          `[startCalculations] 📊 Fetch stats: ${cacheHits} cache hits, ${cacheMisses} cache misses, ${fetchTime.toFixed(
            2
          )}ms total fetch time`
        );

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

          const totalTime = performance.now() - calculationStartTime;
          console.log(
            `[startCalculations] ✅ All calculations completed in ${totalTime.toFixed(
              2
            )}ms`
          );

          set({
            totalCurrentValueUSD,
            roundedTotalUSD: Math.round(totalCurrentValueUSD),
            investedUSD,
            lastPriceUpdate: new Date(),
            isCalculating: false,
          });
        } else {
          const totalTime = performance.now() - calculationStartTime;
          console.warn(
            `[startCalculations] ⚠️ Calculations incomplete after ${totalTime.toFixed(
              2
            )}ms`
          );
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
          fromCurrency === "GBp" || fromCurrency === "GBX"
            ? amount / 100
            : amount;
        const amountInUSD = baseAmount * fromRateToUSD;
        if (to === "USD") return amountInUSD;
        return amountInUSD / toRateToUSD;
      },

      getTransactionsForStock: (isin: string) => {
        const { processedTransactions } = get();
        return processedTransactions.filter((t) => t.isin === isin);
      },

      startGrowthDataCalculations: async (
        processedTransactions: Transaction[],
        selectedCurrency: string,
        convertCurrency: (
          amount: number,
          fromCurrency: string,
          toCurrency: string
        ) => number
      ) => {
        const growthStartTime = performance.now();
        const { monthlyHoldingValues, holdingsMap, tickerMap } = get();

        console.log(
          `[startGrowthDataCalculations] 🚀 Starting growth data calculations`
        );

        // Check if we have existing data
        const hasExistingData = monthlyHoldingValues.length > 0;

        // If we have existing data and browser is offline, don't fetch
        // (Historical data fetching doesn't depend on market hours)
        if (hasExistingData && !isBrowserOnline()) {
          console.log(
            `[startGrowthDataCalculations] ⏭️ Skipping fetch - browser offline`
          );
          return;
        }

        set({ isGrowthDataCalculating: true });

        const monthlyHoldings = calculateMonthlyHoldings(processedTransactions);
        const newMonthlyHoldingValues: MonthlyHoldingValue[] = [];

        const currentMonthString = `${new Date().getFullYear()}-${(
          new Date().getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}`;

        // Collect all unique ISINs and target dates for batch fetching
        const uniqueIsins = new Set<string>();
        const targetDates: string[] = [];
        const dateToMonthMap: Record<string, string> = {}; // date -> month string

        for (const monthData of monthlyHoldings) {
          const [year, month] = monthData.date.split("-");
          let dateToFetch: string;
          if (monthData.date === currentMonthString) {
            dateToFetch = new Date().toISOString().split("T")[0];
          } else {
            dateToFetch = new Date(parseInt(year), parseInt(month), 0)
              .toISOString()
              .split("T")[0];
          }

          if (!targetDates.includes(dateToFetch)) {
            targetDates.push(dateToFetch);
            dateToMonthMap[dateToFetch] = monthData.date;
          }

          monthData.holdings.forEach((holding) => {
            uniqueIsins.add(holding.isin);
          });
        }

        // Build ISIN -> ticker map from cached data
        const isinTickerMap: Record<string, string> = {};
        let tickerCacheHits = 0;
        let tickerCacheMisses = 0;

        Array.from(uniqueIsins).forEach((isin) => {
          // Try holdingsMap first, then tickerMap
          const ticker = holdingsMap[isin]?.ticker || tickerMap[isin];
          if (ticker) {
            isinTickerMap[isin] = ticker;
            tickerCacheHits++;
          } else {
            tickerCacheMisses++;
            console.log(
              `[startGrowthDataCalculations] ⚠️ No cached ticker for ${isin}`
            );
          }
        });

        console.log(
          `[startGrowthDataCalculations] 📊 Ticker cache: ${tickerCacheHits} hits, ${tickerCacheMisses} misses`
        );
        console.log(
          `[startGrowthDataCalculations] 📅 Fetching ${targetDates.length} dates for ${uniqueIsins.size} stocks`
        );

        // Determine date range for batch fetch
        if (targetDates.length === 0) {
          console.log(
            `[startGrowthDataCalculations] ⏭️ No target dates to fetch`
          );
          set({ isGrowthDataCalculating: false });
          return;
        }

        const sortedDates = [...targetDates].sort();
        const startDate = sortedDates[0];
        const endDate = sortedDates[sortedDates.length - 1];

        console.log(
          `[startGrowthDataCalculations] 📅 Date range: ${startDate} to ${endDate}`
        );

        // Batch fetch all historical prices
        let batchPrices: Record<
          string,
          Record<
            string,
            { ticker: string; price: number; currency: string } | null
          >
        > = {};

        if (Object.keys(isinTickerMap).length > 0) {
          try {
            const batchStartTime = performance.now();
            console.log(
              `[startGrowthDataCalculations] 🔄 Starting batch fetch for ${
                Object.keys(isinTickerMap).length
              } stocks...`
            );

            batchPrices = await getBatchHistoricalStockPrices(
              isinTickerMap,
              startDate,
              endDate,
              targetDates
            );

            const batchTime = performance.now() - batchStartTime;
            const pricesFetched = Object.values(batchPrices).reduce(
              (sum, dates) =>
                sum + Object.values(dates).filter((p) => p !== null).length,
              0
            );
            console.log(
              `[startGrowthDataCalculations] ✅ Batch fetch completed in ${batchTime.toFixed(
                2
              )}ms, fetched ${pricesFetched} prices`
            );
          } catch (error) {
            console.error(
              `[startGrowthDataCalculations] ❌ Error in batch fetch:`,
              error
            );
          }
        } else {
          console.warn(
            `[startGrowthDataCalculations] ⚠️ No tickers available for batch fetch`
          );
        }

        // Process monthly holdings using batch-fetched data
        for (const monthData of monthlyHoldings) {
          let totalMonthlyValue = 0;

          // Check if we have existing data for this month
          const existingMonthData = monthlyHoldingValues.find(
            (m) => m.date === monthData.date
          );

          const [year, month] = monthData.date.split("-");
          let dateToFetch: string;
          if (monthData.date === currentMonthString) {
            dateToFetch = new Date().toISOString().split("T")[0];
          } else {
            dateToFetch = new Date(parseInt(year), parseInt(month), 0)
              .toISOString()
              .split("T")[0];
          }

          const holdingsWithValues = monthData.holdings.map((holding) => {
            // Check if we have existing data for this holding
            const existingHolding = existingMonthData?.holdings.find(
              (h) => h.isin === holding.isin
            );

            // Get price from batch results
            const batchPriceResult = batchPrices[holding.isin]?.[dateToFetch];

            // If batch fetch didn't work, try individual fetch with cached ticker
            let historicalPrice: {
              ticker: string;
              price: number;
              currency: string;
            } | null = null;

            if (batchPriceResult) {
              historicalPrice = batchPriceResult;
            } else if (!existingHolding || !existingHolding.price) {
              // Only try individual fetch if we don't have existing data
              // This will use cached ticker if available
              const cachedTicker =
                holdingsMap[holding.isin]?.ticker || tickerMap[holding.isin];
              // Note: We can't await here in map, so we'll handle this differently
              // For now, if batch fetch failed, we'll preserve existing data or use null
            }

            // Use existing data if batch fetch failed and we have it
            if (!historicalPrice && existingHolding && existingHolding.price) {
              return existingHolding;
            }

            let convertedPrice = historicalPrice?.price || null;
            let priceCurrency = historicalPrice?.currency || null;

            const originalPrice = historicalPrice?.price || null;
            const originalPriceCurrency = historicalPrice?.currency || null;

            if (
              convertedPrice &&
              priceCurrency &&
              priceCurrency !== selectedCurrency
            ) {
              convertedPrice = convertCurrency(
                convertedPrice,
                priceCurrency,
                selectedCurrency
              );
              priceCurrency = selectedCurrency;
            }

            const value = convertedPrice
              ? holding.totalShares * convertedPrice
              : null;
            if (value) {
              totalMonthlyValue += value;
            }
            return {
              ...holding,
              value,
              currency: priceCurrency,
              price: convertedPrice, // Converted historical price
              originalPrice: originalPrice, // Original historical price
              originalPriceCurrency: originalPriceCurrency, // Original currency of the historical price
            };
          });

          // If we have existing data and couldn't fetch new data, preserve the existing month data
          if (
            existingMonthData &&
            totalMonthlyValue === 0 &&
            existingMonthData.totalMonthlyValue > 0
          ) {
            newMonthlyHoldingValues.push(existingMonthData);
          } else {
            newMonthlyHoldingValues.push({
              date: monthData.date,
              totalMonthlyValue,
              holdings: holdingsWithValues,
            });
          }
        }

        // Only update if we successfully fetched some data, otherwise preserve existing
        const totalTime = performance.now() - growthStartTime;

        if (newMonthlyHoldingValues.length > 0) {
          console.log(
            `[startGrowthDataCalculations] ✅ Growth calculations completed in ${totalTime.toFixed(
              2
            )}ms`
          );
          set({
            monthlyHoldingValues: newMonthlyHoldingValues,
            lastGrowthDataUpdate: new Date(),
            isGrowthDataCalculating: false,
          });
        } else {
          console.warn(
            `[startGrowthDataCalculations] ⚠️ No new data fetched after ${totalTime.toFixed(
              2
            )}ms`
          );
          // If no new data was fetched, preserve existing data
          set({
            isGrowthDataCalculating: false,
          });
        }
      },
    }),
    {
      name: "portfolio-storage",
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          if (key === "lastPriceUpdate" || key === "lastGrowthDataUpdate") {
            if (
              value &&
              (typeof value === "string" ||
                typeof value === "number" ||
                value instanceof Date)
            ) {
              return new Date(value);
            }
            return null;
          }
          if (key === "inFlightRequests") {
            // Don't persist in-flight requests, always start fresh
            return new Set<string>();
          }
          return value;
        },
      }),
      partialize: (state) => ({
        positions: state.positions,
        processedTransactions: state.processedTransactions,
        monthlyHoldingValues: state.monthlyHoldingValues,
        holdingsMap: state.holdingsMap,
        calculatedIsins: state.calculatedIsins,
        ratesToUSD: state.ratesToUSD,
        tickerMap: state.tickerMap,
        investedUSD: state.investedUSD,
        totalCurrentValueUSD: state.totalCurrentValueUSD,
        roundedTotalUSD: state.roundedTotalUSD,
        lastPriceUpdate: state.lastPriceUpdate,
        lastGrowthDataUpdate: state.lastGrowthDataUpdate,
      }),
    }
  )
);
