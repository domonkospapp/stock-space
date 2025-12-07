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
    <div className="flex flex-col space-y-8 w-full">
      {isGrowthDataCalculating && monthlyHoldingValues.length > 0 && (
        <p className="text-gray-400 font-urbanist text-sm text-right">
          Updating data in background... 🔄
        </p>
      )}
      <div
        className="w-screen relative"
        style={{
          marginLeft: "calc(-50vw + 50%)",
          marginRight: "calc(-50vw + 50%)",
        }}
      >
        <MonthlyGrowthChart
          data={chartData}
          selectedCurrency={selectedCurrency}
        />
      </div>

      {/* Debug Screen */}
      <div className="mt-8 bg-[#2A2A2A] border border-foreground/20 rounded-2xl p-6 overflow-auto max-h-[600px]">
        <h3 className="text-2xl font-bold text-white font-[hagrid] mb-4">
          🔍 Debug: Sum Calculation
        </h3>

        <div className="space-y-6">
          {chartData.map((monthData) => {
            const rawMonthData = monthlyHoldingValues.find(
              (m) => m.date === monthData.date
            );
            if (!rawMonthData) return null;

            // Calculate sum step by step
            let calculatedSum = 0;
            const holdingBreakdown = rawMonthData.holdings.map((holding) => {
              let convertedPrice = holding.price;
              let priceCurrency = holding.currency;
              let conversionInfo = "no conversion";

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
                conversionInfo = `${holding.originalPriceCurrency} → ${selectedCurrency}`;
              } else if (
                holding.price !== null &&
                holding.currency !== null &&
                holding.currency !== selectedCurrency
              ) {
                convertedPrice = convertCurrency(
                  holding.price,
                  holding.currency,
                  selectedCurrency
                );
                priceCurrency = selectedCurrency;
                conversionInfo = `${holding.currency} → ${selectedCurrency}`;
              }

              const value = convertedPrice
                ? holding.totalShares * convertedPrice
                : null;

              const isValid =
                value !== null && !isNaN(value) && isFinite(value);
              if (isValid) {
                calculatedSum += value;
              }

              return {
                stockName: holding.stockName,
                isin: holding.isin,
                totalShares: holding.totalShares,
                convertedPrice,
                priceCurrency,
                originalPrice: holding.originalPrice,
                originalPriceCurrency: holding.originalPriceCurrency,
                value,
                isValid,
                conversionInfo,
              };
            });

            const finalSum = monthData.totalMonthlyValue;
            const sumMatches = Math.abs(calculatedSum - finalSum) < 0.01;
            const hasInvalidValues = holdingBreakdown.some((h) => !h.isValid);
            const hasNaN = isNaN(finalSum) || !isFinite(finalSum);

            return (
              <div
                key={monthData.date}
                className="bg-[#1A1A1A] border border-foreground/10 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xl font-bold text-white font-space-mono">
                    {monthData.date}
                  </h4>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <div className="text-xs text-gray-400">
                        Calculated Sum
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          hasNaN ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {calculatedSum.toLocaleString("en-US", {
                          style: "currency",
                          currency: selectedCurrency,
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Final Sum</div>
                      <div
                        className={`text-lg font-bold ${
                          hasNaN
                            ? "text-red-400"
                            : sumMatches
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {hasNaN
                          ? "NaN/Invalid"
                          : finalSum.toLocaleString("en-US", {
                              style: "currency",
                              currency: selectedCurrency,
                            })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Match</div>
                      <div
                        className={`text-lg font-bold ${
                          sumMatches ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {sumMatches ? "✓" : "✗"}
                      </div>
                    </div>
                  </div>
                </div>

                {hasInvalidValues && (
                  <div className="mb-3 p-2 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-sm">
                    ⚠️ Contains invalid values (null, NaN, or Infinity)
                  </div>
                )}

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {holdingBreakdown.map((holding, idx) => (
                    <div
                      key={`${holding.isin}-${idx}`}
                      className={`p-3 rounded border ${
                        holding.isValid
                          ? "bg-gray-800/50 border-gray-700"
                          : "bg-red-900/20 border-red-500/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-bold text-white text-sm">
                            {holding.stockName}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            ISIN: {holding.isin}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          {holding.isValid ? (
                            <div className="text-green-400 font-bold">
                              {holding.value?.toLocaleString("en-US", {
                                style: "currency",
                                currency: selectedCurrency,
                              })}
                            </div>
                          ) : (
                            <div className="text-red-400 font-bold">
                              Invalid
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-400">
                        <div>
                          <span className="text-gray-500">Shares:</span>{" "}
                          {holding.totalShares}
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>{" "}
                          {holding.convertedPrice !== null
                            ? holding.convertedPrice.toLocaleString("en-US", {
                                style: "currency",
                                currency:
                                  holding.priceCurrency || selectedCurrency,
                              })
                            : "null"}
                        </div>
                        {holding.originalPrice !== null && (
                          <div>
                            <span className="text-gray-500">Original:</span>{" "}
                            {holding.originalPrice.toLocaleString("en-US", {
                              style: "currency",
                              currency: holding.originalPriceCurrency || "N/A",
                            })}
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Conversion:</span>{" "}
                          {holding.conversionInfo}
                        </div>
                      </div>
                      {!holding.isValid && (
                        <div className="mt-2 text-xs text-red-400">
                          ❌ Value calculation: {holding.totalShares} ×{" "}
                          {holding.convertedPrice ?? "null"} ={" "}
                          {holding.value ?? "null"}
                          {holding.convertedPrice === null &&
                            " (Price is null)"}
                          {holding.convertedPrice !== null &&
                            (isNaN(holding.convertedPrice) ||
                              !isFinite(holding.convertedPrice)) &&
                            " (Price is NaN/Infinity)"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
