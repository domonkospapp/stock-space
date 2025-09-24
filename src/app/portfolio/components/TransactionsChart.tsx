"use client";

import React from "react";
import { Transaction } from "utils/types";

type Props = {
  transactions: Transaction[];
};

export default function TransactionsChart({ transactions }: Props) {
  if (!transactions.length) {
    return (
      <div className="mt-8 bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-xl">
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">
            👆 Select a position to view its purchase history
          </div>
          <div className="text-gray-500 text-sm">
            You will see all transactions, current shares, and average price for
            the selected stock
          </div>
        </div>
      </div>
    );
  }

  const cumulativeData = transactions.reduce((acc, transaction) => {
    // Parse DD.MM.YYYY format
    const [day, month, year] = transaction.date.split(".");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const monthYear = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!acc[monthYear]) acc[monthYear] = { shares: 0, transactions: 0 };

    // Apply the same normalization rules for monthly grouping
    let normalizedQuantity = 0;
    if (transaction.type === "BUY") {
      normalizedQuantity = transaction.amount;
    } else if (transaction.type === "SELL") {
      normalizedQuantity = transaction.amount;
    } else if (transaction.type === "TRANSFER") {
      normalizedQuantity = transaction.amount;
    }

    acc[monthYear].shares += normalizedQuantity;
    acc[monthYear].transactions += 1;
    return acc;
  }, {} as Record<string, { shares: number; transactions: number }>);

  const sortedData = Object.entries(cumulativeData)
    .map(([monthYear, data]) => ({ monthYear, ...data }))
    .sort((a, b) => {
      // Parse month-year strings properly
      const parseMonthYear = (monthYear: string) => {
        const [month, year] = monthYear.split(" ");
        const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
        return new Date(parseInt(year), monthIndex, 1).getTime();
      };

      return parseMonthYear(a.monthYear) - parseMonthYear(b.monthYear);
    });

  // Calculate cumulative shares by processing transactions in chronological order
  const transactionCumulativeData = new Map<string, number>();
  let runningTotal = 0;

  // Sort transactions by date first
  const sortedTransactions = [...transactions].sort((a, b) => {
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
    return dateA.getTime() - dateB.getTime();
  });

  // Process each transaction to get the running total
  sortedTransactions.forEach((transaction) => {
    const [day, month, year] = transaction.date.split(".");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const monthYear = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    // Normalize quantity signs according to the rules:
    // BUY with positive qty => shares increase
    // BUY with negative qty => this is a sell => shares decrease
    // TRANSFER with positive qty => shares increase (inbound)
    // TRANSFER with negative qty => shares decrease (outbound)
    let normalizedQuantity = 0;

    if (transaction.type === "BUY") {
      // BUY: positive qty increases shares, negative qty decreases shares
      normalizedQuantity = transaction.amount;
    } else if (transaction.type === "SELL") {
      // SELL: always decreases shares (amount is already negative in CSV)
      normalizedQuantity = transaction.amount;
    } else if (transaction.type === "TRANSFER") {
      // TRANSFER: positive qty increases shares (inbound), negative qty decreases shares (outbound)
      normalizedQuantity = transaction.amount;
    }
    // OTHER transactions are ignored for share count calculation

    runningTotal += normalizedQuantity;

    // Store the cumulative total for this month
    transactionCumulativeData.set(monthYear, runningTotal);
  });

  // For monthly positions, we need to find the last transaction in each month
  // and use its cumulative position, not the sum of all transactions in that month
  const monthlyPositions = new Map<string, number>();

  // Group transactions by month and find the last one in each month
  const transactionsByMonth = new Map<string, Transaction[]>();
  sortedTransactions.forEach((transaction) => {
    const [day, month, year] = transaction.date.split(".");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const monthYear = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (!transactionsByMonth.has(monthYear)) {
      transactionsByMonth.set(monthYear, []);
    }
    transactionsByMonth.get(monthYear)!.push(transaction);
  });

  // Calculate cumulative position for each month by processing all transactions up to the last one in that month
  let runningTotalForMonthly = 0;
  const sortedMonths = Array.from(transactionsByMonth.keys()).sort((a, b) => {
    const parseMonthYear = (monthYear: string) => {
      const [month, year] = monthYear.split(" ");
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
      return new Date(parseInt(year), monthIndex, 1).getTime();
    };
    return parseMonthYear(a) - parseMonthYear(b);
  });

  sortedMonths.forEach((monthYear) => {
    const monthTransactions = transactionsByMonth.get(monthYear)!;

    // Sort transactions within the month by date
    const sortedMonthTransactions = monthTransactions.sort((a, b) => {
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
      return dateA.getTime() - dateB.getTime();
    });

    // Process all transactions in this month to get the final position
    sortedMonthTransactions.forEach((transaction) => {
      let normalizedQuantity = 0;
      if (transaction.type === "BUY") {
        normalizedQuantity = transaction.amount;
      } else if (transaction.type === "SELL") {
        normalizedQuantity = transaction.amount;
      } else if (transaction.type === "TRANSFER") {
        normalizedQuantity = transaction.amount;
      }
      runningTotalForMonthly += normalizedQuantity;
    });

    // Store the final position for this month
    monthlyPositions.set(monthYear, runningTotalForMonthly);
  });

  const chartData = sortedData.map((item) => {
    const cumulativeShares = monthlyPositions.get(item.monthYear) || 0;
    return { ...item, cumulativeShares };
  });

  const maxShares = Math.max(...chartData.map((d) => d.cumulativeShares), 1);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-white mb-4">
        Cumulative Stock Count Over Time
      </h3>
      <div className="space-y-4">
        {chartData.map((data) => {
          const progressPercentage = (data.cumulativeShares / maxShares) * 100;
          const totalSegments = 66; // Total number of segments in the bar
          const filledSegments = Math.round(
            (progressPercentage / 100) * totalSegments
          );

          return (
            <div key={data.monthYear} className="relative">
              <div className="flex items-center justify-between my-2">
                <span className="text-white text-lg font-[hagrid]">
                  {data.monthYear}
                </span>
                <span className="text-white font-[hagrid]">
                  <span className="font-bold">
                    {data.cumulativeShares.toLocaleString()}
                  </span>{" "}
                  shares
                </span>
              </div>
              <div className="flex gap-1">
                {[...Array(totalSegments)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-12 w-4 rounded-full ${
                      i < filledSegments ? "" : "bg-[#504F4F]"
                    }`}
                    style={{
                      backgroundColor:
                        i < filledSegments ? "#A3A2F9" : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
