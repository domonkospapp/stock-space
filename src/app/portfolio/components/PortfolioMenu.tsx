"use client";

import React from "react";
import Link from "next/link";

export default function PortfolioMenu() {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-bold text-white font-[hagrid]">
            Portfolio Menu
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/portfolio/settings"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-[hagrid]"
          >
            ⚙️ Settings
          </Link>
          <Link
            href="/fileUpload"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-[hagrid]"
          >
            📁 Upload Data
          </Link>
        </div>
      </div>
    </div>
  );
}
