"use client";

import csvParser from "utils/transactions/csvParser";
import { useState } from "react";
import { CsvTransaction, Transaction, Position } from "utils/types";
import processedTransactions from "utils/transactions/processTransactions";
import { createPortfolioSummary } from "utils/transactions/createPortfolioSummary";

export default function Home() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvTransactions, setCsvTransactions] = useState<CsvTransaction[]>([]);
  const [processedData, setProcessedData] = useState<Transaction[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<Position[]>([]);

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

  return (
    <div>
      <main>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
        {csvFile && <p>✅ Selected file: {csvFile.name}</p>}

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

        <h2 className="mt-8 text-2xl">Processed Transactions</h2>
        <div className="max-h-48 bg-purple-500 overflow-x-scroll text-black">
          {processedData.length > 0 && (
            <div className="csv-preview" style={{ marginTop: "20px" }}>
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

        <h2 className="mt-8 text-2xl">Portfolio Summary</h2>
        <div className="max-h-48 bg-emerald-300 overflow-x-scroll text-black">
          {portfolioSummary.length > 0 && (
            <div className="csv-preview" style={{ marginTop: "20px" }}>
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
                          : Math.round(position.averagePrice * 100) / 100}
                      </td>
                      <td>{position.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
