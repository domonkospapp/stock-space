import { Transaction, CsvTransaction, TransactionType } from "utils/types";

export type SplitTransaction = {
  isin: string;
  date: Date;
  ratio: number;
  buchungsinfo: string;
  isIsinChanging?: boolean;
  affectedIsins?: string[];
};

const getTransactionType = (transaction: CsvTransaction): TransactionType => {
  const cleanInfo = transaction.transactionInfo.toLowerCase();

  if (cleanInfo.includes("kauf") || cleanInfo.includes("buy")) {
    return "BUY";
  } else if (cleanInfo.includes("verkauf") || cleanInfo.includes("sell")) {
    return "SELL";
  } else if (
    cleanInfo.includes("wp-eingang") ||
    cleanInfo.includes("transfer")
  ) {
    return "TRANSFER";
  } else {
    return "OTHER";
  }
};

export default function processedTransactions(
  csvTransaction: CsvTransaction[],
): Transaction[] {
  const transactions = structuredClone(csvTransaction);
  const splitProcessed = processSplits(transactions);

  return splitProcessed.map((transaction) => {
    const transactionType = getTransactionType(transaction);
    return {
      date: transaction.date,
      stockName: transaction.stockName,
      isin: transaction.isin,
      amount: transaction.amount,
      price: transaction.price,
      currency: transaction.currency,
      type: transactionType,
    };
  });
}

export function processSplits(
  transactions: CsvTransaction[],
): CsvTransaction[] {
  const splitTransactions: SplitTransaction[] = [];

  // Group transactions by ISIN and date to identify splits
  const splitGroups: { [key: string]: CsvTransaction[] } = {};

  transactions.forEach((transaction) => {
    const key = `${transaction.isin}_${transaction.date}`;
    if (!splitGroups[key]) {
      splitGroups[key] = [];
    }
    splitGroups[key].push(transaction);
  });

  // Also group by date only to catch ISIN-changing splits (like reverse splits)
  const dateGroups: { [key: string]: CsvTransaction[] } = {};
  transactions.forEach((transaction) => {
    const key = `date_${transaction.date}`;
    if (!dateGroups[key]) {
      dateGroups[key] = [];
    }
    dateGroups[key].push(transaction);
  });

  // Identify splits from groups with multiple transactions
  Object.values(splitGroups).forEach((group) => {
    if (group.length > 1) {
      const hasNegativeAmounts = group.some((t) => t.amount < 0);
      const hasPositiveAmounts = group.some((t) => t.amount > 0);

      if (hasNegativeAmounts && hasPositiveAmounts) {
        const negativeTransactions = group.filter((t) => t.amount < 0);
        const positiveTransactions = group.filter((t) => t.amount > 0);

        const totalNegativeShares = Math.abs(
          negativeTransactions.reduce((sum, t) => sum + t.amount, 0),
        );
        const totalPositiveShares = positiveTransactions.reduce(
          (sum, t) => sum + t.amount,
          0,
        );
        const splitRatio = totalPositiveShares / totalNegativeShares;

        // Only process actual splits, not Storno transactions
        const hasSplitDescription = group.some(
          (t) =>
            t.transactionInfo.toLowerCase().includes("split") ||
            t.transactionInfo.toLowerCase().includes("verhältnis"),
        );

        if (splitRatio > 0.1 && splitRatio < 10 && hasSplitDescription) {
          const [day, month, year] = group[0].date.split(".");
          const splitDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
          );
          splitTransactions.push({
            isin: group[0].isin,
            date: splitDate,
            ratio: splitRatio,
            buchungsinfo: group[0].transactionInfo,
          });
        }
      }
    }
  });

  // Identify ISIN-changing splits (like reverse splits) from date groups
  // Only process dates that don't already have regular splits detected
  Object.entries(dateGroups).forEach(([, group]) => {
    if (group.length >= 2) {
      // Check if this date already has a regular split detected
      const hasRegularSplit = splitTransactions.some((split) => {
        const [day, month, year] = group[0].date.split(".");
        const groupDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
        );
        return (
          groupDate.getTime() === split.date.getTime() && !split.isIsinChanging
        );
      });

      // Skip if regular split already detected for this date
      if (hasRegularSplit) return;

      // Look for transactions with split descriptions that involve different ISINs
      const dateSplitTransactions = group.filter(
        (t) =>
          t.transactionInfo.toLowerCase().includes("split") ||
          t.transactionInfo.toLowerCase().includes("verhältnis"),
      );

      if (dateSplitTransactions.length >= 2) {
        // This is likely an ISIN-changing split
        const negativeTransactions = dateSplitTransactions.filter(
          (t) => t.amount < 0,
        );
        const positiveTransactions = dateSplitTransactions.filter(
          (t) => t.amount > 0,
        );

        if (
          negativeTransactions.length > 0 &&
          positiveTransactions.length > 0
        ) {
          const totalNegativeShares = Math.abs(
            negativeTransactions.reduce((sum, t) => sum + t.amount, 0),
          );
          const totalPositiveShares = positiveTransactions.reduce(
            (sum, t) => sum + t.amount,
            0,
          );
          const splitRatio = totalPositiveShares / totalNegativeShares;

          if (splitRatio > 0.1 && splitRatio < 10) {
            const [day, month, year] = group[0].date.split(".");
            const splitDate = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
            );

            // For ISIN-changing splits, create a single special marker
            // that includes both the date and the fact it's ISIN-changing
            splitTransactions.push({
              isin: "ISIN_CHANGING_SPLIT", // Special marker
              date: splitDate,
              ratio: splitRatio,
              buchungsinfo: dateSplitTransactions[0].transactionInfo,
              isIsinChanging: true, // Flag to identify this type
              affectedIsins: [
                ...new Set(dateSplitTransactions.map((t) => t.isin)),
              ], // Store affected ISINs
            });
          }
        }
      }
    }
  });

  // Apply splits backward to all previous transactions
  splitTransactions.forEach((split) => {
    let affectedTransactions: CsvTransaction[] = [];

    if (split.isIsinChanging && split.affectedIsins) {
      // For ISIN-changing splits, apply to all affected ISINs
      affectedTransactions = transactions.filter((tx) => {
        const [day, month, year] = tx.date.split(".");
        const txDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
        );
        return (
          split.affectedIsins!.includes(tx.isin) &&
          txDate.getTime() < split.date.getTime()
        );
      });
    } else {
      // For regular splits, apply to matching ISIN
      affectedTransactions = transactions.filter((tx) => {
        const [day, month, year] = tx.date.split(".");
        const txDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
        );
        return (
          tx.isin === split.isin && txDate.getTime() < split.date.getTime()
        );
      });
    }

    // Apply split ratio to quantities and adjust prices
    affectedTransactions.forEach((tx) => {
      if (split.ratio > 1) {
        // Forward split (e.g., 1:3) - historical transactions should show adjusted values
        tx.amount = Math.round(tx.amount * split.ratio);
        tx.price = Math.round((tx.price / split.ratio) * 100) / 100;
      } else if (split.ratio < 1) {
        // Reverse split (e.g., 4:1) - historical transactions should show adjusted values
        tx.amount = Math.round(tx.amount * split.ratio);
        tx.price = Math.round((tx.price / split.ratio) * 100) / 100;
      }
    });
  });

  // Remove all split-related transactions, but keep Storno transactions for proper processing
  const processedTransactions = transactions.filter((transaction) => {
    const isPartOfSplit = splitTransactions.some((split) => {
      // For ISIN-changing splits, we need to match by date, not by ISIN
      const [day, month, year] = transaction.date.split(".");
      const transactionDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
      );

      // Check if this transaction is on a split date
      if (transactionDate.getTime() !== split.date.getTime()) return false;

      if (split.isIsinChanging && split.affectedIsins) {
        // This is an ISIN-changing split - remove ALL transactions on this date
        // if they involve any of the affected ISINs
        if (split.affectedIsins.includes(transaction.isin)) {
          return !transaction.transactionInfo.toLowerCase().includes("storno");
        }
      } else {
        // Regular split - only remove transactions with matching ISIN
        if (split.isin !== transaction.isin) return false;
        return !transaction.transactionInfo.toLowerCase().includes("storno");
      }
    });

    return !isPartOfSplit;
  });

  return processedTransactions;
}
