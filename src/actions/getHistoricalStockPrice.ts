"use server";

import yahooFinance from "yahoo-finance2";

interface HistoricalPriceResult {
  ticker: string;
  price: number;
  currency: string;
}

function cleanStockNameForSearch(stockName: string): string {
  let cleanedName = stockName;
  // Remove common suffixes and clean up
  cleanedName = cleanedName
    .replace(/\s(ADR|CORP|INC|LTD|LLC|AG|SA|NV|SE|PLC|GMBH|CO|HLDG)\.?$/i, "") // Remove common company suffixes more thoroughly
    .replace(/[^A-Z0-9\s]/gi, "") // Keep only letters, numbers, and spaces (case-insensitive)
    .trim();

  // If the cleaned name is too short or generic after cleaning, return original or empty
  if (cleanedName.length < 3 || /^(A|I|S)$/i.test(cleanedName)) {
    return stockName; // Return original if too generic, let Yahoo search handle it or fail gracefully
  }

  // Take up to the first few words, but avoid overly short results for multi-word names
  const words = cleanedName.split(" ").filter(Boolean); // Filter out empty strings
  if (words.length > 1 && words[0].length < 3) {
    return words.slice(0, 2).join(" "); // Take first two words if first is very short
  }
  return words.slice(0, 3).join(" "); // Otherwise take up to first 3 words
}

async function searchAndFetchHistoricalData(
  query: string,
  isin: string,
  date: string
): Promise<HistoricalPriceResult | null> {
  try {
    console.log(
      `[getHistoricalStockPrice] Searching Yahoo Finance for query: ${query}`
    );
    const results = await yahooFinance.search(query);
    console.log(
      `[getHistoricalStockPrice] Yahoo Finance Search Results for ${query}:`,
      results
    );

    if (!results.quotes.length) {
      console.log(
        `[getHistoricalStockPrice] No quotes found for query: ${query}`
      );
      return null;
    }

    const targetDateObj = new Date(date);
    const startDateObj = new Date(targetDateObj);
    startDateObj.setDate(targetDateObj.getDate() - 5); // Go back 5 days to ensure we capture a trading day
    const endDateObj = new Date(targetDateObj);
    endDateObj.setDate(targetDateObj.getDate() + 1); // Go one day past to ensure we capture the target day if it's a trading day

    const period1Timestamp = Math.floor(startDateObj.getTime() / 1000);
    const period2Timestamp = Math.floor(endDateObj.getTime() / 1000);

    for (const stock of results.quotes) {
      if (!stock.isYahooFinance || !stock.symbol) {
        const stockIdentifier = (stock as any).symbol || (stock as any).name || (stock as any).shortname || "unknown";
        console.log(
          `[getHistoricalStockPrice] Skipping non-Yahoo Finance or missing symbol stock: ${stockIdentifier}`
        );
        continue;
      }

      const ticker = stock.symbol;
      console.log(
        `[getHistoricalStockPrice] Attempting historical data for Ticker: ${ticker}`
      );

      try {
        console.log(
          `[getHistoricalStockPrice] Fetching historical chart data for ${ticker} from ${
            startDateObj.toISOString().split("T")[0]
          } to ${endDateObj.toISOString().split("T")[0]}`
        );

        const chartResult = await yahooFinance.chart(ticker, {
          period1: period1Timestamp,
          period2: period2Timestamp,
          interval: "1d", // Daily interval
        });

        console.log(
          `[getHistoricalStockPrice] Chart Data for ${ticker}:`,
          chartResult
        );

        const historicalData = chartResult.quotes;

        if (!historicalData || historicalData.length === 0) {
          console.log(
            `[getHistoricalStockPrice] No chart data found for ${ticker} in the specified period. Trying next ticker.`
          );
          continue; // Try the next ticker if no data is found
        }

        // Find the closest available closing price to the target date
        let priceEntry = null;
        let minDiff = Infinity;

        for (const entry of historicalData) {
          if (entry.date && entry.close) {
            const entryDate = entry.date.toISOString().split("T")[0];
            const diff = Math.abs(
              new Date(entryDate).getTime() - targetDateObj.getTime()
            );

            if (entryDate === date) {
              priceEntry = entry;
              break; // Found exact match, prioritize it
            }

            if (diff < minDiff) {
              minDiff = diff;
              priceEntry = entry;
            }
          }
        }

        if (!priceEntry || !priceEntry.close) {
          console.log(
            `[getHistoricalStockPrice] No suitable historical close price found for ${ticker} on or around ${date}. Trying next ticker.`
          );
          continue; // Try the next ticker if no suitable price is found
        }

        return {
          ticker,
          price: priceEntry.close,
          currency: chartResult.meta.currency || "USD", // Get currency from meta data
        };
      } catch (innerError) {
        console.error(
          `[getHistoricalStockPrice] Error fetching historical data for ticker ${ticker}:`,
          innerError
        );
        continue; // Continue to the next ticker on error
      }
    }
    return null; // No suitable historical price found after trying all quotes
  } catch (outerError) {
    console.error(
      `[getHistoricalStockPrice] Error during search or initial processing for query ${query}:`,
      outerError
    );
    return null;
  }
}

export async function getHistoricalStockPrice(
  isin: string,
  date: string, // YYYY-MM-DD format
  stockName: string // Add stockName parameter
): Promise<HistoricalPriceResult | null> {
  console.log(
    `[getHistoricalStockPrice] Attempting to fetch historical price for ISIN: ${isin}, Stock Name: ${stockName}, Date: ${date}`
  );

  // Primary search using the full ISIN
  let result = await searchAndFetchHistoricalData(isin, isin, date);
  if (result) {
    return result;
  }

  // Alternative search methods for better ticker discovery (ISIN parts)
  console.log(
    `[getHistoricalStockPrice] Primary ISIN search failed for ${isin}, trying alternative search with ISIN parts...`
  );
  const isinParts = isin.split(".");
  if (isinParts.length > 0) {
    const companySearch = isinParts[0];
    result = await searchAndFetchHistoricalData(companySearch, isin, date);
    if (result) {
      return result;
    }
  }

  // Alternative search methods using stockName
  console.log(
    `[getHistoricalStockPrice] ISIN-based searches failed for ${isin}, trying alternative search with stock name: ${stockName}...`
  );
  const cleanedStockName = cleanStockNameForSearch(stockName);
  if (cleanedStockName) {
    result = await searchAndFetchHistoricalData(cleanedStockName, isin, date);
    if (result) {
      return result;
    }
  }

  console.error(
    `[getHistoricalStockPrice] Could not find historical price for ISIN ${isin} (${stockName}) on ${date} with any available ticker.`
  );
  return null;
}
