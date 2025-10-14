"use client";

import { useState } from "react";
import { usePortfolioStore } from "../../store/portfolioStore";
import { useSettingsStore } from "../../store/settingsStore";
import PositionsTreemap from "./components/PositionsTreemap";
import TransactionsChart from "./components/TransactionsChart";

export default function Portfolio() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  const positions = usePortfolioStore((s) => s.positions);
  const holdingsMap = usePortfolioStore((s) => s.holdingsMap);
  const convertCurrency = usePortfolioStore((s) => s.convertCurrency);
  const getTransactionsForStock = usePortfolioStore(
    (s) => s.getTransactionsForStock
  );
  const selectedCurrency = useSettingsStore((s) => s.selectedCurrency);

  const handleStockSelect = (isin: string) => {
    setSelectedStock(selectedStock === isin ? null : isin);
  };

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <svg
              className="w-24 h-24 mx-auto mb-6 text-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-4xl font-bold text-white font-[hagrid] mb-4">
              No Portfolio Data
            </h2>
            <p className="text-xl text-gray-300 font-[urbanist] mb-8">
              Upload your Flatex CSV file to start tracking your investments
            </p>
          </div>
          <a
            href="/fileUpload"
            className="inline-flex items-center space-x-2 bg-ci-yellow hover:bg-ci-yellow/80 text-ci-black px-8 py-4 rounded-full transition-colors font-[urbanist] font-bold text-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span>Upload CSV File</span>
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
