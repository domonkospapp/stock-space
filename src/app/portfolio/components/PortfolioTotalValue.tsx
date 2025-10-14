"use client";

import { useEffect, useState } from "react";
import { usePortfolioStore } from "../../../store/portfolioStore";

type Currency = "EUR" | "USD";

const formatCurrency = (amount: number, currency: Currency): string => {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export default function PortfolioTotalValue() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");

  const roundedTotalUSD = usePortfolioStore((s) => s.roundedTotalUSD);
  const convertCurrency = usePortfolioStore((s) => s.convertCurrency);
  const isAllCalculated = usePortfolioStore((s) => s.isAllCalculated());

  // Load saved currency preference
  useEffect(() => {
    const savedCurrency = localStorage.getItem(
      "portfolio-currency"
    ) as Currency;
    if (savedCurrency && (savedCurrency === "EUR" || savedCurrency === "USD")) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  return (
    <div>
      <h1 className="text-8xl font-bold text-white font-[hagrid]">
        {isAllCalculated ? (
          formatCurrency(
            convertCurrency(roundedTotalUSD || 0, "USD", selectedCurrency),
            selectedCurrency
          )
        ) : (
          <span className="text-gray-400">Calculating...</span>
        )}
      </h1>
    </div>
  );
}

