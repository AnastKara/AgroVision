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

export const currencyCodes = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "CHF",
  "CNY",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
  "MXN",
  "BRL",
  "INR",
  "ZAR",
  "SGD",
  "HKD",
  "NZD",
  "KRW",
  "TRY",
  "AED",
  "SAR",
  "THB",
  "MYR",
];

const currencyNameMap: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound Sterling",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  JPY: "Japanese Yen",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  DKK: "Danish Krone",
  PLN: "Polish Zloty",
  CZK: "Czech Koruna",
  MXN: "Mexican Peso",
  BRL: "Brazilian Real",
  INR: "Indian Rupee",
  ZAR: "South African Rand",
  SGD: "Singapore Dollar",
  HKD: "Hong Kong Dollar",
  NZD: "New Zealand Dollar",
  KRW: "South Korean Won",
  TRY: "Turkish Lira",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
  THB: "Thai Baht",
  MYR: "Malaysian Ringgit",
};

export function formatCurrencyValue(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencyName(currency: string) {
  return currencyNameMap[currency] ?? currency;
}

export function getCurrencySymbol(currency: string) {
  const part = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  })
    .formatToParts(0)
    .find(({ type }) => type === "currency");

  return part?.value ?? currency;
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
