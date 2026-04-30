import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(0)}k`;
  }
  return formatCurrency(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatPercentAnnual(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}% a.a.`;
}

// ─── FIPE helpers ─────────────────────────────────────────────────────────────

/** Extract calendar year from a FIPE year code like "2023-1" */
export function extractYearFromCode(yearCode: string): number {
  return parseInt(yearCode.split("-")[0], 10);
}

/** Extract fuel type code from a FIPE year code like "2023-1" */
export function extractFuelCodeFromYearCode(yearCode: string): string {
  return yearCode.split("-")[1] ?? "1";
}

/** Build the FIPE year code for a given year and fuel, e.g. (2023, "1") → "2023-1" */
export function buildYearCode(year: number, fuelCode: string): string {
  return `${year}-${fuelCode}`;
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

/**
 * Future value with compound interest and periodic contributions.
 * M = PV * (1 + i)^n + PMT * ((1 + i)^n - 1) / i
 */
export function futureValue(
  presentValue: number,
  monthlyRate: number, // as fraction, e.g. 0.01
  months: number,
  monthlyContribution: number = 0
): number {
  const factor = Math.pow(1 + monthlyRate, months);
  const fvPV = presentValue * factor;
  const fvContrib =
    monthlyRate === 0
      ? monthlyContribution * months
      : monthlyContribution * ((factor - 1) / monthlyRate);
  return fvPV + fvContrib;
}

/** Convert annual rate (%) to monthly rate as a fraction */
export function annualToMonthlyRate(annualPercent: number): number {
  return Math.pow(1 + annualPercent / 100, 1 / 12) - 1;
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
