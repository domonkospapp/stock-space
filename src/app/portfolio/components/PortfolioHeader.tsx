"use client";

import React from "react";

type Currency = "EUR" | "USD";

type Props = {
  selectedCurrency: Currency;
  onSelectCurrency: (c: Currency) => void;
  isAllCalculated: boolean;
  totalCurrentValueUSD: number;
  investedUSD: number;
  convert: (amount: number, from: string, to: string) => number;
  eurToUsd: number | undefined;
  lastPriceUpdate: Date | null;
};

const formatCurrency = (amount: number, currency: Currency): string => {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: currency,
  });
};

export default function PortfolioHeader(props: Props) {
  const {
    selectedCurrency,
    onSelectCurrency,
    isAllCalculated,
    totalCurrentValueUSD,
    investedUSD,
    convert,
    eurToUsd,
    lastPriceUpdate,
  } = props;

  const total = convert(totalCurrentValueUSD || 0, "USD", selectedCurrency);
  const invested = convert(investedUSD || 0, "USD", selectedCurrency);
  const gainLoss = total - invested;
  const gainLossPercent = invested > 0 ? (total / invested - 1) * 100 : 0;

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-8xl font-bold text-white font-[hagrid]">
          {isAllCalculated ? (
            formatCurrency(total, selectedCurrency)
          ) : (
            <span className="text-gray-400">Calculating...</span>
          )}
        </h1>
        <div className="mt-4 flex space-x-8 text-sm font-[hagrid]">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Invested:</span>
            <span className="text-white font-medium">
              {isAllCalculated ? (
                formatCurrency(invested, selectedCurrency)
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Gain/Loss:</span>
            <span
              className={`font-medium ${
                gainLoss >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {isAllCalculated ? (
                <>
                  {formatCurrency(gainLoss, selectedCurrency)}
                  <span className="ml-1">
                    ({" "}
                    {`${
                      gainLossPercent >= 0 ? "+" : ""
                    }${gainLossPercent.toFixed(1)}%`}{" "}
                    )
                  </span>
                </>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-white text-lg font-medium font-[hagrid]">
          Currency:
        </span>
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => onSelectCurrency("USD")}
            className={`px-4 py-2 rounded-md font-medium transition-colors font-[hagrid] ${
              selectedCurrency === "USD"
                ? "bg-blue-500 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            USD
          </button>
          <button
            onClick={() => onSelectCurrency("EUR")}
            className={`px-4 py-2 rounded-md font-medium transition-colors font-[hagrid] ${
              selectedCurrency === "EUR"
                ? "bg-blue-500 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            EUR
          </button>
        </div>
        <div
          className="text-xs text-gray-400 font-[hagrid]"
          title={`Real-time exchange rate: 1 EUR = ${
            eurToUsd ? eurToUsd.toFixed(4) : "-"
          } USD`}
        >
          {eurToUsd
            ? `ⓘ 1 EUR = ${eurToUsd.toFixed(4)} USD`
            : "🔄 Loading rates..."}
        </div>
        {lastPriceUpdate && (
          <div className="text-xs text-gray-500 font-[hagrid]">
            Last updated: {lastPriceUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
