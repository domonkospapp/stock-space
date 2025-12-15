"use client";

import { useState } from "react";
import { usePortfolioStore } from "../../../store/portfolioStore";
import { useSettingsStore } from "../../../store/settingsStore";

type Currency = "EUR" | "USD";

// Helper function to extract ticker from stock name
function extractTicker(stockName: string): string {
  // Try to find a ticker-like pattern (all caps, 2-5 letters)
  const tickerMatch = stockName.match(/\b[A-Z]{2,5}\b/);
  if (tickerMatch) {
    return tickerMatch[0];
  }
  // Fallback: return first word or first 4 characters
  const firstWord = stockName.split(" ")[0];
  return firstWord.length <= 5
    ? firstWord.toUpperCase()
    : firstWord.substring(0, 4).toUpperCase();
}

export default function PortfolioHistory() {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedStock, setSelectedStock] = useState<string>("all");

  const selectedCurrency = useSettingsStore((s) => s.selectedCurrency);
  const processedTransactions = usePortfolioStore(
    (s) => s.processedTransactions
  );
  const convertCurrency = usePortfolioStore((s) => s.convertCurrency);

  const formatCurrency = (amount: number, currency: Currency): string => {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (dateString: string): string => {
    // Parse DD.MM.YYYY format and convert to YYYY.MM.DD
    const [day, month, year] = dateString.split(".");
    return `${year}.${month.padStart(2, "0")}.${day.padStart(2, "0")}`;
  };

  // Get available years from transactions
  const availableYears = [
    0, // "All Years" option
    ...Array.from(
      new Set(
        processedTransactions.map((transaction) => {
          const parts = transaction.date.split(".");
          return parseInt(parts[2]);
        })
      )
    ).sort((a, b) => b - a),
  ];

  // Get available stocks from transactions
  const availableStocks = [
    { value: "all", label: "All Stocks" },
    ...Array.from(
      new Map(
        processedTransactions.map((transaction) => [
          transaction.isin,
          {
            value: transaction.isin,
            label: `${transaction.stockName} (${transaction.isin})`,
          },
        ])
      ).values()
    ).sort((a, b) => a.label.localeCompare(b.label)),
  ];

  // Filter transactions by selected year and stock
  const filteredTransactions = processedTransactions.filter((transaction) => {
    // Year filter
    const yearMatch =
      selectedYear === 0 ||
      (() => {
        const parts = transaction.date.split(".");
        return parseInt(parts[2]) === selectedYear;
      })();

    // Stock filter
    const stockMatch =
      selectedStock === "all" || transaction.isin === selectedStock;

    return yearMatch && stockMatch;
  });

  // Sort transactions by date in descending order (newest first)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    // Parse DD.MM.YYYY format for both dates
    const [dayA, monthA, yearA] = a.date.split(".");
    const [dayB, monthB, yearB] = b.date.split(".");
    const dateA = new Date(
      parseInt(yearA),
      parseInt(monthA) - 1,
      parseInt(dayA)
    );
    const dateB = new Date(
      parseInt(yearB),
      parseInt(monthB) - 1,
      parseInt(dayB)
    );
    return dateB.getTime() - dateA.getTime();
  });

  // Calculate total value split by buy and sell (transfer counts as buy)
  const { buyTotal, sellTotal } = sortedTransactions.reduce(
    (acc, transaction) => {
      const transactionValue = Math.abs(transaction.amount * transaction.price);
      const valueInSelectedCurrency = convertCurrency(
        transactionValue,
        transaction.currency,
        selectedCurrency
      );

      if (transaction.type === "BUY" || transaction.type === "TRANSFER") {
        acc.buyTotal += valueInSelectedCurrency;
      } else if (transaction.type === "SELL") {
        acc.sellTotal += valueInSelectedCurrency;
      }

      return acc;
    },
    { buyTotal: 0, sellTotal: 0 }
  );

  const transactionCount = sortedTransactions.length;

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-white font-[hagrid]">
            Transaction history
          </h2>
        </div>
      </div>

      {/* Filters and Summary */}
      <div className="mb-6 flex gap-4 items-center justify-between">
        <div className="flex gap-4">
          {/* Asset Filter */}
          <div className="relative">
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="appearance-none bg-[#2A2A2A] border border-foreground/30 text-white px-4 py-2 pr-10 rounded-full font-[urbanist] focus:border-foreground focus:outline-none cursor-pointer min-w-[300px]"
            >
              {availableStocks.map((stock) => (
                <option
                  key={stock.value}
                  value={stock.value}
                  className="bg-[#2A2A2A] text-white"
                >
                  {stock.value === "all" ? "All Stocks" : stock.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Year Filter */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="appearance-none bg-[#2A2A2A] border border-foreground/30 text-white px-4 py-2 pr-10 rounded-full font-[urbanist] focus:border-foreground focus:outline-none cursor-pointer min-w-[120px]"
            >
              <option value={0} className="bg-[#2A2A2A] text-white">
                Year
              </option>
              {availableYears
                .filter((year) => year !== 0)
                .map((year) => (
                  <option
                    key={year}
                    value={year}
                    className="bg-[#2A2A2A] text-white"
                  >
                    {year}
                  </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Summary - Right Aligned */}
        {sortedTransactions.length > 0 && (
          <div className="flex gap-6 items-center pr-4">
            <div className="text-right">
              <div className="text-gray-400 font-[urbanist] text-sm">
                Buy Total
              </div>
              <div className="text-ci-green font-[hagrid] text-lg">
                {formatCurrency(buyTotal, selectedCurrency)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 font-[urbanist] text-sm">
                Sell Total
              </div>
              <div className="text-ci-red font-[hagrid] text-lg">
                {formatCurrency(sellTotal, selectedCurrency)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 font-[urbanist] text-sm">
                Transactions
              </div>
              <div className="text-white font-[hagrid] text-lg">
                {transactionCount}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Table */}
      <div className="w-full">
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 font-[urbanist] text-lg">
              No transaction history found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-foreground/30">
                  <th className="text-left py-3 px-4 text-white font-[hagrid] text-sm">
                    Asset
                  </th>
                  <th className="text-left py-3 px-4 text-white font-[hagrid] text-sm">
                    Trade ID
                  </th>
                  <th className="text-left py-3 px-4 text-white font-[hagrid] text-sm">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-white font-[hagrid] text-sm">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 text-white font-[hagrid] text-sm">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-white font-[hagrid] text-sm">
                    Value
                  </th>
                  <th className="text-right py-3 px-4 text-white font-[hagrid] text-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((transaction, index) => {
                  const priceInSelectedCurrency = convertCurrency(
                    transaction.price,
                    transaction.currency,
                    selectedCurrency
                  );

                  // Calculate value: price × amount
                  const transactionValue = Math.abs(
                    transaction.amount * transaction.price
                  );
                  const valueInSelectedCurrency = convertCurrency(
                    transactionValue,
                    transaction.currency,
                    selectedCurrency
                  );

                  return (
                    <tr
                      key={`${transaction.date}-${index}`}
                      className="border-b border-foreground/10 hover:bg-foreground/5"
                    >
                      <td className="py-3 px-4 text-white font-[urbanist]">
                        {transaction.stockName}
                      </td>
                      <td className="py-3 px-4 text-white font-[urbanist]">
                        {transaction.isin}
                      </td>
                      <td className="py-3 px-4 text-white font-[urbanist]">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="py-3 px-4 text-white font-[urbanist]">
                        {formatCurrency(
                          priceInSelectedCurrency,
                          selectedCurrency
                        )}
                      </td>
                      <td className="py-3 px-4 text-white font-[urbanist]">
                        {Math.abs(transaction.amount).toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-white font-[urbanist]">
                        {formatCurrency(
                          valueInSelectedCurrency,
                          selectedCurrency
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-[urbanist] ${
                            transaction.type === "BUY"
                              ? "text-ci-green"
                              : transaction.type === "SELL"
                              ? "text-ci-red"
                              : "text-gray-400"
                          }`}
                        >
                          {transaction.type === "BUY"
                            ? "buy ↑"
                            : transaction.type === "SELL"
                            ? "sell ↓"
                            : transaction.type}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
