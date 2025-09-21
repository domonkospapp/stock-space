"use client";

import csvParser from "utils/transactions/csvParser";
import { useState } from "react";
import { CsvTransaction, Transaction, Position } from "utils/types";
import processedTransactions from "utils/transactions/processTransactions";
import { createPortfolioSummary } from "utils/transactions/createPortfolioSummary";
import { savePortfolioToLocalStorage } from "utils/localStorage";
// import Image from "next/image";
import { useRouter } from "next/navigation";

export default function FileUpload() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvTransactions, setCsvTransactions] = useState<CsvTransaction[]>([]);
  const [processedData, setProcessedData] = useState<Transaction[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<Position[]>([]);
  const [activeTab, setActiveTab] = useState<string>("original");
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const router = useRouter();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | null | undefined) => {
    if (file && file.type === "text/csv") {
      setCsvFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const data = csvParser(text);
        setCsvTransactions(data);
        // Process the data separately without affecting the original
        const processed = processedTransactions(data);
        setProcessedData(processed);

        // Calculate portfolio summary
        const summary = createPortfolioSummary(processed);
        setPortfolioSummary(summary);
      };
      reader.readAsText(file);
    } else {
      alert("Please select a valid CSV file!");
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const playVideoAtTime = (seconds: number) => {
    if (videoRef) {
      try {
        videoRef.currentTime = seconds;
        videoRef.play().catch((error) => {
          console.error("Video play error:", error);
          alert(
            "Unable to play video. Please try clicking the play button manually."
          );
        });
      } catch (error) {
        console.error("Video seek error:", error);
        alert(
          "Unable to seek video. Please try clicking the play button manually."
        );
      }
    } else {
      console.error("Video ref not available");
      alert("Video not loaded yet. Please wait a moment and try again.");
    }
  };

  const scrollToDataReview = () => {
    setActiveTab("summary");
    setTimeout(() => {
      const tabsElement = document.querySelector('[data-tabs="true"]');
      if (tabsElement) {
        tabsElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const tabs = [
    { id: "original", label: "Original Data", color: "bg-amber-300" },
    { id: "processed", label: "Processed Data", color: "bg-purple-500" },
    { id: "summary", label: "Portfolio Summary", color: "bg-emerald-300" },
  ];

  return (
    <div className="min-h-screen bg-ci-black text-white">
      <main className="max-w-7xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold font-[hagrid] mb-6">
            Upload Your CSV
          </h1>
          <p className="text-2xl font-[urbanist] text-gray-300 max-w-3xl mx-auto">
            Import your Flatex transaction data and see your portfolio come to
            life
          </p>
        </div>

        {/* Main Upload Section - Horizontal Layout */}
        {!csvFile && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* File Upload Section */}
            <div className="rounded-3xl p-8">
              <h2 className="text-3xl font-bold font-[hagrid] mb-6 text-center">
                Upload Your CSV
              </h2>
              <div className="text-center">
                <div className="mb-8">
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <div
                      className={`border-2 border-dashed rounded-2xl p-8 transition-colors ${
                        isDragOver
                          ? "border-ci-yellow bg-ci-yellow/10"
                          : "border-gray-600 hover:border-ci-yellow"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="text-center">
                        <svg
                          className="w-12 h-12 mx-auto mb-4 text-gray-400"
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
                        <p className="text-lg font-[urbanist] text-gray-300 mb-2">
                          {csvFile
                            ? `Selected: ${(csvFile as File).name}`
                            : "Drop your CSV file here or click to browse"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Only .csv files are supported
                        </p>
                      </div>
                    </div>
                  </label>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {csvFile && (
                  <div className="bg-ci-yellow text-background rounded-full px-6 py-3 inline-flex items-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-[urbanist] font-bold">
                      File uploaded successfully!
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Video Instructions Section */}
            <div className="rounded-3xl p-8">
              <h2 className="text-3xl font-bold font-[hagrid] mb-6 text-center">
                How to Export from Flatex
              </h2>
              <div className="relative rounded-2xl overflow-hidden mb-6">
                <video
                  ref={setVideoRef}
                  className="w-full h-auto"
                  controls
                  poster="/flatex-export.jpg"
                  preload="metadata"
                  crossOrigin="anonymous"
                >
                  <source src="/videos/how-to.mov" type="video/quicktime" />
                  <source src="/videos/how-to.mov" type="video/mp4" />
                  <p className="text-center text-gray-400 mt-4">
                    Your browser doesn&apos;t support this video format.
                    <br />
                    Please try downloading the video or use a different browser.
                  </p>
                </video>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <button
                    onClick={() => playVideoAtTime(2)}
                    className="bg-ci-purple hover:bg-ci-yellow w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors cursor-pointer group"
                  >
                    <span className="text-background font-bold text-lg group-hover:text-background">
                      1
                    </span>
                  </button>
                  <h3 className="text-sm font-bold font-[hagrid] mb-1">
                    Login
                  </h3>
                  <p className="text-xs text-gray-300 font-[urbanist]">
                    Access Flatex
                  </p>
                </div>
                <div className="text-center">
                  <button
                    onClick={() => playVideoAtTime(8)}
                    className="bg-ci-purple hover:bg-ci-yellow w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors cursor-pointer group"
                  >
                    <span className="text-background font-bold text-lg group-hover:text-background">
                      2
                    </span>
                  </button>
                  <h3 className="text-sm font-bold font-[hagrid] mb-1">
                    Export
                  </h3>
                  <p className="text-xs text-gray-300 font-[urbanist]">
                    Get CSV file
                  </p>
                </div>
                <div className="text-center">
                  <button
                    onClick={() => playVideoAtTime(12)}
                    className="bg-ci-purple hover:bg-ci-yellow w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors cursor-pointer group"
                  >
                    <span className="text-background font-bold text-lg group-hover:text-background">
                      3
                    </span>
                  </button>
                  <h3 className="text-sm font-bold font-[hagrid] mb-1">
                    Upload
                  </h3>
                  <p className="text-xs text-gray-300 font-[urbanist]">
                    Use file here
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {csvFile && (
          <>
            {/* Save Portfolio Section - Show First */}
            <div className="bg-ci-yellow rounded-2xl p-12 mb-12 text-center">
              <h2 className="text-3xl font-bold font-[hagrid] mb-6 text-background">
                Ready to Analyze Your Portfolio?
              </h2>
              <p className="text-xl font-[urbanist] text-background mb-8 max-w-2xl mx-auto">
                Your data has been imported successfully!
                <span className="block mt-2 text-lg">
                  {csvTransactions.length} transactions processed into{" "}
                  {portfolioSummary.length} portfolio positions.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  className="bg-background hover:bg-gray-200 text-ci-yellow text-xl font-bold font-[urbanist] px-8 py-4 rounded-full transition-colors inline-flex items-center space-x-3"
                  onClick={() => {
                    savePortfolioToLocalStorage(
                      portfolioSummary,
                      processedData
                    );
                    router.push("/portfolio");
                  }}
                >
                  <span>Start Analyzing</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  className="border-2 border-background text-background hover:bg-background hover:text-ci-yellow text-lg font-bold font-[urbanist] px-6 py-3 rounded-full transition-colors"
                  onClick={scrollToDataReview}
                >
                  Review Data First
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="rounded-2xl p-2 mb-8" data-tabs="true">
              <div className="flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-8 py-4 font-bold font-[urbanist] text-lg rounded-xl transition-all ${
                      activeTab === tab.id
                        ? "bg-ci-purple text-background"
                        : "text-gray-300 hover:text-white hover:bg-ci-purple/30"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="rounded-2xl p-8">
              {/* Original Data Tab */}
              {activeTab === "original" && (
                <div>
                  <h2 className="text-3xl font-bold font-[hagrid] mb-8 text-center">
                    Imported Data Transactions (Original - Unchanged)
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                            Date
                          </th>
                          <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                            ISIN
                          </th>
                          <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                            Stock Name
                          </th>
                          <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                            Amount
                          </th>
                          <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                            Transaction Info
                          </th>
                          <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                            Price
                          </th>
                          <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                            Currency
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvTransactions.map((transaction, index) => (
                          <tr
                            key={`original-${index}`}
                            className="border-b border-gray-800"
                          >
                            <td className="py-4 pr-6 font-bold text-white">
                              {transaction.date}
                            </td>
                            <td className="py-4 pr-6 text-gray-300">
                              {transaction.isin}
                            </td>
                            <td className="py-4 pr-6 text-white font-medium">
                              {transaction.stockName}
                            </td>
                            <td className="py-4 pr-6 text-white">
                              {transaction.amount}
                            </td>
                            <td className="py-4 pr-6 text-gray-300 text-sm">
                              {transaction.transactionInfo}
                            </td>
                            <td className="py-4 pr-6 text-white">
                              {transaction.price}
                            </td>
                            <td className="py-4 pr-6 text-gray-300">
                              {transaction.currency}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Processed Data Tab */}
              {activeTab === "processed" && (
                <div>
                  <h2 className="text-3xl font-bold font-[hagrid] mb-8 text-center">
                    Processed Transactions
                  </h2>
                  <div className="overflow-x-auto">
                    {processedData.length > 0 && (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                              Date
                            </th>
                            <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                              ISIN
                            </th>
                            <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                              Stock Name
                            </th>
                            <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                              Amount
                            </th>
                            <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                              Type
                            </th>
                            <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                              Price
                            </th>
                            <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                              Currency
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {processedData.map((transaction, index) => (
                            <tr
                              key={`processed-${index}`}
                              className="border-b border-gray-800"
                            >
                              <td className="py-4 pr-6 font-bold text-white">
                                {transaction.date}
                              </td>
                              <td className="py-4 pr-6 text-gray-300">
                                {transaction.isin}
                              </td>
                              <td className="py-4 pr-6 text-white font-medium">
                                {transaction.stockName}
                              </td>
                              <td className="py-4 pr-6 text-white">
                                {transaction.amount}
                              </td>
                              <td className="py-4 pr-6">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    transaction.type === "BUY"
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-red-500/20 text-red-400"
                                  }`}
                                >
                                  {transaction.type}
                                </span>
                              </td>
                              <td className="py-4 pr-6 text-white">
                                {transaction.price}
                              </td>
                              <td className="py-4 pr-6 text-gray-300">
                                {transaction.currency}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* Portfolio Summary Tab */}
              {activeTab === "summary" && (
                <div>
                  <h2 className="text-3xl font-bold font-[hagrid] mb-8 text-center">
                    Portfolio Summary
                  </h2>
                  <div className="overflow-x-auto">
                    {portfolioSummary.length > 0 && (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                              Stock Name
                            </th>
                            <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                              ISIN
                            </th>
                            <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                              Total Shares
                            </th>
                            <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                              Average Price
                            </th>
                            <th className="pb-4 pr-6 font-bold font-[urbanist] text-gray-300">
                              Currency
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {portfolioSummary.map((position, index) => (
                            <tr
                              key={`summary-${index}`}
                              className="border-b border-gray-800"
                            >
                              <td className="py-4 pr-6 text-white font-medium">
                                {position.stockName}
                              </td>
                              <td className="py-4 pr-6 text-gray-300">
                                {position.isin}
                              </td>
                              <td className="py-4 pr-6">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    position.totalShares == 0
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-green-500/20 text-green-400"
                                  }`}
                                >
                                  {position.totalShares == 0
                                    ? "Sold Out"
                                    : position.totalShares}
                                </span>
                              </td>
                              <td className="py-4 pr-6 text-white">
                                {position.averagePrice == 0
                                  ? "N/A"
                                  : Math.round(position.averagePrice * 100) /
                                    100}
                              </td>
                              <td className="py-4 pr-6 text-gray-300">
                                {position.currency}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
