"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePortfolioStore } from "../../../store/portfolioStore";
import { useSettingsStore } from "../../../store/settingsStore";

type Currency = "EUR" | "USD";

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
                  onClick={() => setSelectedCurrency("USD")}
                  className={`px-4 py-2 rounded-md font-medium transition-colors font-[urbanist] ${
                    selectedCurrency === "USD"
                      ? "bg-ci-yellow text-ci-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  USD
                </button>
                <button
                  onClick={() => setSelectedCurrency("EUR")}
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
                <>
                  Real-time rate: 1 EUR = {ratesToUSD["EUR"].toFixed(4)} USD
                  {lastPriceUpdate && (
                    <span className="ml-2 text-gray-500">
                      • Updated {getRelativeTime(lastPriceUpdate)}
                    </span>
                  )}
                </>
              ) : (
                "🔄 Loading exchange rates..."
              )}
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div>
          <h2 className="text-2xl font-bold text-white font-[hagrid] mb-6">
            Data Management
          </h2>

          <div className="space-y-6">
            {/* Upload New Data */}
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

            {/* Clear All Data */}
            <div className="space-y-4 border-t border-red-500/30 pt-6">
              <h3 className="text-lg font-medium text-red-400 font-[hagrid]">
                Clear Financial Data
              </h3>
              <p className="text-gray-300 font-[urbanist]">
                Remove all portfolio data, transactions, settings, and cached
                calculations from browser storage. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowConfirmDialog(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-[urbanist] font-bold"
              >
                🗑️ Clear All Data
              </button>
            </div>
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

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-4 border-2 border-red-500">
            <h3 className="text-2xl font-bold text-white font-[hagrid] mb-4">
              ⚠️ Confirm Data Deletion
            </h3>
            <p className="text-gray-300 font-[urbanist] mb-6">
              Are you sure you want to delete all your portfolio data? This will
              remove:
            </p>
            <ul className="text-gray-300 font-[urbanist] mb-6 list-disc list-inside space-y-2">
              <li>All transaction history</li>
              <li>Portfolio holdings</li>
              <li>Exchange rates</li>
              <li>Cached calculations</li>
              <li>Currency preferences</li>
            </ul>
            <p className="text-red-400 font-[urbanist] font-bold mb-6">
              This action cannot be undone!
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleClearData}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-[urbanist] font-bold"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-[urbanist] font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
