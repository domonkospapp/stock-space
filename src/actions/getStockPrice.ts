"use server";

import yahooFinance from "yahoo-finance2";

export default async function getStockPrice(isin: string) {
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
}
