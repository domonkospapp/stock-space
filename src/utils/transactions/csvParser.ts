"use client";

import { CsvTransaction } from "../types";

export default function csvParser(text: string): CsvTransaction[] {
  const rows = text.split("\n").map((row) => row.split(";"));
  if (rows.length > 0) {
    const transactionData: CsvTransaction[] = rows
      .slice(1)
      .filter((row) => row.length > 1 && row[1]?.trim() !== "") // Skip empty rows
      .map((row) => ({
        date: row[1] || "",
        stockName: row[4] || "",
        isin: row[3] || "",
        amount: row[5] ? Number(row[5].split(",")[0]) : 0,
        price: row[9] ? parseFloat(row[9].replace(",", ".")) : 0,
        currency: row[10] || "",
        transactionInfo: row[7] || "",
      }));
    return transactionData;
  }
  throw new Error("Invalid CSV data");
}
