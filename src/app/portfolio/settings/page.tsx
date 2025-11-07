"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePortfolioStore } from "../../../store/portfolioStore";
import { useSettingsStore } from "../../../store/settingsStore";

export default function PortfolioSettings() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();

  const selectedCurrency = useSettingsStore((s) => s.selectedCurrency);
  const setSelectedCurrency = useSettingsStore((s) => s.setSelectedCurrency);
  const clearSettings = useSettingsStore((s) => s.clearSettings);

  const clearPortfolioData = usePortfolioStore((s) => s.clearAllData);
  const ratesToUSD = usePortfolioStore((s) => s.ratesToUSD);
  const lastPriceUpdate = usePortfolioStore((s) => s.lastPriceUpdate);

  const handleClearData = () => {
    clearPortfolioData();
    clearSettings();
    setShowConfirmDialog(false);
    router.push("/fileUpload");
  };

  const getRelativeTime = (date: Date | string | null) => {
    if (!date) return "";
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-white font-[hagrid] mb-3">
          Settings
        </h1>
        <p className="text-xl text-gray-400 font-[urbanist]">
          Customize your portfolio experience
        </p>
      </div>

      <div className="space-y-6 mb-6">
        {/* Currency Settings Card */}
        <div className="border-2 border-white rounded-2xl p-8">
          <div className="flex items-start mb-6">
            <div className="bg-ci-yellow rounded-xl p-3 mr-4">
              <svg
                className="w-6 h-6 text-ci-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white font-[hagrid] mb-2">
                Display Currency
              </h2>
              <p className="text-gray-400 font-[urbanist] text-sm">
                Choose your preferred currency for portfolio values
              </p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setSelectedCurrency("USD")}
              className={`flex-1 py-4 px-6 rounded-xl font-bold font-[urbanist] text-lg transition-colors border-2 ${
                selectedCurrency === "USD"
                  ? "bg-ci-yellow border-ci-yellow text-ci-black"
                  : "border-white text-white hover:border-ci-yellow hover:text-ci-yellow"
              }`}
            >
              <div className="text-2xl mb-1">$</div>
              USD
            </button>
            <button
              onClick={() => setSelectedCurrency("EUR")}
              className={`flex-1 py-4 px-6 rounded-xl font-bold font-[urbanist] text-lg transition-colors border-2 ${
                selectedCurrency === "EUR"
                  ? "bg-ci-yellow border-ci-yellow text-ci-black"
                  : "border-white text-white hover:border-ci-yellow hover:text-ci-yellow"
              }`}
            >
              <div className="text-2xl mb-1">€</div>
              EUR
            </button>
          </div>

          {/* Exchange Rate Info */}
          {ratesToUSD["EUR"] && (
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400 font-[urbanist]">
                  Exchange Rate: 1 EUR = {ratesToUSD["EUR"].toFixed(4)} USD
                </div>
                {lastPriceUpdate && (
                  <div className="text-gray-500 font-[urbanist]">
                    Updated {getRelativeTime(lastPriceUpdate)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Data Management Card */}
        <div className="border-2 border-white rounded-2xl p-8">
          <div className="flex items-start mb-6">
            <div className="bg-ci-purple rounded-xl p-3 mr-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white font-[hagrid] mb-2">
                Portfolio Data
              </h2>
              <p className="text-gray-400 font-[urbanist] text-sm">
                Manage your CSV files and portfolio data
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/fileUpload")}
            className="w-full bg-ci-yellow hover:bg-ci-yellow/80 text-ci-black px-6 py-4 rounded-xl transition-colors font-[urbanist] font-bold text-lg mb-4"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span>Upload New CSV</span>
            </div>
          </button>

          <div className="pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400 font-[urbanist]">
              Upload a new CSV file to update your portfolio with the latest
              transactions from Flatex
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone Card */}
      <div className="border-2 border-red-500/30 rounded-2xl p-8 bg-red-500/5">
        <div className="flex items-start mb-6">
          <div className="bg-red-500/20 rounded-xl p-3 mr-4 border border-red-500/50">
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-red-400 font-[hagrid] mb-2">
              Danger Zone
            </h2>
            <p className="text-gray-400 font-[urbanist] text-sm mb-6">
              Permanently delete all your financial data from browser storage
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowConfirmDialog(true)}
          className="w-full bg-transparent border-2 border-red-500 hover:bg-red-500 text-red-400 hover:text-white px-6 py-4 rounded-xl transition-all font-[urbanist] font-bold text-lg"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>Clear All Portfolio Data</span>
          </div>
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-red-500 shadow-2xl">
            <div className="text-center mb-6">
              <div className="bg-red-500/20 rounded-full p-4 w-20 h-20 mx-auto mb-4 border-2 border-red-500/50">
                <svg
                  className="w-12 h-12 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white font-[hagrid] mb-3">
                Delete Everything?
              </h3>
              <p className="text-gray-400 font-[urbanist] mb-6">
                This will permanently remove all your data from this browser:
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
              <ul className="space-y-3">
                {[
                  "Transaction history",
                  "Portfolio holdings",
                  "Exchange rates",
                  "Cached calculations",
                  "User preferences",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center text-gray-300 font-[urbanist]"
                  >
                    <svg
                      className="w-5 h-5 text-red-400 mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-400 font-[urbanist] font-bold text-center">
                ⚠️ This action cannot be undone!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-xl transition-colors font-[urbanist] font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl transition-colors font-[urbanist] font-bold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
