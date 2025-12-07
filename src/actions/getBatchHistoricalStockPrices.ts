"use server";

import yahooFinance from "yahoo-finance2";

interface HistoricalPriceResult {
  ticker: string;
  price: number;
  currency: string;
}

interface BatchHistoricalPriceResult {
  [isin: string]: {
    [date: string]: HistoricalPriceResult | null;
  };
}

/**
 * Fetches historical prices for multiple stocks over a date range in a single batch.
 * This dramatically reduces API calls by fetching entire date ranges instead of individual dates.
 *
 * @param isinTickerMap - Map of ISIN to ticker (use cached tickers from store)
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param targetDates - Array of specific dates to extract prices for (YYYY-MM-DD format)
 * @returns Map of ISIN -> date -> price result
 */
export async function getBatchHistoricalStockPrices(
  isinTickerMap: Record<string, string>,
  startDate: string,
  endDate: string,
  targetDates: string[]
): Promise<BatchHistoricalPriceResult> {
  const result: BatchHistoricalPriceResult = {};

  // Initialize result structure
  Object.keys(isinTickerMap).forEach((isin) => {
    result[isin] = {};
    targetDates.forEach((date) => {
      result[isin][date] = null;
    });
  });

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  // Go back 5 days from start to ensure we capture trading days
  startDateObj.setDate(startDateObj.getDate() - 5);
  // Go one day past end to ensure we capture the end day if it's a trading day
  endDateObj.setDate(endDateObj.getDate() + 1);

  const period1Timestamp = Math.floor(startDateObj.getTime() / 1000);
  const period2Timestamp = Math.floor(endDateObj.getTime() / 1000);

  const batchStartTime = performance.now();
  console.log(
    `[getBatchHistoricalStockPrices] 🚀 Starting batch fetch for ${
      Object.keys(isinTickerMap).length
    } stocks, ${targetDates.length} dates`
  );

  // Fetch historical data for each stock concurrently
  await Promise.allSettled(
    Object.entries(isinTickerMap).map(async ([isin, ticker]) => {
      const stockStartTime = performance.now();

      if (!ticker) {
        console.log(
          `[getBatchHistoricalStockPrices] ⏭️ No ticker for ISIN ${isin}, skipping`
        );
        return;
      }

      try {
        console.log(
          `[getBatchHistoricalStockPrices] 🔄 Fetching ${isin} (${ticker}) from ${startDate} to ${endDate}`
        );

        const chartStartTime = performance.now();
        const chartResult = await yahooFinance.chart(ticker, {
          period1: period1Timestamp,
          period2: period2Timestamp,
          interval: "1d", // Daily interval
        });
        const chartTime = performance.now() - chartStartTime;
        console.log(
          `[getBatchHistoricalStockPrices] ✅ Chart fetched for ${isin} (${ticker}) in ${chartTime.toFixed(
            2
          )}ms, ${chartResult.quotes.length} data points`
        );

        const historicalData = chartResult.quotes;

        if (!historicalData || historicalData.length === 0) {
          console.log(
            `[getBatchHistoricalStockPrices] No chart data found for ${ticker} in the specified period.`
          );
          return;
        }

        // Extract prices for each target date
        targetDates.forEach((targetDate) => {
          const targetDateObj = new Date(targetDate);
          let priceEntry = null;
          let minDiff = Infinity;

          // Find the closest available closing price to the target date
          for (const entry of historicalData) {
            if (entry.date && entry.close) {
              const entryDate = entry.date.toISOString().split("T")[0];
              const diff = Math.abs(
                new Date(entryDate).getTime() - targetDateObj.getTime()
              );

              if (entryDate === targetDate) {
                priceEntry = entry;
                break; // Found exact match, prioritize it
              }

              if (diff < minDiff) {
                minDiff = diff;
                priceEntry = entry;
              }
            }
          }

          if (priceEntry && priceEntry.close) {
            result[isin][targetDate] = {
              ticker,
              price: priceEntry.close,
              currency: chartResult.meta.currency || "USD",
            };
          } else {
            console.log(
              `[getBatchHistoricalStockPrices] ⚠️ No suitable price found for ${isin} (${ticker}) on ${targetDate}`
            );
          }
        });

        const stockTime = performance.now() - stockStartTime;
        const pricesFound = targetDates.filter(
          (d) => result[isin][d] !== null
        ).length;
        console.log(
          `[getBatchHistoricalStockPrices] ✅ ${isin} (${ticker}): ${pricesFound}/${
            targetDates.length
          } prices found in ${stockTime.toFixed(2)}ms`
        );
      } catch (error) {
        const stockTime = performance.now() - stockStartTime;
        console.error(
          `[getBatchHistoricalStockPrices] ❌ Error fetching ${isin} (${ticker}) after ${stockTime.toFixed(
            2
          )}ms:`,
          error
        );
      }
    })
  );

  const batchTime = performance.now() - batchStartTime;
  const totalPrices = Object.values(result).reduce(
    (sum, dates) => sum + Object.values(dates).filter((p) => p !== null).length,
    0
  );
  console.log(
    `[getBatchHistoricalStockPrices] ✅ Batch complete: ${totalPrices} prices fetched in ${batchTime.toFixed(
      2
    )}ms`
  );

  return result;
}
