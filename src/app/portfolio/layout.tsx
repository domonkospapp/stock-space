"use client";

import { useEffect } from "react";
import { usePortfolioStore } from "../../store/portfolioStore";
import PortfolioNavigation from "./components/PortfolioNavigation";
import PortfolioTotalValue from "./components/PortfolioTotalValue";

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const positions = usePortfolioStore((s) => s.positions);
  const startCalculations = usePortfolioStore((s) => s.startCalculations);

  useEffect(() => {
    // Start calculations on mount and when positions change
    if (positions.length > 0) {
      startCalculations();
    }
  }, [positions.length, startCalculations]);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#292929" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <PortfolioNavigation />
          <PortfolioTotalValue />
        </div>
        {children}
      </div>
    </div>
  );
}
