"use client";

import React from "react";
import { usePathname } from "next/navigation";
import MenuItem from "../../components/MenuItem";

export default function PortfolioNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="flex space-x-2">
      <MenuItem
        href="/portfolio"
        textColor="text-white"
        active={isActive("/portfolio")}
      >
        allocation
      </MenuItem>
      <MenuItem
        href="/portfolio/growth"
        textColor="text-white"
        active={isActive("/portfolio/growth")}
      >
        growth
      </MenuItem>
      <MenuItem
        href="/portfolio/history"
        textColor="text-white"
        active={isActive("/portfolio/history")}
      >
        history
      </MenuItem>
      <MenuItem
        href="/portfolio/settings"
        textColor="text-white"
        active={isActive("/portfolio/settings")}
      >
        settings
      </MenuItem>
    </nav>
  );
}
