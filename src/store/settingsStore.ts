"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Currency = "EUR" | "USD";

type SettingsState = {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  clearSettings: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      selectedCurrency: "USD",
      setSelectedCurrency: (currency: Currency) => {
        set({ selectedCurrency: currency });
        // Dispatch custom event to notify other components
        window.dispatchEvent(
          new CustomEvent("currencyChange", { detail: currency })
        );
      },
      clearSettings: () => {
        set({ selectedCurrency: "USD" });
      },
    }),
    {
      name: "portfolio-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
