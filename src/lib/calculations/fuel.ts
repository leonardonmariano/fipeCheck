import type { FuelCost, FuelType, BrazilianState } from "@/types";
import { getFuelPrice } from "@/lib/data/fuel-prices";

export function calculateFuelCost(
  kmPerMonth: number,
  consumptionKmL: number,
  fuelType: FuelType,
  state: BrazilianState,
  customFuelPrice?: number
): FuelCost {
  const pricePerLiter = customFuelPrice ?? getFuelPrice(state, fuelType);
  const litersPerMonth = kmPerMonth / consumptionKmL;
  const monthly = litersPerMonth * pricePerLiter;

  return {
    monthly,
    annual: monthly * 12,
    litersPerMonth,
    pricePerLiter,
  };
}

/**
 * Suggests a typical fuel consumption for a vehicle segment.
 * Based on INMETRO averages for the Brazilian market (km/L, city + highway mix).
 */
export function suggestConsumption(fipeValue: number, fuelType: FuelType): number {
  // Flex baseline uses gasoline consumption as reference
  const isEthanol = fuelType === "ethanol";

  if (fipeValue < 60_000) {
    // Popular: Gol, Mobi, Argo — ~12 km/L gas, ~9 km/L ethanol
    return isEthanol ? 9.0 : 12.0;
  }
  if (fipeValue < 100_000) {
    // Compacto médio: Pulse, Tracker, HB20 — ~11 km/L gas
    return isEthanol ? 8.5 : 11.0;
  }
  if (fipeValue < 200_000) {
    // SUV médio: Compass, Corolla Cross — ~10 km/L gas
    return isEthanol ? 7.5 : 10.0;
  }
  // Luxo/grande: ~9 km/L gas
  return isEthanol ? 7.0 : 9.0;
}
