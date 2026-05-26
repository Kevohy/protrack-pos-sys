import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKES(amount: number | string | { toNumber: () => number }) {
  const num = typeof amount === "object" ? amount.toNumber() : Number(amount);
  return `KES ${num.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCurrency(amount: number | string | { toNumber: () => number }) {
  return formatKES(amount);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
