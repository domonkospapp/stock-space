"use client";

import csvParser from "utils/transactions/csvParser";
import { useState } from "react";
import { CsvTransaction, Transaction, Position } from "utils/types";
import processedTransactions from "utils/transactions/processTransactions";
import { createPortfolioSummary } from "utils/transactions/createPortfolioSummary";
import { usePortfolioStore } from "../../store/portfolioStore";
// import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MenuWrapper from "../components/MenuWrapper";
import MenuItem from "../components/MenuItem";

export default function FileUpload() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvTransactions, setCsvTransactions] = useState<CsvTransaction[]>([]);
  const [processedData, setProcessedData] = useState<Transaction[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<Position[]>([]);
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const router = useRouter();

  const setPortfolioData = usePortfolioStore((s) => s.setPortfolioData);

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

  const playVideoAtTime = (seconds: number, stepNumber: number) => {
    setActiveStep(stepNumber);
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
    { id: "summary", label: "Portfolio Summary", color: "bg-emerald-300" },
    { id: "processed", label: "Processed Data", color: "bg-purple-500" },
    { id: "original", label: "Raw Data", color: "bg-amber-300" },
  ];

  return (
    <div className="min-h-screen bg-ci-black text-white">
      <MenuWrapper>
        <MenuItem href="/">home</MenuItem>
      </MenuWrapper>
      <main className="max-w-7xl mx-auto px-8 pt-24 pb-16">
        {/* Main Upload Section - Horizontal Layout */}
        {!csvFile && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* File Upload Section */}
            <div>
              <h2 className="text-lg font-space-mono text-gray-300 mb-4">
                Upload your CSV
              </h2>
              <div>
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <div
                    className={`border-2 border-dashed rounded-2xl p-12 transition-colors flex flex-col items-center justify-center relative ${
                      isDragOver
                        ? "border-foreground bg-foreground/5"
                        : "border-foreground/50 hover:border-foreground"
                    }`}
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
                      `,
                      backgroundSize: "50px 50px",
                      aspectRatio: "16 / 9",
                      minHeight: "300px",
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <svg
                      className="w-16 h-16 mx-auto mb-6 text-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-sm font-space-mono text-gray-300 text-center">
                      Drop your CSV file or click here to browse
                    </p>
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
            </div>

            {/* Video Instructions Section */}
            <div>
              <h2 className="text-lg font-space-mono text-gray-300 mb-4">
                How to export from flatex
              </h2>
              <div
                className="border-2 border-foreground rounded-2xl overflow-hidden mb-6 relative"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
                  `,
                  backgroundSize: "50px 50px",
                  aspectRatio: "16 / 9",
                  minHeight: "300px",
                }}
              >
                {!isVideoPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <p className="text-sm font-space-mono text-gray-400">
                      Video
                    </p>
                  </div>
                )}
                <video
                  ref={setVideoRef}
                  className={`w-full h-full object-contain relative z-0 ${
                    !isVideoPlaying ? "opacity-50" : "opacity-100"
                  } transition-opacity`}
                  controls
                  poster="/flatex-export.jpg"
                  preload="metadata"
                  crossOrigin="anonymous"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => {
                    setIsVideoPlaying(false);
                    setActiveStep(null);
                  }}
                  onEnded={() => {
                    setIsVideoPlaying(false);
                    setActiveStep(null);
                  }}
                >
                  <source
                    src="/videos/how-to-long.mov"
                    type="video/quicktime"
                  />
                  <source src="/videos/how-to-long.mov" type="video/mp4" />
                  <p className="text-center text-gray-400 mt-4 font-space-mono">
                    Your browser doesn&apos;t support this video format.
                  </p>
                </video>
              </div>
              {/* Three-step guide */}
              <ThreeStepGuide
                playVideoAtTime={playVideoAtTime}
                activeStep={activeStep}
              />
            </div>
          </div>
        )}

        {csvFile && (
          <>
            {/* Import Complete Section */}
            <div className="mb-12">
              <h1 className="text-6xl font-bold font-[hagrid] mb-2 text-foreground">
                Import complete
              </h1>
              <p className="text-lg font-space-mono text-gray-300 mb-8">
                Dataset validated and ready for analysis.
              </p>

              {/* Success Card */}
              <div className="bg-[#2A2A2A]/80 backdrop-blur-sm border border-foreground/20 rounded-2xl p-12">
                <h2 className="text-3xl font-bold font-[hagrid] mb-6 text-foreground text-center">
                  Ready to Analyze Your Portfolio?
                </h2>
                <p className="text-lg font-space-mono text-foreground mb-8 text-center">
                  Your data has been imported successfully!
                </p>

                {/* Checkmark List */}
                <div className="space-y-4 mb-8 max-w-md mx-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-background"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-foreground font-space-mono">
                      {csvTransactions.length} transactions processed
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-background"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-foreground font-space-mono">
                      {portfolioSummary.length} portfolio positions detected
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-background"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-foreground font-space-mono">
                      No errors found
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    className="bg-ci-yellow hover:bg-ci-yellow/80 text-background text-xl font-bold font-space-mono px-8 py-4 rounded-full transition-colors inline-flex items-center space-x-3"
                    onClick={() => {
                      setPortfolioData(portfolioSummary, processedData);
                      router.push("/portfolio");
                    }}
                  >
                    <span>Start analysing</span>
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
                    className="border-2 border-foreground bg-[#2A2A2A] text-foreground hover:bg-foreground hover:text-background text-xl font-bold font-space-mono px-8 py-4 rounded-full transition-colors"
                    onClick={scrollToDataReview}
                  >
                    Review data first
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8" data-tabs="true">
              <div className="flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-8 py-4 font-bold font-[urbanist] text-lg transition-all cursor-pointer border-b-2 ${
                      activeTab === tab.id
                        ? "text-white border-white"
                        : "text-gray-300 hover:text-white border-transparent"
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
                  <h2 className="text-3xl font-bold font-[hagrid] mb-8 text-left">
                    Imported Data Transactions (Original - Unchanged)
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white">
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
                            className="border-b border-white"
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
                  <h2 className="text-3xl font-bold font-[hagrid] mb-8 text-left">
                    Processed Transactions
                  </h2>
                  <div className="overflow-x-auto">
                    {processedData.length > 0 && (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white">
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
                              className="border-b border-white"
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
                                {transaction.amount.toLocaleString("en-US", {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                })}
                              </td>
                              <td className="py-4 pr-6">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    transaction.type === "BUY"
                                      ? "bg-green-500/20 text-green-400"
                                      : transaction.type === "SELL"
                                      ? "bg-red-500/20 text-red-400"
                                      : transaction.type === "TRANSFER"
                                      ? "bg-blue-500/20 text-blue-400"
                                      : "bg-gray-500/20 text-gray-400"
                                  }`}
                                >
                                  {transaction.type}
                                </span>
                              </td>
                              <td className="py-4 pr-6 text-white">
                                {transaction.price.toLocaleString("en-US", {
                                  style: "currency",
                                  currency: transaction.currency,
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
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
                  <div className="mb-8 text-left">
                    <h2 className="text-3xl font-bold font-[hagrid] mb-2">
                      Portfolio Summary
                    </h2>
                    <p className="text-gray-300 font-[urbanist]">
                      {portfolioSummary.length.toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      {portfolioSummary.length === 1 ? "stock" : "stocks"}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    {portfolioSummary.length > 0 && (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white">
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
                          {portfolioSummary
                            .sort((a, b) => b.totalShares - a.totalShares)
                            .map((position, index) => (
                              <tr
                                key={`summary-${index}`}
                                className="border-b border-white"
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

type StepButtonProps = {
  stepNumber: number;
  title: string;
  description: string;
  videoTime: number;
  activeStep: number | null;
  playVideoAtTime: (seconds: number, stepNumber: number) => void;
};

const StepButton = ({
  stepNumber,
  title,
  description,
  videoTime,
  activeStep,
  playVideoAtTime,
}: StepButtonProps) => {
  const isActive = activeStep === stepNumber;

  return (
    <button
      onClick={() => playVideoAtTime(videoTime, stepNumber)}
      className="flex-1 text-center relative z-10 cursor-pointer transition-opacity hover:opacity-80"
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${
          isActive
            ? "bg-[#1A1A1A] border-0"
            : "bg-transparent border-2 border-dashed border-foreground"
        }`}
      >
        <span className="font-space-mono font-bold text-lg text-foreground">
          {stepNumber}
        </span>
      </div>
      <h3 className="text-sm font-space-mono mb-1 text-foreground">{title}</h3>
      <p className="text-xs font-space-mono text-gray-400">{description}</p>
    </button>
  );
};

type ThreeStepGuideProps = {
  playVideoAtTime: (seconds: number, stepNumber: number) => void;
  activeStep: number | null;
};

const ThreeStepGuide = ({
  playVideoAtTime,
  activeStep,
}: ThreeStepGuideProps) => {
  return (
    <div className="flex items-start justify-between relative pt-2">
      {/* Connecting lines - between buttons only */}
      {/* Line between step 1 and 2 - positioned from center of button 1 to center of button 2, minus circle radius and padding */}
      <div
        className="absolute h-0.5 bg-foreground z-0"
        style={{
          top: "32px", // pt-2 (8px) + half circle height (24px) = 32px
          left: "calc(16.666% + 40px)",
          width: "calc(33.333% - 80px)",
        }}
      ></div>
      {/* Line between step 2 and 3 - positioned from center of button 2 to center of button 3, minus circle radius and padding */}
      <div
        className="absolute h-0.5 bg-foreground z-0"
        style={{
          top: "32px", // pt-2 (8px) + half circle height (24px) = 32px
          left: "calc(50% + 40px)",
          width: "calc(33.333% - 80px)",
        }}
      ></div>

      <StepButton
        stepNumber={1}
        title="Open Depotumzätze"
        description="Login to flatex.at and open Depotumzätze under Konto & Depot"
        videoTime={8}
        activeStep={activeStep}
        playVideoAtTime={playVideoAtTime}
      />

      <StepButton
        stepNumber={2}
        title="Set from filter back"
        description="Select the full date range you want to export"
        videoTime={11}
        activeStep={activeStep}
        playVideoAtTime={playVideoAtTime}
      />

      <StepButton
        stepNumber={3}
        title="Export CSV"
        description="Click on ... and select CSV as the format"
        videoTime={19}
        activeStep={activeStep}
        playVideoAtTime={playVideoAtTime}
      />
    </div>
  );
};
