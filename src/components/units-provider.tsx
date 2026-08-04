"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type UnitSystem = "metric" | "imperial";

interface UnitsContextValue {
  unitSystem: UnitSystem;
  setUnitSystem: (unitSystem: UnitSystem) => void;
}

const UnitsContext = createContext<UnitsContextValue>({
  unitSystem: "metric",
  setUnitSystem: () => {},
});

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>("metric");

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const storedUnitSystem = localStorage.getItem("agrovizion-units");
      if (storedUnitSystem === "imperial") {
        setUnitSystemState("imperial");
      }
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);

  const setUnitSystem = (newUnitSystem: UnitSystem) => {
    setUnitSystemState(newUnitSystem);
    localStorage.setItem("agrovizion-units", newUnitSystem);
  };

  return (
    <UnitsContext.Provider value={{ unitSystem, setUnitSystem }}>
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits() {
  return useContext(UnitsContext);
}

export function formatTemperature(celsius: number, unitSystem: UnitSystem) {
  return unitSystem === "imperial"
    ? `${Math.round((celsius * 9) / 5 + 32)}°F`
    : `${Math.round(celsius)}°C`;
}

export function formatArea(hectares: number, unitSystem: UnitSystem) {
  const value = unitSystem === "imperial" ? hectares * 2.47105 : hectares;
  const unit = unitSystem === "imperial" ? "acres" : "ha";
  return `${Number(value.toFixed(2)).toLocaleString()} ${unit}`;
}

export function formatWeight(kilograms: number, unitSystem: UnitSystem) {
  const value = unitSystem === "imperial" ? kilograms * 2.20462 : kilograms;
  const unit = unitSystem === "imperial" ? "lbs" : "kg";
  return `${Math.round(value).toLocaleString()} ${unit}`;
}
