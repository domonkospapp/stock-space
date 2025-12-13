"use server";

import yahooFinance from "yahoo-finance2";

/**
 * Helper function to extract price from quote with fallback to previous close
 * when market is closed (e.g., weekends)
 */
function getPriceFromQuote(quote: any): number | null {
  // Try current market price first
  if (quote.regularMarketPrice != null) {
    return quote.regularMarketPrice;
  }

  // Fall back to previous close price when market is closed
  if (quote.regularMarketPreviousClose != null) {
    console.log(
      `[getStockPrice] 📅 Market closed, using previous close price: ${quote.regularMarketPreviousClose}`
    );
    return quote.regularMarketPreviousClose;
  }

  return null;
}

export default async function getStockPrice(isin: string, ticker?: string) {
  const startTime = performance.now();

  // If ticker is provided, skip search and go directly to quote
  if (ticker) {
    console.log(
      `[getStockPrice] ⚡ Using cached ticker for ${isin}: ${ticker} (skipping search)`
    );
    try {
      const quoteStartTime = performance.now();
      const quote = await yahooFinance.quote(ticker);
      const quoteTime = performance.now() - quoteStartTime;
      console.log(
        `[getStockPrice] ✅ Quote fetched for ${isin} (${ticker}) in ${quoteTime.toFixed(
          2
        )}ms`
      );

      const price = getPriceFromQuote(quote);
      if (price === null) {
        throw new Error(`No price found for ${ticker}`);
      }

      const totalTime = performance.now() - startTime;
      console.log(
        `[getStockPrice] ✅ Total time for ${isin}: ${totalTime.toFixed(
          2
        )}ms (cached ticker)`
      );

      return {
        ticker,
        price,
        currency: quote.currency,
      };
    } catch (error) {
      // If quote fails with provided ticker, fall through to search
      console.warn(
        `[getStockPrice] ⚠️ Quote failed for cached ticker ${ticker} (${isin}), falling back to search:`,
        error
      );
    }
  } else {
    console.log(
      `[getStockPrice] 🔍 No cached ticker for ${isin}, starting search...`
    );
  }

  try {
    const searchStartTime = performance.now();
    const results = await yahooFinance.search(isin);
    const searchTime = performance.now() - searchStartTime;
    console.log(
      `[getStockPrice] 🔍 Search completed for ${isin} in ${searchTime.toFixed(
        2
      )}ms, found ${results.quotes.length} results`
    );

    if (!results.quotes.length || !results.quotes[0]) {
      throw new Error("No stock found");
    }

    const stock = results.quotes[0];
    if (!stock.isYahooFinance) {
      throw new Error(`Not a Yahoo Finance stock: ${stock.name}`);
    }

    const foundTicker = stock.symbol;
    console.log(`[getStockPrice] 📍 Found ticker ${foundTicker} for ${isin}`);

    const quoteStartTime = performance.now();
    const quote = await yahooFinance.quote(foundTicker);
    const quoteTime = performance.now() - quoteStartTime;
    console.log(
      `[getStockPrice] 💰 Quote fetched for ${foundTicker} in ${quoteTime.toFixed(
        2
      )}ms`
    );

    const price = getPriceFromQuote(quote);
    if (price === null) {
      throw new Error(`No price found for ${foundTicker}`);
    }

    const totalTime = performance.now() - startTime;
    console.log(
      `[getStockPrice] ✅ Total time for ${isin}: ${totalTime.toFixed(
        2
      )}ms (search + quote)`
    );

    return {
      ticker: foundTicker,
      price,
      currency: quote.currency,
    };
  } catch (error) {
    // Try alternative search methods for better ticker discovery
    console.warn(
      `[getStockPrice] ⚠️ Primary search failed for ${isin}, trying alternative search...`,
      error
    );

    // Try searching with just the company name part of the ISIN
    const isinParts = isin.split(".");
    if (isinParts.length > 0) {
      try {
        const companySearch = isinParts[0];
        console.log(
          `[getStockPrice] Attempting alternative search with: ${companySearch}`
        );
        const results = await yahooFinance.search(companySearch);
        console.log(
          `[getStockPrice] Alternative search results for ${companySearch}:`,
          results
        );

        if (results.quotes.length > 0) {
          const stock = results.quotes[0];
          if (stock.isYahooFinance && stock.symbol) {
            console.log(
              `[getStockPrice] Found ticker ${stock.symbol} via alternative search.`
            );
            const quote = await yahooFinance.quote(stock.symbol);
            const price = getPriceFromQuote(quote);
            if (price === null) {
              console.log(
                `[getStockPrice] No price found for ${stock.symbol} via alternative search.`
              );
              throw new Error(`No price found for ${stock.symbol}`);
            }
            return {
              ticker: stock.symbol,
              price,
              currency: quote.currency,
            };
          }
        }
        console.log(
          `[getStockPrice] Alternative search for ${companySearch} did not yield a valid Yahoo Finance stock.`
        );
      } catch (altError) {
        console.error(
          `[getStockPrice] Alternative search also failed for ${isin}:`,
          altError
        );
      }
    }

    // If all else fails, throw the original error
    throw error;
  }
}
