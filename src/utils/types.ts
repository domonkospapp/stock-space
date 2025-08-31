export type CsvTransaction = {
  date: string;
  stockName: string;
  isin: string;
  amount: number;
  price: string;
  currency: string;
  transactionInfo: string;
};

export type TransactionType = "BUY" | "SELL" | "TRANSFER" | "OTHER";

export type Transaction = {
  date: string;
  stockName: string;
  isin: string;
  amount: number;
  price: string;
  currency: string;
  type: TransactionType;
};

export type StockSummary = {
  stockName: string;
  isin: string;
  totalShares: number;
  averagePrice: number;
  currency: string;
  currentPrice?: number;
  currentValue?: number;
  gainLoss?: number;
  gainLossPercent?: number;
  lots: Array<{
    shares: number;
    price: number;
  }>;
};
