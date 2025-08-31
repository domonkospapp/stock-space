"use client";

import csvParser from "utils/transactions/csvParser";
import { useState } from "react";
import { CsvTransaction, Transaction, Position } from "utils/types";
import processedTransactions from "utils/transactions/processTransactions";
import { createPortfolioSummary } from "utils/transactions/createPortfolioSummary";
import Image from "next/image";

export default function Home() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvTransactions, setCsvTransactions] = useState<CsvTransaction[]>([]);
  const [processedData, setProcessedData] = useState<Transaction[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<Position[]>([]);
  const [activeTab, setActiveTab] = useState<string>("original");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

  const tabs = [
    { id: "original", label: "Original Data", color: "bg-amber-300" },
    { id: "processed", label: "Processed Data", color: "bg-purple-500" },
    { id: "summary", label: "Portfolio Summary", color: "bg-emerald-300" },
  ];

  return (
    <div>
      <main>
        <h1 className="text-2xl font-bold mb-4">Upload your csv file</h1>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
        {csvFile && <p>Selected file: {csvFile.name} ✅</p>}

        {!csvFile && (
          <>
            <h2 className="text-xl font-bold mb-4">How to find my file?</h2>
            <Image
              src="/flatex-export.jpg"
              alt="Flatex Export CSV"
              width={800}
              height={400}
            />
            <p>Just open bla bla</p>
          </>
        )}

        {csvFile && (
          <>
            {/* Tab Navigation */}
            <div className="mt-8 flex border-b border-gray-300">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {/* Original Data Tab */}
              {activeTab === "original" && (
                <div>
                  <h2 className="mt-8 text-2xl">
                    Imported data Transactions (Original - Unchanged)
                  </h2>
                  <div className="max-h-48 bg-amber-300 overflow-x-scroll text-black">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>ISIN</th>
                          <th>Stock Name</th>
                          <th>Amount</th>
                          <th>Transaction Info</th>
                          <th>Price</th>
                          <th>Currency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvTransactions.map((transaction, index) => (
                          <tr key={`original-${index}`}>
                            <td className="font-bold">{transaction.date}</td>
                            <td>{transaction.isin}</td>
                            <td>{transaction.stockName}</td>
                            <td>{transaction.amount}</td>
                            <td>{transaction.transactionInfo}</td>
                            <td>{transaction.price}</td>
                            <td>{transaction.currency}</td>
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
                  <h2 className="mt-8 text-2xl">Processed Transactions</h2>
                  <div className="max-h-48 bg-purple-500 overflow-x-scroll text-black">
                    {processedData.length > 0 && (
                      <div
                        className="csv-preview"
                        style={{ marginTop: "20px" }}
                      >
                        <table className="csv-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>ISIN</th>
                              <th>Stock Name</th>
                              <th>Amount</th>
                              <th>Transaction Info</th>
                              <th>Price</th>
                              <th>Currency</th>
                            </tr>
                          </thead>
                          <tbody>
                            {processedData.map((transaction, index) => (
                              <tr key={`processed-${index}`}>
                                <td>{transaction.date}</td>
                                <td>{transaction.isin}</td>
                                <td>{transaction.stockName}</td>
                                <td>{transaction.amount}</td>
                                <td>{transaction.type}</td>
                                <td>{transaction.price}</td>
                                <td>{transaction.currency}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Portfolio Summary Tab */}
              {activeTab === "summary" && (
                <div>
                  <h2 className="mt-8 text-2xl">Portfolio Summary</h2>
                  <div className="max-h-48 bg-emerald-300 overflow-x-scroll text-black">
                    {portfolioSummary.length > 0 && (
                      <div
                        className="csv-preview"
                        style={{ marginTop: "20px" }}
                      >
                        <table className="csv-table">
                          <thead>
                            <tr>
                              <th>Stock Name</th>
                              <th>ISIN</th>
                              <th>Total Shares</th>
                              <th>Average Price</th>
                              <th>Currency</th>
                            </tr>
                          </thead>
                          <tbody>
                            {portfolioSummary.map((position, index) => (
                              <tr key={`processed-${index}`}>
                                <td>{position.stockName}</td>
                                <td>{position.isin}</td>
                                <td>
                                  {position.totalShares == 0
                                    ? "sold out"
                                    : position.totalShares}
                                </td>
                                <td>
                                  {position.averagePrice == 0
                                    ? "N/A"
                                    : Math.round(position.averagePrice * 100) /
                                      100}
                                </td>
                                <td>{position.currency}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center flex-col mt-2">
              <h2>
                The import was successfull, check the data and if exerything
                looks good, open your Portfolio!
              </h2>
              <a
                className="relative text-2xl bg-amber-200 text-black p-5"
                href="/dashboard"
              >
                Open Portfolio
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
