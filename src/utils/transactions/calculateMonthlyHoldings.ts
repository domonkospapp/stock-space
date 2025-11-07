import { Transaction } from "utils/types";

interface MonthlyHolding {
  date: string; // YYYY-MM format
  holdings: {
    stockName: string;
    isin: string;
    totalShares: number;
  }[];
}

export function calculateMonthlyHoldings(
  transactions: Transaction[]
): MonthlyHolding[] {
  // Sort transactions by date ascending
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

  if (sortedTransactions.length === 0) {
    return [];
  }

  const monthlyHoldingsMap = new Map<
    string,
    Map<string, { stockName: string; totalShares: number }>
  >();
  const currentShares: Map<string, { stockName: string; totalShares: number }> =
    new Map();

  const firstTransactionDate = new Date(
    parseInt(sortedTransactions[0].date.split(".")[2]),
    parseInt(sortedTransactions[0].date.split(".")[1]) - 1,
    parseInt(sortedTransactions[0].date.split(".")[0])
  );
  const lastTransactionDate = new Date(
    parseInt(
      sortedTransactions[sortedTransactions.length - 1].date.split(".")[2]
    ),
    parseInt(
      sortedTransactions[sortedTransactions.length - 1].date.split(".")[1]
    ) - 1,
    parseInt(
      sortedTransactions[sortedTransactions.length - 1].date.split(".")[0]
    )
  );

  const currentMonth = new Date(
    firstTransactionDate.getFullYear(),
    firstTransactionDate.getMonth(),
    1
  );

  const today = new Date();
  const currentActualMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const endMonth = new Date(
    Math.max(lastTransactionDate.getTime(), currentActualMonth.getTime())
  );
  endMonth.setDate(1); // Ensure it's the first day of the month for consistent comparison

  let transactionIndex = 0;

  while (currentMonth <= endMonth) {
    const monthKey = `${currentMonth.getFullYear()}-${(
      currentMonth.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;

    // Apply all transactions that occurred within or before this month
    while (
      transactionIndex < sortedTransactions.length &&
      new Date(
        parseInt(sortedTransactions[transactionIndex].date.split(".")[2]),
        parseInt(sortedTransactions[transactionIndex].date.split(".")[1]) - 1,
        parseInt(sortedTransactions[transactionIndex].date.split(".")[0])
      ) < new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0) // Check if transaction is before the end of the current month
    ) {
      const transaction = sortedTransactions[transactionIndex];
      let normalizedQuantity = 0;
      if (transaction.type === "BUY") {
        normalizedQuantity = transaction.amount;
      } else if (transaction.type === "SELL") {
        normalizedQuantity = -transaction.amount;
      } else if (transaction.type === "TRANSFER") {
        normalizedQuantity = transaction.amount;
      }

      const currentStockHolding = currentShares.get(transaction.isin) || {
        stockName: transaction.stockName,
        totalShares: 0,
      };

      currentStockHolding.totalShares += normalizedQuantity;
      currentShares.set(transaction.isin, currentStockHolding);
      transactionIndex++;
    }

    // Deep copy current holdings for this month
    const holdingsForMonth: {
      stockName: string;
      isin: string;
      totalShares: number;
    }[] = [];
    currentShares.forEach((value, key) => {
      if (value.totalShares > 0) {
        holdingsForMonth.push({
          stockName: value.stockName,
          isin: key,
          totalShares: value.totalShares,
        });
      }
    });

    // Store holdings for the current month
    monthlyHoldingsMap.set(
      monthKey,
      new Map(
        holdingsForMonth.map((h) => [
          h.isin,
          { stockName: h.stockName, totalShares: h.totalShares },
        ])
      )
    );

    // Move to the next month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  // Convert the map to the desired array format
  const result: MonthlyHolding[] = Array.from(monthlyHoldingsMap.entries())
    .map(([date, holdingsMap]) => ({
      date,
      holdings: Array.from(holdingsMap.entries()).map(([isin, holding]) => ({
        stockName: holding.stockName,
        isin,
        totalShares: holding.totalShares,
      })),
    }))
    .sort((a, b) => a.date.localeCompare(b.date)); // Sort months chronologically

  return result;
}
