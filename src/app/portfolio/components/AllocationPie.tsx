"use client";

import React from "react";
import { Position } from "utils/types";

type Currency = "EUR" | "USD";

type Props = {
  positions: Position[];
  selectedCurrency: Currency;
  convert: (amount: number, from: string, to: string) => number;
  ratesToUSD: Record<string, number>;
};

export default function AllocationPie(props: Props) {
  const { positions, selectedCurrency, convert, ratesToUSD } = props;

  const totalValueUSD = positions.reduce((total, position) => {
    if (position.totalShares > 0 && position.averagePrice > 0) {
      const rateToUSD =
        position.currency === "USD" ? 1 : ratesToUSD[position.currency] || 1;
      return total + position.totalShares * position.averagePrice * rateToUSD;
    }
    return total;
  }, 0);

  if (totalValueUSD === 0) return null;

  let currentAngle = 0;
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
    <div className="lg:col-span-1 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">
        Portfolio Allocation
      </h2>
      <div className="relative w-80 h-80 mx-auto">
        {positions
          .filter(
            (position) => position.totalShares > 0 && position.averagePrice > 0
          )
          .map((position, index) => {
            const rateToUSD =
              position.currency === "USD"
                ? 1
                : ratesToUSD[position.currency] || 1;
            const positionValueUSD =
              position.totalShares * position.averagePrice * rateToUSD;
            const percentage = (positionValueUSD / totalValueUSD) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

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
                title={`${position.stockName}: ${percentage.toFixed(1)}%`}
              />
            );
          })}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">
              {positions.filter((p) => p.totalShares > 0).length}
            </div>
            <div className="text-sm text-gray-500">Positions</div>
          </div>
        </div>
      </div>
    </div>
  );
}


