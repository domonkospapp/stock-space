"use client";

import { CsvTransaction } from "../types";

// Parse number from CSV format where comma is thousands separator
// Handles cases like "-220,000" -> -220 or "20,000" -> 20000
function parseCsvNumber(value: string): number {
  if (!value) return 0;

  // Remove all commas and parse
  const cleaned = value.replace(/,/g, "");
  const num = Number(cleaned);

  // If the original had ",000" at the end and the number seems too large,
  // it might be a formatting issue - check if dividing by 1000 makes more sense
  // But for now, let's just parse normally since amounts like "20,000" should be 20000
  return num;
}

export default function csvParser(text: string): CsvTransaction[] {
  const rows = text.split("\n").map((row) => row.split(";"));
  if (rows.length > 0) {
    const transactionData: CsvTransaction[] = rows
      .slice(1)
      .filter((row) => row.length > 1 && row[1]?.trim() !== "") // Skip empty rows
      .map((row) => {
        const amountStr = row[5] || "";
        const priceStr = row[9] || "";

        // Parse amount - handle CSV formatting issue where numbers have extra zeros
        // The CSV format incorrectly adds ",000" to numbers
        // Example: "-220,000" should be -220, not -220000
        // "-1340,000" should be -1340, not -1340000
        // "20,000" should be 20, not 20000
        // "6500,000" should be 6500, not 6500000
        let amount = parseCsvNumber(amountStr);

        // Fix CSV formatting: if value ends with ",000", divide by 1000
        // This handles the incorrect formatting in the CSV export
        if (amountStr.trim().endsWith(",000")) {
          amount = amount / 1000;
        }

        // Parse price - handle different CSV formats
        // European decimal format: "0,238" should be 0.238 (comma is decimal separator)
        // Thousands separator format: "142,288" should be 142.288 (divide by 1000)
        let price = parseCsvNumber(priceStr);

        if (priceStr.includes(",")) {
          // Check if it's European decimal format (starts with 0, or has comma early)
          // Pattern: "0,238" or "0,164" - comma is decimal separator
          if (
            priceStr.trim().startsWith("0,") ||
            /^[0-9]{1,2},/.test(priceStr.trim())
          ) {
            // European decimal format: replace comma with dot
            price = parseFloat(priceStr.replace(",", "."));
          } else if (price > 100) {
            // Thousands separator format: divide by 1000
            // This handles cases like "142,288" -> 142.288
            price = price / 1000;
          }
        }

        return {
          date: row[1] || "",
          stockName: row[4] || "",
          isin: row[3] || "",
          amount: amount,
          price: price,
          currency: row[10] || "",
          transactionInfo: row[7] || "",
        };
      });
    return transactionData;
  }
  throw new Error("Invalid CSV data");
}
