"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PortfolioNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-bold text-white font-[hagrid]">
            stck.space
          </h2>

          {/* Navigation Links */}
          <nav className="flex space-x-4">
            <Link
              href="/portfolio"
              className={`font-urbanist text-xl px-6 py-2 border border-white rounded-full transition-all cursor-pointer ${
                isActive("/portfolio")
                  ? "bg-white text-background"
                  : "text-white hover:bg-white hover:text-background"
              }`}
            >
              allocation
            </Link>
            <Link
              href="/portfolio/history"
              className={`font-urbanist text-xl px-6 py-2 border border-white rounded-full transition-all cursor-pointer ${
                isActive("/portfolio/history")
                  ? "bg-white text-background"
                  : "text-white hover:bg-white hover:text-background"
              }`}
            >
              history
            </Link>
            <Link
              href="/portfolio/settings"
              className={`font-urbanist text-xl px-6 py-2 border border-white rounded-full transition-all cursor-pointer ${
                isActive("/portfolio/settings")
                  ? "bg-white text-background"
                  : "text-white hover:bg-white hover:text-background"
              }`}
            >
              settings
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
