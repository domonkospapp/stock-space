export type ProcessedTransaction = {
  date: string;
  stockName: string;
  isin: string;
  amount: number;
  price: string;
  currency: string;
  transactionInfo: string;
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

export type SplitTransaction = {
  isin: string;
  date: Date;
  ratio: number;
  buchungsinfo: string;
  isIsinChanging?: boolean;
  affectedIsins?: string[];
};
