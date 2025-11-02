"use server";

import yahooFinance from "yahoo-finance2";

export default async function getStockPrice(isin: string) {
  try {
    const results = await yahooFinance.search(isin);
    console.log("getStockPrice", results);

    if (!results.quotes.length || !results.quotes[0]) {
      throw new Error("No stock found");
    }

    const stock = results.quotes[0];
    if (!stock.isYahooFinance) {
      throw new Error(`Not a Yahoo Finance stock: ${stock.name}`);
    }

    const ticker = stock.symbol;

    const quote = await yahooFinance.quote(ticker);

    if (!quote.regularMarketPrice) {
      throw new Error(`No price found for ${ticker}`);
    }

    return {
      ticker,
      price: quote.regularMarketPrice,
      currency: quote.currency,
    };
  } catch (error) {
    // Try alternative search methods for better ticker discovery
    console.log(
      `Failed to find ticker for ISIN ${isin}, trying alternative search...`
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
            if (!quote.regularMarketPrice) {
              console.log(
                `[getStockPrice] No price found for ${stock.symbol} via alternative search.`
              );
              throw new Error(`No price found for ${stock.symbol}`);
            }
            return {
              ticker: stock.symbol,
              price: quote.regularMarketPrice,
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
