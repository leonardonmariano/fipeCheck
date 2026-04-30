import type { DepreciationCost } from "@/types";

// Fallback when no historical FIPE data is available
const DEFAULT_ANNUAL_RATE = 0.12;

/**
 * Calculates annual depreciation based on FIPE values for consecutive years.
 *
 * Formula: rate = (currentValue - olderValue) / currentValue
 * This gives the fraction the car will lose when it ages one more year.
 *
 * If no older-year data is available, falls back to the 12% industry average.
 */
export function calculateDepreciation(
  currentValue: number,
  olderYearValue?: number
): DepreciationCost {
  let rate: number;
  let isEstimated: boolean;

  if (olderYearValue !== undefined && olderYearValue > 0 && currentValue > olderYearValue) {
    // Older model is cheaper → current car will depreciate by this amount next year
    rate = (currentValue - olderYearValue) / currentValue;
    isEstimated = false;
  } else {
    // No reliable historical data (car appreciated, brand-new model, etc.)
    rate = DEFAULT_ANNUAL_RATE;
    isEstimated = true;
  }

  // Clamp to a plausible range: 3%–40% per year
  rate = Math.min(Math.max(rate, 0.03), 0.40);

  const annual = currentValue * rate;
  const monthly = annual / 12;

  return { monthly, annual, rate, isEstimated };
}

/**
 * Projects the car's remaining FIPE value after N years of depreciation.
 * Uses compound annual depreciation (each year's base is the previous year's value).
 */
export function projectCarValue(
  currentValue: number,
  annualRate: number,
  years: number
): number {
  return currentValue * Math.pow(1 - annualRate, years);
}
