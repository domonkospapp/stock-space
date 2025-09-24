"use client";

import { useEffect, useState } from "react";
import { hasPortfolioData } from "utils/localStorage";
import { usePortfolioStore } from "../../store/portfolioStore";
import PortfolioHeader from "./components/PortfolioHeader";
import PortfolioNavigation from "./components/PortfolioNavigation";
import PositionsTreemap from "./components/PositionsTreemap";
import TransactionsChart from "./components/TransactionsChart";

type Currency = "EUR" | "USD";

export default function Portfolio() {
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");

  const positions = usePortfolioStore((s) => s.positions);
  const holdingsMap = usePortfolioStore((s) => s.holdingsMap);
  // const investedUSD = usePortfolioStore((s) => s.investedUSD);
  const totalCurrentValueUSD = usePortfolioStore((s) => s.totalCurrentValueUSD);
  const roundedTotalUSD = usePortfolioStore((s) => s.roundedTotalUSD);
  const convertCurrency = usePortfolioStore((s) => s.convertCurrency);
  const getTransactionsForStock = usePortfolioStore(
    (s) => s.getTransactionsForStock
  );
  const initFromLocalStorage = usePortfolioStore((s) => s.initFromLocalStorage);
  const startCalculations = usePortfolioStore((s) => s.startCalculations);
  const isAllCalculated = usePortfolioStore((s) => s.isAllCalculated());

  useEffect(() => {
    initFromLocalStorage();

    // Load saved currency preference
    const savedCurrency = localStorage.getItem(
      "portfolio-currency"
    ) as Currency;
    if (savedCurrency && (savedCurrency === "EUR" || savedCurrency === "USD")) {
      setSelectedCurrency(savedCurrency);
    }

    setLoading(false);
  }, [initFromLocalStorage]);

  useEffect(() => {
    startCalculations();
  }, [positions.length, startCalculations]);

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
    <div className="min-h-screen p-8" style={{ backgroundColor: "#292929" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <PortfolioNavigation />
          <PortfolioHeader
            selectedCurrency={selectedCurrency}
            isAllCalculated={isAllCalculated}
            totalCurrentValueUSD={totalCurrentValueUSD}
            roundedTotalUSD={roundedTotalUSD}
            // investedUSD={investedUSD}
            convert={convertCurrency}
          />
        </div>

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
      </div>
    </div>
  );
}
