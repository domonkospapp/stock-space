"use client";

import { useEffect, useState } from "react";
import { Position, Transaction } from "utils/types";
import {
  loadPortfolioFromLocalStorage,
  hasPortfolioData,
} from "utils/localStorage";

export default function Portfolio() {
  const [portfolioSummary, setPortfolioSummary] = useState<Position[]>([]);
  const [processedTransactions, setProcessedTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  useEffect(() => {
    if (hasPortfolioData()) {
      const data = loadPortfolioFromLocalStorage();
      setPortfolioSummary(data.portfolioSummary);
      setProcessedTransactions(data.processedTransactions);
    }
    setLoading(false);
  }, []);

  const calculateTotalValue = (positions: Position[]): number => {
    return positions.reduce((total, position) => {
      if (position.totalShares > 0 && position.averagePrice > 0) {
        return total + position.totalShares * position.averagePrice;
      }
      return total;
    }, 0);
  };

  const getTransactionsForStock = (isin: string): Transaction[] => {
    return processedTransactions.filter(
      (transaction) => transaction.isin === isin
    );
  };

  const handleStockSelect = (isin: string) => {
    setSelectedStock(selectedStock === isin ? null : isin);
  };

  const createPieChart = (positions: Position[]) => {
    const totalValue = calculateTotalValue(positions);
    if (totalValue === 0) return null;

    let currentAngle = 0;

    return positions
      .filter(
        (position) => position.totalShares > 0 && position.averagePrice > 0
      )
      .map((position, index) => {
        const positionValue = position.totalShares * position.averagePrice;
        const percentage = (positionValue / totalValue) * 100;
        const angle = (percentage / 100) * 360;

        const startAngle = currentAngle;
        currentAngle += angle;

        const colors = [
          "#FF6B6B",
          "#4ECDC4",
          "#45B7D1",
          "#96CEB4",
          "#FFEAA7",
          "#DDA0DD",
          "#98D8C8",
          "#F7DC6F",
          "#BB8FCE",
          "#85C1E9",
          "#F8C471",
          "#82E0AA",
        ];

        return (
          <div
            key={`${position.isin}-${index}`}
            className="absolute w-full h-full rounded-full"
            style={{
              background: `conic-gradient(${
                colors[index % colors.length]
              } ${startAngle}deg, ${
                colors[index % colors.length]
              } ${currentAngle}deg, transparent ${currentAngle}deg)`,
              transform: "rotate(-90deg)",
            }}
            title={`${position.stockName}: ${percentage.toFixed(
              1
            )}% (€${positionValue.toFixed(2)})`}
          />
        );
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading portfolio...</div>
      </div>
    );
  }

  if (!hasPortfolioData() || portfolioSummary.length === 0) {
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

  const totalValue = calculateTotalValue(portfolioSummary);
  const activePositions = portfolioSummary.filter(
    (position) => position.totalShares > 0
  );

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-8xl font-bold mb-8 text-white">
          {totalValue.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </h1>

        {/* Stock Chart */}
        <div className="mb-8 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">
            Portfolio Performance
          </h2>
          <div className="relative h-64 bg-gray-900 border border-gray-700 rounded-lg p-4">
            {/* Chart Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-t border-gray-600" />
              ))}
            </div>

            {/* Stock Chart Line */}
            <div className="relative h-full">
              {(() => {
                const points = [];
                const width = 800;
                const height = 200;
                let currentPrice = 100;

                for (let i = 0; i < 30; i++) {
                  // Random price movement
                  const change = (Math.random() - 0.5) * 20;
                  currentPrice = Math.max(
                    50,
                    Math.min(150, currentPrice + change)
                  );

                  const x = (i / 29) * width;
                  const y = height - ((currentPrice - 50) / 100) * height;

                  points.push({ x, y, price: currentPrice });
                }

                return (
                  <>
                    {/* Chart Line */}
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 800 200"
                    >
                      <path
                        d={`M ${points
                          .map((p) => `${p.x},${p.y}`)
                          .join(" L ")}`}
                        stroke="#3B82F6"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Area fill */}
                      <path
                        d={`M 0,${height} L ${points
                          .map((p) => `${p.x},${p.y}`)
                          .join(" L ")} L ${width},${height} Z`}
                        fill="url(#gradient)"
                        opacity="0.2"
                      />
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3B82F6"
                            stopOpacity="0.8"
                          />
                          <stop
                            offset="100%"
                            stopColor="#3B82F6"
                            stopOpacity="0.1"
                          />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Price Points */}
                    {points.map((point, index) => (
                      <div
                        key={index}
                        className="absolute w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1 -translate-y-1 cursor-pointer hover:scale-150 transition-transform"
                        style={{
                          left: `${(point.x / 800) * 100}%`,
                          top: `${(point.y / 200) * 100}%`,
                        }}
                        title={`Day ${index + 1}: €${point.price.toFixed(2)}`}
                      />
                    ))}

                    {/* Current Price Display */}
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      €{points[points.length - 1]?.price.toFixed(2)}
                    </div>

                    {/* Performance Indicator */}
                    <div className="absolute bottom-2 left-2 flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          points[points.length - 1]?.price > points[0]?.price
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          points[points.length - 1]?.price > points[0]?.price
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {points[points.length - 1]?.price > points[0]?.price
                          ? "↗"
                          : "↘"}
                        {Math.abs(
                          ((points[points.length - 1]?.price -
                            points[0]?.price) /
                            points[0]?.price) *
                            100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pie Chart */}
          <div className="lg:col-span-1 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              Portfolio Allocation
            </h2>
            <div className="relative w-80 h-80 mx-auto">
              {createPieChart(portfolioSummary)}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {activePositions.length}
                  </div>
                  <div className="text-sm text-gray-500">Positions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Details */}
          <div className="lg:col-span-2 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              Position Details
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activePositions.map((position, index) => {
                const positionValue =
                  position.totalShares * position.averagePrice;
                const percentage =
                  totalValue > 0 ? (positionValue / totalValue) * 100 : 0;
                const colors = [
                  "#FF6B6B",
                  "#4ECDC4",
                  "#45B7D1",
                  "#96CEB4",
                  "#FFEAA7",
                  "#DDA0DD",
                  "#98D8C8",
                  "#F7DC6F",
                  "#BB8FCE",
                  "#85C1E9",
                  "#F8C471",
                  "#82E0AA",
                ];

                return (
                  <div
                    key={position.isin}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                      selectedStock === position.isin
                        ? "bg-blue-700 border-blue-500"
                        : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                    }`}
                    onClick={() => handleStockSelect(position.isin)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: colors[index % colors.length],
                        }}
                      />
                      <div>
                        <div className="font-semibold text-white">
                          {position.stockName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {position.isin}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        €{positionValue.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">
                        {position.totalShares} shares
                      </div>
                      <div className="text-sm text-gray-400">
                        €{position.averagePrice.toFixed(2)} avg
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cumulative Stock Count Chart */}
        {selectedStock ? (
          <div className="mt-8 bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              Cumulative Stock Count Over Time
            </h3>
            <div className="space-y-4">
              {(() => {
                const transactions = getTransactionsForStock(selectedStock);
                const cumulativeData = transactions.reduce(
                  (acc, transaction) => {
                    const date = new Date(transaction.date);
                    const monthYear = date.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    });

                    if (!acc[monthYear]) {
                      acc[monthYear] = { shares: 0, transactions: 0 };
                    }

                    if (transaction.type === "BUY") {
                      acc[monthYear].shares += transaction.amount;
                    } else if (transaction.type === "SELL") {
                      acc[monthYear].shares -= transaction.amount;
                    }
                    acc[monthYear].transactions += 1;

                    return acc;
                  },
                  {} as Record<string, { shares: number; transactions: number }>
                );

                // Convert to array and sort by date
                const sortedData = Object.entries(cumulativeData)
                  .map(([monthYear, data]) => ({ monthYear, ...data }))
                  .sort(
                    (a, b) =>
                      new Date(a.monthYear).getTime() -
                      new Date(b.monthYear).getTime()
                  );

                // Calculate running total
                let runningTotal = 0;
                const chartData = sortedData.map((item) => {
                  runningTotal += item.shares;
                  return { ...item, cumulativeShares: runningTotal };
                });

                const maxShares = Math.max(
                  ...chartData.map((d) => d.cumulativeShares),
                  1
                );

                return chartData.map((data, index) => (
                  <div key={data.monthYear} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">
                        {data.monthYear}
                      </span>
                      <span className="text-sm text-gray-400">
                        {data.transactions} transactions
                      </span>
                    </div>
                    <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 border-r border-gray-600 last:border-r-0"
                          />
                        ))}
                      </div>
                      {/* Bar */}
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-lime-400 to-lime-500 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${
                            (data.cumulativeShares / maxShares) * 100
                          }%`,
                          minWidth: "20px",
                        }}
                      />
                      {/* Value label */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-medium text-white px-2">
                          {data.cumulativeShares.toLocaleString()} shares
                        </span>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        ) : (
          <div className="mt-8 bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-xl">
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">
                👆 Click on any position above to view its purchase history
              </div>
              <div className="text-gray-500 text-sm">
                You'll see all transactions, current shares, and average price
                for the selected stock
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
