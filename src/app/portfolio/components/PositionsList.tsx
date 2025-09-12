"use client";

import React from "react";
import { Position } from "utils/types";
import PositionCard from "./PositionCard";

type Currency = "EUR" | "USD";

type Props = {
  positions: Position[];
  selectedStock: string | null;
  onSelectStock: (isin: string) => void;
  selectedCurrency: Currency;
  convert: (amount: number, from: string, to: string) => number;
  ratesToUSD: Record<string, number>;
};

// Generate colors for different positions
const generateColors = (count: number): string[] => {
  const colors = [
    "#3B82F6", // blue
    "#EF4444", // red
    "#10B981", // green
    "#F59E0B", // yellow
    "#8B5CF6", // purple
    "#F97316", // orange
    "#06B6D4", // cyan
    "#84CC16", // lime
    "#EC4899", // pink
    "#6B7280", // gray
  ];

  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
};

export default function PositionsList(props: Props) {
  const {
    positions,
    selectedStock,
    onSelectStock,
    selectedCurrency,
    convert,
    ratesToUSD,
  } = props;

  const colors = generateColors(positions.length);

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Positions</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {positions.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No positions found
          </div>
        ) : (
          positions.map((position, index) => (
            <PositionCard
              key={position.isin}
              position={position}
              color={colors[index]}
              isSelected={selectedStock === position.isin}
              onSelect={() => onSelectStock(position.isin)}
              selectedCurrency={selectedCurrency}
              convert={convert}
              ratesToUSD={ratesToUSD}
            />
          ))
        )}
      </div>
    </div>
  );
}

