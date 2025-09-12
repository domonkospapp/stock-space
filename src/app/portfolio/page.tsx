"use client";

import { useEffect, useState } from "react";
import { hasPortfolioData } from "utils/localStorage";
import { usePortfolioStore } from "../../store/portfolioStore";
import PortfolioHeader from "./components/PortfolioHeader";
import AllocationPie from "./components/AllocationPie";
import PositionsList from "./components/PositionsList";
import TransactionsChart from "./components/TransactionsChart";

type Currency = "EUR" | "USD";

export default function Portfolio() {
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");

  const positions = usePortfolioStore((s) => s.positions);
  const holdingsMap = usePortfolioStore((s) => s.holdingsMap);
  const investedUSD = usePortfolioStore((s) => s.investedUSD);
  const totalCurrentValueUSD = usePortfolioStore((s) => s.totalCurrentValueUSD);
  const lastPriceUpdate = usePortfolioStore((s) => s.lastPriceUpdate);
  const ratesToUSD = usePortfolioStore((s) => s.ratesToUSD);
  const convertCurrency = usePortfolioStore((s) => s.convertCurrency);
  const getTransactionsForStock = usePortfolioStore(
    (s) => s.getTransactionsForStock
  );
  const initFromLocalStorage = usePortfolioStore((s) => s.initFromLocalStorage);
  const startCalculations = usePortfolioStore((s) => s.startCalculations);
  const isAllCalculated = usePortfolioStore((s) => s.isAllCalculated());

  useEffect(() => {
    initFromLocalStorage();
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
        <div className="text-xl">Loading portfolio...</div>
      </div>
    );
  }

  if (!hasPortfolioData() || positions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Portfolio Data Found</h1>
          <p className="mb-4">
            Please upload a CSV file first to view your portfolio.
          </p>
          <a
            href="/fileUpload"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to File Upload
          </a>
        </div>
      </div>
    );
  }

  const displayPositions = Object.values(holdingsMap);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <PortfolioHeader
          selectedCurrency={selectedCurrency}
          onSelectCurrency={setSelectedCurrency}
          isAllCalculated={isAllCalculated}
          totalCurrentValueUSD={totalCurrentValueUSD}
          investedUSD={investedUSD}
          convert={convertCurrency}
          eurToUsd={ratesToUSD["EUR"]}
          lastPriceUpdate={lastPriceUpdate}
        />

        <div className="mb-8 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">
            Portfolio Performance
          </h2>
          <div className="h-24 text-gray-400 flex items-center">
            Chart coming soon…
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <AllocationPie
            positions={positions}
            selectedCurrency={selectedCurrency}
            convert={convertCurrency}
            ratesToUSD={ratesToUSD}
          />
        </div>

        <PositionsList
          positions={displayPositions}
          selectedStock={selectedStock}
          onSelectStock={handleStockSelect}
          selectedCurrency={selectedCurrency}
          convert={convertCurrency}
          ratesToUSD={ratesToUSD}
        />

        <TransactionsChart
          transactions={
            selectedStock ? getTransactionsForStock(selectedStock) : []
          }
        />
      </div>
    </div>
  );
}
