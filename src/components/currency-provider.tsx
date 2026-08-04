"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface CurrencyContextValue {
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  setCurrency: () => {},
  formatCurrency: (amount) => formatCurrencyValue(amount, "USD"),
});

export const currencyCodes =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("currency")
    : ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];

export function formatCurrencyValue(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState("USD");

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const storedCurrency = localStorage.getItem("agrovizion-currency");
      if (storedCurrency && currencyCodes.includes(storedCurrency)) {
        setCurrencyState(storedCurrency);
      }
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);

  const setCurrency = (newCurrency: string) => {
    if (!currencyCodes.includes(newCurrency)) return;
    setCurrencyState(newCurrency);
    localStorage.setItem("agrovizion-currency", newCurrency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatCurrency: (amount) => formatCurrencyValue(amount, currency),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
