export type CsvTransaction = {
  date: string;
  stockName: string;
  isin: string;
  amount: number;
  price: number;
  currency: string;
  transactionInfo: string;
};

export type TransactionType = "BUY" | "SELL" | "TRANSFER" | "OTHER";

export interface Transaction {
  id: string;
  date: string;
  stockName: string;
  isin: string;
  amount: number;
  price: number;
  currency: string;
  type: TransactionType;
}

export interface MonthlyHoldingValue {
  date: string;
  totalMonthlyValue: number;
  holdings: {
    stockName: string;
    isin: string;
    totalShares: number;
    value: number | null;
    currency: string | null;
    price: number | null; // Converted historical price
    originalPrice: number | null; // Original historical price
    originalPriceCurrency: string | null; // Original currency of the historical price
  }[];
}

export type Position = {
  stockName: string;
  isin: string;
  totalShares: number;
  averagePrice: number;
  currency: string;
  currentPrice?: number;
  currentPriceCurrency?: string;
  currentValue?: number;
  gainLoss?: number;
  gainLossPercent?: number;
  ticker?: string;
  lots: Array<{
    shares: number;
    price: number;
  }>;
};
