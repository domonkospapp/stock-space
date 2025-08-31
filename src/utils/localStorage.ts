import { Position, Transaction } from "./types";

const PORTFOLIO_SUMMARY_KEY = "portfolio_summary";
const PROCESSED_TRANSACTIONS_KEY = "processed_transactions";

export const savePortfolioToLocalStorage = (
  portfolioSummary: Position[],
  processedTransactions: Transaction[],
): void => {
  try {
    localStorage.setItem(
      PORTFOLIO_SUMMARY_KEY,
      JSON.stringify(portfolioSummary),
    );
    localStorage.setItem(
      PROCESSED_TRANSACTIONS_KEY,
      JSON.stringify(processedTransactions),
    );
    console.log("Portfolio data saved to local storage successfully");
  } catch (error) {
    console.error("Error saving portfolio to local storage:", error);
  }
};

export const loadPortfolioFromLocalStorage = (): {
  portfolioSummary: Position[];
  processedTransactions: Transaction[];
} => {
  try {
    const portfolioSummary = localStorage.getItem(PORTFOLIO_SUMMARY_KEY);
    const processedTransactions = localStorage.getItem(
      PROCESSED_TRANSACTIONS_KEY,
    );

    return {
      portfolioSummary: portfolioSummary ? JSON.parse(portfolioSummary) : [],
      processedTransactions: processedTransactions
        ? JSON.parse(processedTransactions)
        : [],
    };
  } catch (error) {
    console.error("Error loading portfolio from local storage:", error);
    return {
      portfolioSummary: [],
      processedTransactions: [],
    };
  }
};

export const clearPortfolioFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(PORTFOLIO_SUMMARY_KEY);
    localStorage.removeItem(PROCESSED_TRANSACTIONS_KEY);
    console.log("Portfolio data cleared from local storage");
  } catch (error) {
    console.error("Error clearing portfolio from local storage:", error);
  }
};

export const hasPortfolioData = (): boolean => {
  try {
    return !!(
      localStorage.getItem(PORTFOLIO_SUMMARY_KEY) &&
      localStorage.getItem(PROCESSED_TRANSACTIONS_KEY)
    );
  } catch (error) {
    console.error("Error checking portfolio data in local storage:", error);
    return false;
  }
};
