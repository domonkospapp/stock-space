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

  // Load saved currency preference and listen for changes
  useEffect(() => {
    const savedCurrency = localStorage.getItem(
      "portfolio-currency"
    ) as Currency;
    if (savedCurrency && (savedCurrency === "EUR" || savedCurrency === "USD")) {
      setSelectedCurrency(savedCurrency);
    }

    // Listen for currency changes from settings or other components
    const handleCurrencyChangeEvent = (event: Event) => {
      const customEvent = event as CustomEvent<Currency>;
      setSelectedCurrency(customEvent.detail);
    };

    window.addEventListener("currencyChange", handleCurrencyChangeEvent);
    return () =>
      window.removeEventListener("currencyChange", handleCurrencyChangeEvent);
  }, []);

  const totalInUSD = roundedTotalUSD || 0;
  const totalInEUR = convertCurrency(totalInUSD, "USD", "EUR");

  return (
    <div>
      <h1 className="text-8xl font-bold text-white font-[hagrid]">
        {isAllCalculated ? (
          formatCurrency(
            selectedCurrency === "USD" ? totalInUSD : totalInEUR,
            selectedCurrency
          )
        ) : (
          <span className="text-gray-400">Calculating...</span>
        )}
      </h1>
    </div>
  );
}
