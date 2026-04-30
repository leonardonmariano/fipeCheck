import type { VehicleCategory } from "@/types";

/**
 * Annual insurance rate as a fraction of FIPE value.
 * Source: estimativas baseadas em cotações médias do mercado brasileiro (2024/2025).
 * Rates vary significantly by profile — use as estimativa para fins de cálculo.
 * Motoristas jovens (< 25 anos) pagam prêmios substancialmente maiores.
 */

interface InsuranceRateRange {
  young: number;   // drivers < 25
  standard: number; // drivers 25–60
  senior: number;  // drivers > 60
}

const INSURANCE_RATES: Record<VehicleCategory, InsuranceRateRange> = {
  popular:  { young: 0.065, standard: 0.045, senior: 0.055 }, // carros até R$ 80k
  medium:   { young: 0.050, standard: 0.035, senior: 0.042 }, // R$ 80k–200k
  luxury:   { young: 0.040, standard: 0.025, senior: 0.032 }, // acima de R$ 200k
};

export function getVehicleCategory(fipeValue: number): VehicleCategory {
  if (fipeValue < 80_000) return "popular";
  if (fipeValue < 200_000) return "medium";
  return "luxury";
}

export function getInsuranceRate(category: VehicleCategory, driverAge: number): number {
  const rates = INSURANCE_RATES[category];
  if (driverAge < 25) return rates.young;
  if (driverAge <= 60) return rates.standard;
  return rates.senior;
}

export const VEHICLE_CATEGORY_LABELS: Record<VehicleCategory, string> = {
  popular: "Popular (até R$ 80k)",
  medium: "Médio (R$ 80k–200k)",
  luxury: "Luxo (acima de R$ 200k)",
};
