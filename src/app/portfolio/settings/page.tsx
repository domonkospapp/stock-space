"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePortfolioStore } from "../../../store/portfolioStore";

type Currency = "EUR" | "USD";

export default function PortfolioSettings() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const router = useRouter();

  const ratesToUSD = usePortfolioStore((s) => s.ratesToUSD);
  const lastPriceUpdate = usePortfolioStore((s) => s.lastPriceUpdate);

  // Load saved currency preference from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem(
      "portfolio-currency"
    ) as Currency;
    if (savedCurrency && (savedCurrency === "EUR" || savedCurrency === "USD")) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Save currency preference to localStorage
  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem("portfolio-currency", currency);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white font-[hagrid]">
          Portfolio Settings
        </h1>
      </div>

      {/* Settings Content */}
      <div className="space-y-12">
        {/* Display Settings */}
        <div>
          <h2 className="text-2xl font-bold text-white font-[hagrid] mb-6">
            Display Settings
          </h2>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white font-[hagrid]">
              Default Currency
            </h3>
            <p className="text-gray-300 font-[urbanist]">
              Choose your preferred currency for displaying portfolio values.
            </p>

            <div className="flex items-center space-x-4">
              <span className="text-white font-medium font-[urbanist]">
                Currency:
              </span>
              <div className="flex bg-gray-600 rounded-lg p-1">
                <button
                  onClick={() => handleCurrencyChange("USD")}
                  className={`px-4 py-2 rounded-md font-medium transition-colors font-[urbanist] ${
                    selectedCurrency === "USD"
                      ? "bg-ci-yellow text-ci-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  USD
                </button>
                <button
                  onClick={() => handleCurrencyChange("EUR")}
                  className={`px-4 py-2 rounded-md font-medium transition-colors font-[urbanist] ${
                    selectedCurrency === "EUR"
                      ? "bg-ci-yellow text-ci-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  EUR
                </button>
              </div>
            </div>

            {/* Exchange Rate Info */}
            <div className="text-sm text-gray-400 font-[urbanist]">
              {ratesToUSD["EUR"] ? (
                <>Real-time rate: 1 EUR = {ratesToUSD["EUR"].toFixed(4)} USD</>
              ) : (
                "🔄 Loading exchange rates..."
              )}
              {lastPriceUpdate && (
                <span className="ml-4">
                  Last updated: {lastPriceUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div>
          <h2 className="text-2xl font-bold text-white font-[hagrid] mb-6">
            Data Management
          </h2>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white font-[hagrid]">
              Portfolio Data
            </h3>
            <p className="text-gray-300 font-[urbanist]">
              Manage your portfolio data and upload new CSV files.
            </p>
            <button
              onClick={() => router.push("/fileUpload")}
              className="bg-ci-yellow hover:bg-ci-yellow/80 text-ci-black px-6 py-3 rounded-lg transition-colors font-[urbanist] font-bold"
            >
              📁 Upload New Data
            </button>
          </div>
        </div>

        {/* Help & Support */}
        <div>
          <h2 className="text-2xl font-bold text-white font-[hagrid] mb-6">
            Help & Support
          </h2>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white font-[hagrid]">
              Need Help?
            </h3>
            <p className="text-gray-300 font-[urbanist]">
              Learn how to use the portfolio tracker effectively.
            </p>
            <div className="flex space-x-4">
              <button className="bg-ci-purple hover:bg-ci-purple/80 text-white px-6 py-3 rounded-lg transition-colors font-[urbanist] font-bold">
                📖 User Guide
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors font-[urbanist] font-bold">
                💬 Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
