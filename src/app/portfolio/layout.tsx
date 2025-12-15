"use client";

import { useEffect } from "react";
import { usePortfolioStore } from "../../store/portfolioStore";
import PortfolioNavigation from "./components/PortfolioNavigation";
import PortfolioTotalValue from "./components/PortfolioTotalValue";
import Image from "next/image";
import Link from "next/link";

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
    <div className="min-h-screen" style={{ backgroundColor: "#292929" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header with logo, navigation, and total value */}
        <header className="flex justify-between items-center pb-8 px-8 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/astronaut.svg"
              alt="stck.space"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-space-mono text-xl text-white">
              stck.space
            </span>
          </Link>

          {/* Navigation */}
          <PortfolioNavigation />

          {/* Portfolio Total Value */}
          <PortfolioTotalValue />
        </header>
        {children}
      </div>
    </div>
  );
}
