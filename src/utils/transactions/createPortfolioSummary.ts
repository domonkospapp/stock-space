import { Position, Transaction } from "utils/types";

export function createPortfolioSummary(
  transactions: Transaction[],
): Position[] {
  const stockMap = new Map<string, Position>();

  transactions.forEach((transaction) => {
    if (!stockMap.has(transaction.isin)) {
      stockMap.set(transaction.isin, {
        stockName: transaction.stockName,
        isin: transaction.isin,
        totalShares: 0,
        averagePrice: 0,
        currency: transaction.currency,
        lots: [],
      });
    }

    const stock = stockMap.get(transaction.isin)!;

    if (transaction.amount > 0) {
      // Buy transaction - add to lots
      stock.lots.push({
        shares: transaction.amount,
        price: transaction.price,
      });
      stock.totalShares += transaction.amount;
    } else if (transaction.amount < 0) {
      // Sell transaction - remove from lots using FIFO
      let sharesToSell = Math.abs(transaction.amount);

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
        0,
      );
      stock.averagePrice = totalValue / stock.totalShares;
    }
  });

  return Array.from(stockMap.values());
}
