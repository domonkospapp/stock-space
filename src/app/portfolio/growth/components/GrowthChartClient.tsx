"use client";

import { usePortfolioStore } from "../../../../store/portfolioStore";
import { useEffect, useMemo } from "react";
import { useSettingsStore } from "../../../../store/settingsStore";
import MonthlyGrowthChart from "./MonthlyGrowthChart";

export default function GrowthChartClient() {
  const processedTransactions = usePortfolioStore(
    (s) => s.processedTransactions
  );
  const monthlyHoldingValues = usePortfolioStore((s) => s.monthlyHoldingValues);
  const startGrowthDataCalculations = usePortfolioStore(
    (s) => s.startGrowthDataCalculations
  );
  const isGrowthDataCalculating = usePortfolioStore(
    (s) => s.isGrowthDataCalculating
  );
  const lastGrowthDataUpdate = usePortfolioStore((s) => s.lastGrowthDataUpdate);

  const selectedCurrency = useSettingsStore((s) => s.selectedCurrency);
  const convertCurrency = usePortfolioStore((s) => s.convertCurrency);

  // Only fetch if data is missing or stale - don't refetch on currency change
  useEffect(() => {
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const shouldFetch =
      !isGrowthDataCalculating &&
      (monthlyHoldingValues.length === 0 ||
        !lastGrowthDataUpdate ||
        new Date().getTime() - lastGrowthDataUpdate.getTime() > ONE_HOUR_MS);

    if (processedTransactions.length > 0 && shouldFetch) {
      startGrowthDataCalculations(
        processedTransactions,
        selectedCurrency,
        convertCurrency
      );
    }
    // Removed selectedCurrency from dependencies to prevent refetch on currency change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    processedTransactions,
    convertCurrency,
    startGrowthDataCalculations,
    isGrowthDataCalculating,
    lastGrowthDataUpdate,
    monthlyHoldingValues.length,
  ]);

  // Recalculate chart data when currency changes using existing historical prices
  const chartData = useMemo(() => {
    return monthlyHoldingValues.map((monthData) => {
      let totalMonthlyValue = 0;

      // Recalculate values for each holding based on current currency
      const recalculatedHoldings = monthData.holdings.map((holding) => {
        let convertedPrice = holding.price;
        let priceCurrency = holding.currency;

        // If we have original price data and currency changed, recalculate
        if (
          holding.originalPrice !== null &&
          holding.originalPriceCurrency !== null &&
          holding.originalPriceCurrency !== selectedCurrency
        ) {
          convertedPrice = convertCurrency(
            holding.originalPrice,
            holding.originalPriceCurrency,
            selectedCurrency
          );
          priceCurrency = selectedCurrency;
        } else if (
          holding.price !== null &&
          holding.currency !== null &&
          holding.currency !== selectedCurrency
        ) {
          // Fallback: convert from stored price if original not available
          convertedPrice = convertCurrency(
            holding.price,
            holding.currency,
            selectedCurrency
          );
          priceCurrency = selectedCurrency;
        }

        const value = convertedPrice
          ? holding.totalShares * convertedPrice
          : null;
        if (value) {
          totalMonthlyValue += value;
        }

        return {
          ...holding,
          value,
          currency: priceCurrency,
          price: convertedPrice,
        };
      });

      return {
        date: monthData.date,
        totalMonthlyValue,
        currency: selectedCurrency,
      };
    });
  }, [monthlyHoldingValues, selectedCurrency, convertCurrency]);

  const isLoadingInitialData =
    monthlyHoldingValues.length === 0 && isGrowthDataCalculating;

  if (isLoadingInitialData) {
    return (
      <div className="flex flex-col space-y-8">
        <h2 className="text-4xl font-bold text-white font-[hagrid]">
          Growth History
        </h2>
        <p className="text-white font-urbanist text-lg mt-4">
          Loading historical data... ⏳
        </p>
      </div>
    );
  }

  if (monthlyHoldingValues.length === 0) {
    return (
      <div className="flex flex-col space-y-8">
        <h2 className="text-4xl font-bold text-white font-[hagrid]">
          Growth History
        </h2>
        <p className="text-white font-urbanist text-lg mt-4">
          No historical data available. Upload your Flatex CSV file to start
          tracking your investments.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8">
      {isGrowthDataCalculating && monthlyHoldingValues.length > 0 && (
        <p className="text-gray-400 font-urbanist text-sm text-right">
          Updating data in background... 🔄
        </p>
      )}
      <MonthlyGrowthChart
        data={chartData}
        selectedCurrency={selectedCurrency}
      />
      {/* <h1 className="text-white font-urbanist text-3xl font-bold">
        Growth History
      </h1>
      <h2 className="text-4xl font-bold text-white font-[hagrid]">
        Growth History
      </h2>
      {monthlyHoldingValues.map((monthData) => (
        <div
          key={monthData.date}
          className="bg-dark-blue p-6 rounded-lg shadow-lg mb-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            {monthData.date}
          </h2>
          <p className="text-white text-lg font-semibold mb-4">
            Total Monthly Value:{" "}
            {monthData.totalMonthlyValue !== null &&
            monthData.totalMonthlyValue !== undefined
              ? monthData.totalMonthlyValue.toLocaleString("en-US", {
                  style: "currency",
                  currency: selectedCurrency,
                })
              : "N/A"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthData.holdings.map((holding) => (
              <div key={holding.isin} className="bg-gray-700 p-4 rounded-md">
                <p className="text-white font-bold">{holding.stockName}</p>
                <p className="text-gray-300">ISIN: {holding.isin}</p>
                <p className="text-gray-300">Shares: {holding.totalShares}</p>
                <p className="text-green-400">
                  Value:{" "}
                  {holding.value !== null
                    ? holding.value.toLocaleString("en-US", {
                        style: "currency",
                        currency: selectedCurrency,
                      })
                    : "N/A"}
                </p>
                <p className="text-blue-400">
                  Historical Price:{" "}
                  {holding.price !== null
                    ? holding.price.toLocaleString("en-US", {
                        style: "currency",
                        currency: selectedCurrency,
                      })
                    : "N/A"}
                </p>
                {holding.originalPrice !== null &&
                  holding.originalPriceCurrency !== null &&
                  holding.originalPriceCurrency !== selectedCurrency && (
                    <p className="text-gray-400 text-sm">
                      (Original:{" "}
                      {holding.originalPrice.toLocaleString("en-US", {
                        style: "currency",
                        currency: holding.originalPriceCurrency,
                      })}
                      )
                    </p>
                  )}
              </div>
            ))}
          </div>
        </div>
      ))} */}
    </div>
  );
}
