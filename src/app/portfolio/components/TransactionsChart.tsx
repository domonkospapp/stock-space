"use client";

import React from "react";
import { Transaction } from "utils/types";
import { usePortfolioStore } from "../../../store/portfolioStore";

type Props = {
  transactions: Transaction[];
};

// Helper function to extract ticker from stock name
function extractTicker(stockName: string): string {
  // Try to find a ticker-like pattern (all caps, 2-5 letters)
  const tickerMatch = stockName.match(/\b[A-Z]{2,5}\b/);
  if (tickerMatch) {
    return tickerMatch[0];
  }

  // Fallback: take first word and clean it
  const words = stockName.split(" ");
  if (words.length > 0) {
    let firstWord = words[0]
      .replace(/\.(COM|INC|CORP|LTD|LLC|ADR|AG|SA|NV|SE)$/i, "")
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 5)
      .toUpperCase();

    if (firstWord.length >= 2) {
      return firstWord;
    }
  }

  // Last resort: use first 4 characters of stock name
  return stockName.substring(0, 4).toUpperCase();
}

// Helper function to format month as lowercase abbreviation
function formatMonthAbbrev(date: Date): string {
  const monthNames = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  return monthNames[date.getMonth()];
}

export default function TransactionsChart({ transactions }: Props) {
  const positions = usePortfolioStore((s) => s.positions);
  const holdingsMap = usePortfolioStore((s) => s.holdingsMap);

  if (!transactions.length) {
    return (
      <div className="mt-4 p-6">
        <div className="text-center py-8">
          <div className="text-white text-xl font-[hagrid] mb-2">
            Select a position to view its purchase history
          </div>
          <div className="text-white font-[hagrid] text-sm">
            You will see all transactions, current shares, and average price for
            the selected stock
          </div>
        </div>
      </div>
    );
  }

  // Get stock info from first transaction
  const stockName = transactions[0]?.stockName || "";
  const ticker = extractTicker(stockName);

  // Calculate total portfolio shares for percentage calculation
  const totalPortfolioShares = Object.values(holdingsMap).reduce(
    (sum, pos) => sum + pos.totalShares,
    0
  );

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
    // Parse monthYear to get Date object
    const [month, year] = item.monthYear.split(" ");
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const date = new Date(parseInt(year), monthIndex, 1);
    return { ...item, cumulativeShares, date, year: parseInt(year) };
  });

  // Sort by date (newest first, like in the image)
  chartData.sort((a, b) => b.date.getTime() - a.date.getTime());

  const maxShares = Math.max(...chartData.map((d) => d.cumulativeShares), 1);

  // Get current year (or latest year from data)
  const currentYear =
    chartData.length > 0
      ? chartData[0].date.getFullYear()
      : new Date().getFullYear();

  // Calculate percentage of total portfolio
  const latestShares = chartData.length > 0 ? chartData[0].cumulativeShares : 0;
  const percentage =
    totalPortfolioShares > 0 ? (latestShares / totalPortfolioShares) * 100 : 0;

  // Group data by year
  const dataByYear = chartData.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = [];
    }
    acc[item.year].push(item);
    return acc;
  }, {} as Record<number, typeof chartData>);

  // Sort years descending
  const years = Object.keys(dataByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="mt-24">
      {/* Title with ticker highlight and percentage */}
      <div className="mb-12 flex items-start justify-between border-b-2 border-foreground pb-2">
        <h3 className="text-foreground font-[hagrid] text-4xl">
          Cumulative{" "}
          <span className="bg-foreground text-background px-2 text-3xl rounded-xl">
            {ticker}
          </span>{" "}
          share count <br /> over time
        </h3>
        <div>
          <h4 className="font-[hagrid] text-4xl text-foreground">
            Allocation: {percentage.toFixed(1)}%
          </h4>
        </div>
      </div>

      {/* Monthly data grouped by year */}
      <div className="space-y-6">
        {years.map((year) => {
          const yearData = dataByYear[year];
          const yearMaxShares = Math.max(
            ...yearData.map((d) => d.cumulativeShares),
            1
          );

          return (
            <div key={year}>
              {/* Year header (show for all years) */}
              <div className="mb-3">
                <span className="text-white font-[hagrid] text-2xl">
                  {year}
                </span>
              </div>

              {/* Monthly bars for this year */}
              <div className="space-y-0">
                {yearData.map((data, index) => {
                  // Use global maxShares so bars reflect actual share count across all years
                  const progressPercentage =
                    (data.cumulativeShares / maxShares) * 100;
                  const monthAbbrev = formatMonthAbbrev(data.date);

                  // Calculate progressively darker background for each bar
                  // Start from off-white and get darker
                  const baseLightness = 90; // Off-white starting point
                  const darkenStep = 3; // Darken by 3% per row
                  const barLightness = Math.max(
                    20,
                    baseLightness - index * darkenStep
                  );
                  const barBgColor = `hsl(0, 0%, ${barLightness}%)`;
                  const barEndColor = `hsl(0, 0%, ${Math.max(
                    15,
                    barLightness - 10
                  )}%)`;

                  return (
                    <div key={data.monthYear} className="flex items-center">
                      {/* Horizontal bar with gradient - width proportional to share count */}
                      <div className="flex-1 h-16 relative flex items-center">
                        <div
                          className="h-full flex items-center px-4 gap-4"
                          style={{
                            width: `${Math.max(progressPercentage, 2)}%`,
                            maxWidth: "100%",
                            minWidth: "fit-content",
                            background: `linear-gradient(to right, ${barBgColor}, ${barEndColor})`,
                          }}
                        >
                          <span className="text-background font-[hagrid] text-xl lowercase min-w-[60px]">
                            {monthAbbrev}
                          </span>
                          <div className="h-full w-0.5 bg-background flex-shrink-0"></div>
                          <span className="text-background font-[hagrid] text-lg font-medium whitespace-nowrap ml-auto">
                            {data.cumulativeShares} shares
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
