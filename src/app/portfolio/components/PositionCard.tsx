"use client";

import React from "react";
import { Position } from "utils/types";

type Currency = "EUR" | "USD";

type Props = {
  position: Position;
  color: string;
  isSelected: boolean;
  onSelect: () => void;
  selectedCurrency: Currency;
  convert: (amount: number, from: string, to: string) => number;
  ratesToUSD: Record<string, number>;
};

const formatCurrency = (amount: number, currency: Currency): string => {
  return Math.round(amount).toLocaleString("en-US", {
    style: "currency",
    currency: currency,
  });
};

const formatAnyCurrency = (amount: number, currency: string): string => {
  return Math.round(amount).toLocaleString("en-US", {
    style: "currency",
    currency,
  });
};

export default function PositionCard(props: Props) {
  const {
    position,
    color,
    isSelected,
    onSelect,
    selectedCurrency,
    convert,
    ratesToUSD,
  } = props;
  const positionValueUSD = position.currentValue || 0;
  const percentageBase = (() => {
    const rate =
      position.currency === "USD" ? 1 : ratesToUSD[position.currency] || 1;
    return position.totalShares * position.averagePrice * rate;
  })();
  const percentage =
    percentageBase > 0 ? (positionValueUSD / percentageBase) * 100 : 0;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
        isSelected
          ? "bg-blue-700 border-blue-500"
          : "bg-gray-700 border-gray-600 hover:bg-gray-600"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-3">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div>
          <div className="font-semibold text-white">{position.stockName}</div>
          <div className="text-sm text-gray-400">{position.isin}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-white">
          {formatCurrency(
            convert(positionValueUSD, "USD", selectedCurrency),
            selectedCurrency
          )}
        </div>
        <div className="text-sm text-gray-400">{percentage.toFixed(1)}%</div>
        <div className="text-sm text-gray-400">
          {position.totalShares} shares
        </div>
        <div className="text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <span>Current Price:</span>
            <span className="font-medium">
              {formatAnyCurrency(
                convert(
                  position.currentPrice || 0,
                  position.currentPriceCurrency || "USD",
                  position.currentPriceCurrency || "USD"
                ),
                position.currentPriceCurrency || "USD"
              )}
            </span>
            {position.currentPriceCurrency && (
              <span className="text-xs bg-blue-600 px-1 py-0.5 rounded">
                {position.currentPriceCurrency}
              </span>
            )}
            <span className="text-xs text-gray-300 ml-2">
              {formatCurrency(
                convert(
                  position.currentPrice || 0,
                  position.currentPriceCurrency || "USD",
                  selectedCurrency
                ),
                selectedCurrency
              )}
            </span>
            {position.currentPrice && (
              <span
                className={`text-xs px-1 py-0.5 rounded ${(() => {
                  const currentPriceUSD = convert(
                    position.currentPrice || 0,
                    position.currentPriceCurrency || "USD",
                    "USD"
                  );
                  const averagePriceUSD = convert(
                    position.averagePrice,
                    position.currency,
                    "USD"
                  );
                  return currentPriceUSD > averagePriceUSD
                    ? "bg-green-600 text-white"
                    : currentPriceUSD < averagePriceUSD
                    ? "bg-red-600 text-white"
                    : "bg-gray-600 text-white";
                })()}`}
              >
                {(() => {
                  const currentPriceUSD = convert(
                    position.currentPrice || 0,
                    position.currentPriceCurrency || "USD",
                    "USD"
                  );
                  const averagePriceUSD = convert(
                    position.averagePrice,
                    position.currency,
                    "USD"
                  );
                  return currentPriceUSD > averagePriceUSD
                    ? "↗"
                    : currentPriceUSD < averagePriceUSD
                    ? "↘"
                    : "→";
                })()}
                {(() => {
                  const currentPriceUSD = convert(
                    position.currentPrice || 0,
                    position.currentPriceCurrency || "USD",
                    "USD"
                  );
                  const averagePriceUSD = convert(
                    position.averagePrice,
                    position.currency,
                    "USD"
                  );
                  const priceChange =
                    averagePriceUSD > 0
                      ? ((currentPriceUSD - averagePriceUSD) /
                          averagePriceUSD) *
                        100
                      : 0;
                  return ` ${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(
                    1
                  )}%`;
                })()}
              </span>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-400 mt-1 pt-1 border-t border-gray-600">
          <div className="flex justify-between">
            <span>Invested:</span>
            <span>
              {formatCurrency(
                convert(
                  position.totalShares * position.averagePrice,
                  position.currency,
                  selectedCurrency
                ),
                selectedCurrency
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="sr-only">Total</span>
          </div>
        </div>

        <div className="text-sm text-gray-400 mt-1">
          {formatCurrency(
            convert(position.averagePrice, position.currency, selectedCurrency),
            selectedCurrency
          )}{" "}
          avg
          <span
            className="ml-1 text-xs bg-gray-600 px-1 py-0.5 rounded cursor-help"
            title={`Original currency: ${position.currency}. Converted using real-time rate.`}
          >
            {position.currency}
          </span>
        </div>
      </div>
    </div>
  );
}
