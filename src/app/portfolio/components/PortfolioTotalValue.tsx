"use client";

import { usePortfolioStore } from "../../../store/portfolioStore";
import { useSettingsStore } from "../../../store/settingsStore";

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
  const selectedCurrency = useSettingsStore((s) => s.selectedCurrency);
  const roundedTotalUSD = usePortfolioStore((s) => s.roundedTotalUSD);
  const convertCurrency = usePortfolioStore((s) => s.convertCurrency);
  const isAllCalculated = usePortfolioStore((s) => s.isAllCalculated());

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
