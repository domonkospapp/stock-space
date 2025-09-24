"use client";

import { useEffect, useState } from "react";
import { usePortfolioStore } from "../../../store/portfolioStore";
import PortfolioNavigation from "../components/PortfolioNavigation";

type Currency = "EUR" | "USD";

export default function PortfolioHistory() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const processedTransactions = usePortfolioStore(
    (s) => s.processedTransactions
  );
  const convertCurrency = usePortfolioStore((s) => s.convertCurrency);
  const initFromLocalStorage = usePortfolioStore((s) => s.initFromLocalStorage);
  const roundedTotalUSD = usePortfolioStore((s) => s.roundedTotalUSD);
  const isAllCalculated = usePortfolioStore((s) => s.isAllCalculated());

  // Load saved currency preference
  useEffect(() => {
    initFromLocalStorage();

    const savedCurrency = localStorage.getItem(
      "portfolio-currency"
    ) as Currency;
    if (savedCurrency && (savedCurrency === "EUR" || savedCurrency === "USD")) {
      setSelectedCurrency(savedCurrency);
    }
  }, [initFromLocalStorage]);

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
  const availableYears = Array.from(
    new Set(
      processedTransactions.map((transaction) => {
        const [day, month, year] = transaction.date.split(".");
        return parseInt(year);
      })
    )
  ).sort((a, b) => b - a);

  // Filter transactions by selected year
  const filteredTransactions = processedTransactions.filter((transaction) => {
    const [day, month, year] = transaction.date.split(".");
    return parseInt(year) === selectedYear;
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
    const monthName = new Date(selectedYear, monthIndex).toLocaleDateString(
      "en-US",
      {
        month: "short",
      }
    );
    const count = filteredTransactions.filter((transaction) => {
      const [day, month, year] = transaction.date.split(".");
      return parseInt(month) === monthIndex + 1;
    }).length;
    return { month: monthName, count, monthIndex };
  });

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#292929" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <PortfolioNavigation />
          <div>
            <h1 className="text-8xl font-bold text-white font-[hagrid]">
              {isAllCalculated ? (
                formatCurrency(
                  convertCurrency(
                    roundedTotalUSD || 0,
                    "USD",
                    selectedCurrency
                  ),
                  selectedCurrency
                )
              ) : (
                <span className="text-gray-400">Calculating...</span>
              )}
            </h1>
          </div>
        </div>

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
                            className="flex items-center justify-between p-4 rounded-lg border border-ci-purple"
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
              {/* Year Selector */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white font-[hagrid]">
                  Calendar
                </h3>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-transparent border border-white text-white px-3 py-1 rounded-lg font-[urbanist] focus:border-ci-yellow focus:outline-none"
                >
                  {availableYears.map((year) => (
                    <option
                      key={year}
                      value={year}
                      className="bg-background text-white"
                    >
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {monthlyCounts.map(({ month, count, monthIndex }) => (
                  <div
                    key={monthIndex}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      count > 0
                        ? "border-ci-yellow bg-ci-yellow/10 hover:bg-ci-yellow/20"
                        : "border-gray-600 bg-gray-700 hover:bg-gray-600"
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

        {/* Summary Stats */}
        {processedTransactions.length > 0 && (
          <div className="mt-12 p-6 rounded-lg border border-ci-purple">
            <h3 className="text-xl font-bold text-white font-[hagrid] mb-4">
              Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-[hagrid]">
                  {processedTransactions.length}
                </div>
                <div className="text-gray-300 font-[urbanist] text-sm">
                  Total Transactions
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-[hagrid]">
                  {new Set(processedTransactions.map((t) => t.isin)).size}
                </div>
                <div className="text-gray-300 font-[urbanist] text-sm">
                  Unique Securities
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-[hagrid]">
                  {new Set(processedTransactions.map((t) => t.date)).size}
                </div>
                <div className="text-gray-300 font-[urbanist] text-sm">
                  Trading Days
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
