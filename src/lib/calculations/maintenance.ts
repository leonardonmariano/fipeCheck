import type { MaintenanceCost } from "@/types";

// Annual base maintenance cost by vehicle age bracket (revisões, fluidos, filtros)
const BASE_ANNUAL_BY_AGE: Array<{ maxAge: number; cost: number }> = [
  { maxAge: 3,  cost: 1_500 },
  { maxAge: 7,  cost: 3_000 },
  { maxAge: 12, cost: 5_000 },
  { maxAge: Infinity, cost: 7_500 },
];

const TIRE_SET_COST = 2_000;      // R$ — average for popular/medium car
const TIRE_REPLACEMENT_KM = 50_000; // km between tire changes

export function calculateMaintenance(
  vehicleAgeYears: number,
  kmPerMonth: number
): MaintenanceCost {
  const bracket = BASE_ANNUAL_BY_AGE.find((b) => vehicleAgeYears <= b.maxAge);
  const baseAnnual = bracket?.cost ?? 7_500;

  // Tires: annualize the cost based on usage (e.g. 2,000 km/month → changes every ~25 months)
  const kmPerYear = kmPerMonth * 12;
  const tireAnnual = (kmPerYear / TIRE_REPLACEMENT_KM) * TIRE_SET_COST;

  const annual = baseAnnual + tireAnnual;

  return {
    monthly: annual / 12,
    annual,
    tireAnnualizedMonthly: tireAnnual / 12,
  };
}
