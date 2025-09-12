import yahooFinance from "yahoo-finance2";

const results = await yahooFinance.search("US98945L2043");
// const results = await yahooFinance.search("US98945L1052");
console.log("getStockPrice", results);

if (!results.quotes.length || !results.quotes[0]) {
  throw new Error("No stock found");
}

const stock = results.quotes[0];
if (!stock.isYahooFinance) {
  throw new Error(`Not a Yahoo Finance stock: ${stock.name}`);
}

const ticker = stock.symbol;
console.log("ticker", ticker);
const quote = await yahooFinance.quote(ticker);

if (!quote.regularMarketPrice) {
  throw new Error(`No price found for ${ticker}`);
}

console.log(quote);
