import getStockPrice from "./actions/getStockPrice";
import processedTransactions from "./utils/transactions/processTransactions";
import { createPortfolioSummary } from "./utils/transactions/createPortfolioSummary";
import { CsvTransaction } from "./utils/types";

const ISIN = "US98945L2043";

// Test ISIN changing split functionality with real data
const testIsinChangingSplit = () => {
  const testTransactions: CsvTransaction[] = [
    // Pre-split transactions with old ISIN
    {
      date: "23.02.2022",
      stockName: "ZEPP HEALTH CORP. ADR",
      isin: "US98945L1052",
      amount: 120000,
      price: 9.405,
      currency: "EUR",
      transactionInfo: "WP-Eingang US98945L1052",
    },
    // Split transaction with ISIN change (reverse split 4:1)
    {
      date: "16.09.2024",
      stockName: "ZEPP HEALTH CORP. ADR",
      isin: "US98945L1052",
      amount: -120000,
      price: 0,
      currency: "EUR",
      transactionInfo: "Reverse Split im Verhältnis 4:1 in ISIN US98945L2043",
    },
    {
      date: "16.09.2024",
      stockName: "ZEPP HEALTH CORP. ADR",
      isin: "US98945L2043",
      amount: 30000,
      price: 0,
      currency: "EUR",
      transactionInfo: "Reverse Split im Verhältnis 4:1 in ISIN US98945L2043",
    },
    // Post-split transactions with new ISIN
    {
      date: "20.09.2024",
      stockName: "ZEPP HEALTH CORP. ADR",
      isin: "US98945L2043",
      amount: 1000,
      price: 37.619,
      currency: "EUR",
      transactionInfo: "Kauf",
    },
  ];

  const processed = processedTransactions(testTransactions);
  console.log("Processed transactions:", processed);

  // Verify that pre-split transactions now have the new ISIN
  const preSplitTransactions = processed.filter((t) => t.date === "23.02.2022");
  console.log(
    "Pre-split transactions with updated ISIN:",
    preSplitTransactions
  );

  // Verify that amounts were adjusted for the reverse split (4:1)
  // Original: 120,000 shares at 9.405 EUR
  // After 4:1 reverse split: 30,000 shares at 37.62 EUR (9.405 * 4)
  const expectedAmount = 30000; // 120000 / 4
  const expectedPrice = 37.62; // 9.405 * 4

  preSplitTransactions.forEach((t, i) => {
    console.log(
      `Transaction ${i + 1}: Expected amount ${expectedAmount}, got ${t.amount}`
    );
    console.log(
      `Transaction ${i + 1}: Expected price ${expectedPrice}, got ${t.price}`
    );
    console.log(
      `Transaction ${i + 1}: Expected ISIN US98945L2043, got ${t.isin}`
    );
  });

  // Verify that post-split transactions maintain the new ISIN
  const postSplitTransactions = processed.filter(
    (t) => t.date === "20.09.2024"
  );
  console.log("Post-split transactions:", postSplitTransactions);
  postSplitTransactions.forEach((t) => {
    console.log(`Post-split ISIN should be US98945L2043, got ${t.isin}`);
  });
};

// Test cumulative share count calculation with TRANSFER transactions
const testCumulativeShareCount = () => {
  const testTransactions: CsvTransaction[] = [
    // BUY transactions
    {
      date: "01.01.2023",
      stockName: "TEST STOCK",
      isin: "US88160R1014",
      amount: 100,
      price: 10.0,
      currency: "EUR",
      transactionInfo: "Kauf",
    },
    {
      date: "15.01.2023",
      stockName: "TEST STOCK",
      isin: "US88160R1014",
      amount: 50,
      price: 12.0,
      currency: "EUR",
      transactionInfo: "Kauf",
    },
    // TRANSFER inbound (positive amount)
    {
      date: "01.02.2023",
      stockName: "TEST STOCK",
      isin: "US88160R1014",
      amount: 75,
      price: 0,
      currency: "EUR",
      transactionInfo: "WP-Eingang",
    },
    // TRANSFER outbound (negative amount)
    {
      date: "15.02.2023",
      stockName: "TEST STOCK",
      isin: "US88160R1014",
      amount: -25,
      price: 0,
      currency: "EUR",
      transactionInfo: "WP-Ausgang",
    },
    // Negative BUY (should be treated as sell)
    {
      date: "01.03.2023",
      stockName: "TEST STOCK",
      isin: "US88160R1014",
      amount: -30,
      price: 15.0,
      currency: "EUR",
      transactionInfo: "Kauf", // This is actually a sell disguised as buy
    },
  ];

  const processed = processedTransactions(testTransactions);
  console.log("Processed transactions:", processed);

  const portfolio = createPortfolioSummary(processed);
  console.log("Portfolio summary:", portfolio);

  // Expected calculation:
  // Jan 1: +100 shares (BUY positive) = 100 total
  // Jan 15: +50 shares (BUY positive) = 150 total
  // Feb 1: +75 shares (TRANSFER positive/inbound) = 225 total
  // Feb 15: -25 shares (TRANSFER negative/outbound) = 200 total
  // Mar 1: -30 shares (BUY negative = sell) = 170 total
  const expectedTotalShares = 170;

  const position = portfolio.find((p) => p.isin === "US88160R1014");
  if (position) {
    console.log(
      `Expected total shares: ${expectedTotalShares}, got: ${position.totalShares}`
    );
    if (position.totalShares === expectedTotalShares) {
      console.log("✅ Cumulative share count calculation is CORRECT!");
    } else {
      console.log("❌ Cumulative share count calculation is WRONG!");
    }
  } else {
    console.log("❌ Position not found!");
  }
};

// Run the tests
testIsinChangingSplit();
testCumulativeShareCount();

// Test stock price fetching
getStockPrice(ISIN)
  .then((price) => {
    console.log("Current price:", price);
  })
  .catch((error) => {
    console.log("Error fetching price:", error);
  });
