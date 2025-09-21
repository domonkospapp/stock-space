import { Position, Transaction } from "utils/types";

export function createPortfolioSummary(
  transactions: Transaction[]
): Position[] {
  const stockMap = new Map<string, Position>();
  const isinTransitionMap = new Map<string, string>(); // Track ISIN transitions

  // First pass: identify ISIN transitions from split-like patterns
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

  // Look for ISIN transitions (when same stock name appears with different ISINs)
  const stockNameToIsinMap = new Map<string, string[]>();
  sortedTransactions.forEach((transaction) => {
    if (!stockNameToIsinMap.has(transaction.stockName)) {
      stockNameToIsinMap.set(transaction.stockName, []);
    }
    const isins = stockNameToIsinMap.get(transaction.stockName)!;
    if (!isins.includes(transaction.isin)) {
      isins.push(transaction.isin);
    }
  });

  // Create ISIN transition mapping (old ISIN -> new ISIN)
  stockNameToIsinMap.forEach((isins) => {
    if (isins.length > 1) {
      // Sort ISINs by their first appearance in transactions
      const isinOrder = isins.sort((a, b) => {
        const firstA = sortedTransactions.find((t) => t.isin === a);
        const firstB = sortedTransactions.find((t) => t.isin === b);
        if (!firstA || !firstB) return 0;

        const [dayA, monthA, yearA] = firstA.date.split(".");
        const [dayB, monthB, yearB] = firstB.date.split(".");
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

      // Map each ISIN to the next one in the sequence
      for (let i = 0; i < isinOrder.length - 1; i++) {
        isinTransitionMap.set(isinOrder[i], isinOrder[i + 1]);
      }
    }
  });

  // Second pass: process transactions with ISIN transition awareness
  sortedTransactions.forEach((transaction) => {
    let currentIsin = transaction.isin;

    // Check if this ISIN has been transitioned to a newer one
    while (isinTransitionMap.has(currentIsin)) {
      currentIsin = isinTransitionMap.get(currentIsin)!;
    }

    if (!stockMap.has(currentIsin)) {
      stockMap.set(currentIsin, {
        stockName: transaction.stockName,
        isin: currentIsin,
        totalShares: 0,
        averagePrice: 0,
        currency: transaction.currency,
        lots: [],
      });
    }

    const stock = stockMap.get(currentIsin)!;

    // Apply the same normalization rules as in TransactionsChart:
    // BUY with positive qty => shares increase
    // BUY with negative qty => this is a sell => shares decrease
    // TRANSFER with positive qty => shares increase (inbound)
    // TRANSFER with negative qty => shares decrease (outbound)
    let normalizedQuantity = 0;

    if (transaction.type === "BUY") {
      normalizedQuantity = transaction.amount;
    } else if (transaction.type === "SELL") {
      normalizedQuantity = transaction.amount;
    } else if (transaction.type === "TRANSFER") {
      normalizedQuantity = transaction.amount;
    }
    // OTHER transactions are ignored for share count calculation

    if (normalizedQuantity > 0) {
      // Positive quantity - add to lots (BUY positive or TRANSFER inbound)
      stock.lots.push({
        shares: normalizedQuantity,
        price: transaction.price,
      });
      stock.totalShares += normalizedQuantity;
    } else if (normalizedQuantity < 0) {
      // Negative quantity - remove from lots using FIFO (BUY negative, SELL, or TRANSFER outbound)
      let sharesToSell = Math.abs(normalizedQuantity);

      while (sharesToSell > 0 && stock.lots.length > 0) {
        const lot = stock.lots[0];

        if (lot.shares <= sharesToSell) {
          // Use entire lot
          sharesToSell -= lot.shares;
          stock.totalShares -= lot.shares;
          stock.lots.shift(); // Remove the lot
        } else {
          // Use partial lot
          lot.shares -= sharesToSell;
          stock.totalShares -= sharesToSell;
          sharesToSell = 0;
        }
      }
    }
  });

  // Calculate average price from remaining lots
  stockMap.forEach((stock) => {
    if (stock.lots.length > 0) {
      const totalValue = stock.lots.reduce(
        (sum: number, lot: { shares: number; price: number }) =>
          sum + lot.shares * lot.price,
        0
      );
      stock.averagePrice = totalValue / stock.totalShares;
    }
  });

  return Array.from(stockMap.values());
}
