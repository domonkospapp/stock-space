"use client";

import React from "react";

type Currency = "EUR" | "USD";

type Props = {
  selectedCurrency: Currency;
  isAllCalculated: boolean;
  totalCurrentValueUSD: number;
  // investedUSD: number;
  convert: (amount: number, from: string, to: string) => number;
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
    isAllCalculated,
    totalCurrentValueUSD,
    // investedUSD,
    convert,
  } = props;

  const total = convert(totalCurrentValueUSD || 0, "USD", selectedCurrency);
  // const invested = convert(investedUSD || 0, "USD", selectedCurrency);
  // const gainLoss = total - invested;
  // const gainLossPercent = invested > 0 ? (total / invested - 1) * 100 : 0;

  return (
    <div>
      <h1 className="text-8xl font-bold text-white font-[hagrid]">
        {isAllCalculated ? (
          formatCurrency(total, selectedCurrency)
        ) : (
          <span className="text-gray-400">Calculating...</span>
        )}
      </h1>
      {/* <div className="mt-4 flex space-x-8 text-sm font-[hagrid]">
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
                  {`${gainLossPercent >= 0 ? "+" : ""}${gainLossPercent.toFixed(
                    1
                  )}%`}{" "}
                  )
                </span>
              </>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </span>
        </div>
      </div> */}
    </div>
  );
}
