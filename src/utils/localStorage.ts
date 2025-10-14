import { Position, Transaction } from "./types";

const PORTFOLIO_SUMMARY_KEY = "portfolio_summary";
const PROCESSED_TRANSACTIONS_KEY = "processed_transactions";
const EXCHANGE_RATES_KEY = "portfolio_exchange_rates";
const CALCULATED_PRICES_KEY = "portfolio_calculated_prices";
const LAST_UPDATE_KEY = "portfolio_last_update";

export const savePortfolioToLocalStorage = (
  portfolioSummary: Position[],
  processedTransactions: Transaction[]
): void => {
  try {
    localStorage.setItem(
      PORTFOLIO_SUMMARY_KEY,
      JSON.stringify(portfolioSummary)
    );
    localStorage.setItem(
      PROCESSED_TRANSACTIONS_KEY,
      JSON.stringify(processedTransactions)
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
      PROCESSED_TRANSACTIONS_KEY
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

// Save exchange rates to local storage
export const saveExchangeRates = (rates: Record<string, number>): void => {
  try {
    localStorage.setItem(EXCHANGE_RATES_KEY, JSON.stringify(rates));
  } catch (error) {
    console.error("Error saving exchange rates:", error);
  }
};

// Load exchange rates from local storage
export const loadExchangeRates = (): Record<string, number> => {
  try {
    const rates = localStorage.getItem(EXCHANGE_RATES_KEY);
    return rates ? JSON.parse(rates) : { USD: 1 };
  } catch (error) {
    console.error("Error loading exchange rates:", error);
    return { USD: 1 };
  }
};

// Save calculated holdings data
export const saveCalculatedData = (
  holdingsMap: Record<string, Position>,
  calculatedIsins: Record<string, boolean>
): void => {
  try {
    localStorage.setItem(
      CALCULATED_PRICES_KEY,
      JSON.stringify({ holdingsMap, calculatedIsins })
    );
    localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
  } catch (error) {
    console.error("Error saving calculated data:", error);
  }
};

// Load calculated holdings data
export const loadCalculatedData = (): {
  holdingsMap: Record<string, Position>;
  calculatedIsins: Record<string, boolean>;
  lastUpdate: Date | null;
} => {
  try {
    const data = localStorage.getItem(CALCULATED_PRICES_KEY);
    const lastUpdateStr = localStorage.getItem(LAST_UPDATE_KEY);

    if (data) {
      const parsed = JSON.parse(data);
      return {
        holdingsMap: parsed.holdingsMap || {},
        calculatedIsins: parsed.calculatedIsins || {},
        lastUpdate: lastUpdateStr ? new Date(lastUpdateStr) : null,
      };
    }
  } catch (error) {
    console.error("Error loading calculated data:", error);
  }

  return {
    holdingsMap: {},
    calculatedIsins: {},
    lastUpdate: null,
  };
};

// Clear ALL portfolio data from local storage (including settings)
export const clearAllPortfolioData = (): void => {
  try {
    localStorage.removeItem(PORTFOLIO_SUMMARY_KEY);
    localStorage.removeItem(PROCESSED_TRANSACTIONS_KEY);
    localStorage.removeItem(EXCHANGE_RATES_KEY);
    localStorage.removeItem(CALCULATED_PRICES_KEY);
    localStorage.removeItem(LAST_UPDATE_KEY);
    localStorage.removeItem("portfolio-currency");
    console.log("All portfolio data cleared from local storage");
  } catch (error) {
    console.error("Error clearing portfolio from local storage:", error);
  }
};

// Legacy function - kept for compatibility
export const clearPortfolioFromLocalStorage = clearAllPortfolioData;

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
