"use client";

import { useEffect, useState } from "react";
import { hasPortfolioData } from "utils/localStorage";
import { usePortfolioStore } from "../../store/portfolioStore";
import PositionsTreemap from "./components/PositionsTreemap";
import TransactionsChart from "./components/TransactionsChart";

type Currency = "EUR" | "USD";

export default function Portfolio() {
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");

  const positions = usePortfolioStore((s) => s.positions);
  const holdingsMap = usePortfolioStore((s) => s.holdingsMap);
  const convertCurrency = usePortfolioStore((s) => s.convertCurrency);
  const getTransactionsForStock = usePortfolioStore(
    (s) => s.getTransactionsForStock
  );

  useEffect(() => {
    // Load saved currency preference
    const savedCurrency = localStorage.getItem(
      "portfolio-currency"
    ) as Currency;
    if (savedCurrency && (savedCurrency === "EUR" || savedCurrency === "USD")) {
      setSelectedCurrency(savedCurrency);
    }

    setLoading(false);

    // Listen for currency changes
    const handleCurrencyChange = (event: Event) => {
      const customEvent = event as CustomEvent<Currency>;
      setSelectedCurrency(customEvent.detail);
    };

    window.addEventListener("currencyChange", handleCurrencyChange);
    return () =>
      window.removeEventListener("currencyChange", handleCurrencyChange);
  }, []);

  const handleStockSelect = (isin: string) => {
    setSelectedStock(selectedStock === isin ? null : isin);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-[hagrid]">Loading portfolio...</div>
      </div>
    );
  }

  if (!hasPortfolioData() || positions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 font-[hagrid]">
            No Portfolio Data Found
          </h1>
          <p className="mb-4 font-[hagrid]">
            Please upload a CSV file first to view your portfolio.
          </p>
          <a
            href="/fileUpload"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-[hagrid]"
          >
            Go to File Upload
          </a>
        </div>
      </div>
    );
  }

  const displayPositions = Object.values(holdingsMap);

  return (
    <>
      <div className="mb-8 h-[calc(100vh-200px)]">
        <PositionsTreemap
          positions={displayPositions}
          selectedCurrency={selectedCurrency}
          convert={convertCurrency}
          onPositionClick={handleStockSelect}
        />
      </div>

      <TransactionsChart
        transactions={
          selectedStock ? getTransactionsForStock(selectedStock) : []
        }
      />
    </>
  );
}
