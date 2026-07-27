import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getHealthColor(health: number): string {
  if (health >= 80) return "#22c55e";
  if (health >= 60) return "#eab308";
  if (health >= 40) return "#f97316";
  return "#ef4444";
}

export function getHealthStatus(health: number): string {
  if (health >= 80) return "Excellent";
  if (health >= 60) return "Good";
  if (health >= 40) return "Fair";
  return "Critical";
}

export function getFieldColor(health: number): string {
  if (health >= 75) return "bg-green-500";
  if (health >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export function getFieldBorderColor(health: number): string {
  if (health >= 75) return "border-green-500";
  if (health >= 50) return "border-yellow-500";
  return "border-red-500";
}

