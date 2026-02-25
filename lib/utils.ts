import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrencySymbol(currency: string) {
  const symbols: Record<string, string> = { USD: "$", JOD: "JD ", INR: "₹" };
  return symbols[currency] || "$";
}

export function formatCurrency(amount: number, currency: string) {
  const symbol = getCurrencySymbol(currency);
  const decimals = currency === "JOD" ? 3 : 2;
  return `${symbol}${amount.toFixed(decimals)}`;
}
