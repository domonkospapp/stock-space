"use client";

import { useState } from "react";
import { usePortfolioStore } from "../../../store/portfolioStore";
import { useSettingsStore } from "../../../store/settingsStore";

type Currency = "EUR" | "USD";

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
    // Parse DD.MM.YYYY format
    const [day, month, year] = dateString.split(".");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get available years from transactions
  const availableYears = [
    0, // "All Years" option
    ...Array.from(
      new Set(
        processedTransactions.map((transaction) => {
          const [day, month, year] = transaction.date.split(".");
          return parseInt(year);
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
        const [day, month, year] = transaction.date.split(".");
        return parseInt(year) === selectedYear;
      })();

    // Stock filter
    const stockMatch =
      selectedStock === "all" || transaction.isin === selectedStock;

    return yearMatch && stockMatch;
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce(
    (acc, transaction) => {
      const date = transaction.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    },
    {} as Record<string, typeof processedTransactions>
  );

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    // Parse DD.MM.YYYY format for both dates
    const [dayA, monthA, yearA] = a.split(".");
    const [dayB, monthB, yearB] = b.split(".");
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

  // Create monthly transaction counts for calendar
  const monthlyCounts = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthName = new Date(
      selectedYear || new Date().getFullYear(),
      monthIndex
    ).toLocaleDateString("en-US", {
      month: "short",
    });
    const count = filteredTransactions.filter((transaction) => {
      const [day, month, year] = transaction.date.split(".");
      return parseInt(month) === monthIndex + 1;
    }).length;
    return { month: monthName, count, monthIndex };
  });

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-white font-[hagrid]">
            Transaction History
          </h2>
          <p className="text-gray-300 font-[urbanist] mt-2">
            Complete history of all your portfolio transactions
          </p>
        </div>
      </div>

      {/* Split View: Transaction List and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction History */}
        <div className="lg:col-span-2">
          <div className="space-y-8">
            {sortedDates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 font-[urbanist] text-lg">
                  No transaction history found
                </p>
              </div>
            ) : (
              sortedDates.map((date) => (
                <div key={date}>
                  <h2 className="text-2xl font-bold text-white font-[hagrid] mb-4">
                    {formatDate(date)}
                  </h2>

                  <div className="space-y-3">
                    {groupedTransactions[date].map((transaction, index) => {
                      // Calculate the actual transaction value (shares * price)
                      const transactionValue = Math.abs(
                        transaction.amount * transaction.price
                      );
                      const amountInSelectedCurrency = convertCurrency(
                        transactionValue,
                        transaction.currency,
                        selectedCurrency
                      );

                      return (
                        <div
                          key={`${transaction.date}-${index}`}
                          className="flex items-center justify-between p-4 rounded-lg border border-white"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  transaction.type === "BUY"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              />
                              <div>
                                <h3 className="text-white font-[hagrid] text-lg">
                                  {transaction.type}{" "}
                                  {Math.abs(transaction.amount).toFixed(0)}{" "}
                                  shares
                                </h3>
                                <p className="text-gray-300 font-[urbanist] text-sm">
                                  {transaction.isin} • {transaction.stockName}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`font-[hagrid] text-lg ${
                                transaction.type === "BUY"
                                  ? "text-red-400"
                                  : "text-green-400"
                              }`}
                            >
                              {transaction.type === "BUY" ? "-" : "+"}
                              {formatCurrency(
                                amountInSelectedCurrency,
                                selectedCurrency
                              )}
                            </div>
                            <div className="text-gray-400 font-[urbanist] text-sm">
                              {transaction.price.toLocaleString("en-US", {
                                style: "currency",
                                currency: transaction.currency as Currency,
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{" "}
                              per share
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Calendar Layout */}
        <div className="lg:col-span-1">
          <div className="p-6 sticky top-8">
            {/* Filters */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white font-[hagrid] mb-4">
                Filters
              </h3>

              {/* Stock Selector */}
              <div className="mb-4">
                <label className="block text-gray-300 font-[urbanist] text-sm mb-2">
                  Stock
                </label>
                <select
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="w-full bg-transparent border border-white text-white px-3 py-2 rounded-lg font-[urbanist] focus:border-ci-yellow focus:outline-none"
                >
                  {availableStocks.map((stock) => (
                    <option
                      key={stock.value}
                      value={stock.value}
                      className="bg-background text-white"
                    >
                      {stock.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Selector */}
              <div className="mb-4">
                <label className="block text-gray-300 font-[urbanist] text-sm mb-2">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full bg-transparent border border-white text-white px-3 py-2 rounded-lg font-[urbanist] focus:border-ci-yellow focus:outline-none"
                >
                  {availableYears.map((year) => (
                    <option
                      key={year}
                      value={year}
                      className="bg-background text-white"
                    >
                      {year === 0 ? "All Years" : year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calendar Header */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white font-[hagrid]">
                Calendar
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {monthlyCounts.map(({ month, count, monthIndex }) => (
                <div
                  key={monthIndex}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    count > 0
                      ? "border-ci-yellow bg-ci-yellow/10 hover:bg-ci-yellow/20"
                      : "border-white bg-transparent hover:bg-white/10"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-white font-[hagrid] mb-1">
                      {month}
                    </div>
                    <div
                      className={`text-2xl font-bold font-[hagrid] ${
                        count > 0 ? "text-ci-yellow" : "text-gray-400"
                      }`}
                    >
                      {count}
                    </div>
                    <div className="text-xs text-gray-400 font-[urbanist] mt-1">
                      {count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
