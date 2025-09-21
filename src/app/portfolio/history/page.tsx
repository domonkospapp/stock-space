"use client";

import { useEffect, useState } from "react";
import { usePortfolioStore } from "../../../store/portfolioStore";
import PortfolioNavigation from "../components/PortfolioNavigation";

type Currency = "EUR" | "USD";

export default function PortfolioHistory() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");

  const processedTransactions = usePortfolioStore(
    (s) => s.processedTransactions
  );
  const convertCurrency = usePortfolioStore((s) => s.convertCurrency);
  const initFromLocalStorage = usePortfolioStore((s) => s.initFromLocalStorage);

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

  // Group transactions by date
  const groupedTransactions = processedTransactions.reduce(
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

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#292929" }}>
      <div className="max-w-6xl mx-auto">
        <PortfolioNavigation />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white font-[hagrid]">
            Transaction History
          </h1>
          <p className="text-gray-300 font-[urbanist] mt-2">
            Complete history of all your portfolio transactions
          </p>
        </div>

        {/* Transaction History */}
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
                    const amountInSelectedCurrency = convertCurrency(
                      Math.abs(transaction.amount),
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
                                {Math.abs(
                                  transaction.amount / transaction.price
                                ).toFixed(0)}{" "}
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
                            {formatCurrency(
                              Math.abs(transaction.price),
                              transaction.currency as Currency
                            )}{" "}
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
