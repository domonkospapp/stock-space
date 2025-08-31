"use client";

import csvParser from "utils/transactions/csvParser";
import { useState } from "react";
import { ProcessedTransaction } from "utils/types";

export default function Home() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ProcessedTransaction[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const data = csvParser(text);
        setParsedData(data);
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
              {parsedData.map((transaction, index) => (
                <tr key={index}>
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
      </main>
    </div>
  );
}
