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
  const positions = usePortfolioStore((s) => s.positions);

  const totalInUSD = roundedTotalUSD || 0;
  const totalInEUR = convertCurrency(totalInUSD, "USD", "EUR");

  // Show 0 if no portfolio data
  if (positions.length === 0) {
    return (
      <h1 className="text-8xl font-bold text-white font-[hagrid] whitespace-nowrap">
        $ 0.00
      </h1>
    );
  }

  return (
    <div>
      <h1 className="text-8xl font-bold text-white font-[hagrid] whitespace-nowrap mt-6">
        {isAllCalculated ? (
          formatCurrency(
            selectedCurrency === "USD" ? totalInUSD : totalInEUR,
            selectedCurrency
          )
        ) : (
          <span className="text-white">Calculating...</span>
        )}
      </h1>
    </div>
  );
}
