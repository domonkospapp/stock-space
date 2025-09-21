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
          <nav className="flex space-x-6">
            <Link
              href="/portfolio"
              className={`font-urbanist text-lg font-bold transition-colors ${
                isActive("/portfolio")
                  ? "text-ci-yellow underline decoration-2 underline-offset-4"
                  : "text-gray-300 hover:text-white hover:underline decoration-2 underline-offset-4 hover:decoration-ci-yellow"
              }`}
            >
              allocation
            </Link>
            <Link
              href="/portfolio/settings"
              className={`font-urbanist text-lg font-bold transition-colors ${
                isActive("/portfolio/settings")
                  ? "text-ci-yellow underline decoration-2 underline-offset-4"
                  : "text-gray-300 hover:text-white hover:underline decoration-2 underline-offset-4 hover:decoration-ci-yellow"
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
