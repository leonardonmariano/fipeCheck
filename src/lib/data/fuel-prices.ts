import type { BrazilianState, FuelType } from "@/types";

// última atualização: abril 2025
// Fonte: médias estaduais estimadas com base nos dados da ANP (Agência Nacional do Petróleo)
// https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/precos-revenda-e-de-distribuicao-combustiveis

interface FuelPrices {
  gasoline: number; // gasolina comum
  ethanol: number;  // etanol hidratado
  diesel: number;   // diesel S10/S500 comum
}

export const FUEL_PRICES: Record<BrazilianState, FuelPrices> = {
  AC: { gasoline: 6.45, ethanol: 5.20, diesel: 6.60 },
  AL: { gasoline: 6.15, ethanol: 4.60, diesel: 6.35 },
  AM: { gasoline: 6.50, ethanol: 5.30, diesel: 6.65 },
  AP: { gasoline: 6.55, ethanol: 5.40, diesel: 6.70 },
  BA: { gasoline: 6.30, ethanol: 4.50, diesel: 6.45 },
  CE: { gasoline: 6.10, ethanol: 4.40, diesel: 6.25 },
  DF: { gasoline: 6.20, ethanol: 4.30, diesel: 6.35 },
  ES: { gasoline: 5.95, ethanol: 4.00, diesel: 6.15 },
  GO: { gasoline: 5.90, ethanol: 3.85, diesel: 6.10 },
  MA: { gasoline: 6.25, ethanol: 4.55, diesel: 6.40 },
  MG: { gasoline: 5.90, ethanol: 3.90, diesel: 6.10 },
  MS: { gasoline: 5.85, ethanol: 3.80, diesel: 6.05 },
  MT: { gasoline: 5.95, ethanol: 3.90, diesel: 6.15 },
  PA: { gasoline: 6.40, ethanol: 5.10, diesel: 6.55 },
  PB: { gasoline: 6.20, ethanol: 4.50, diesel: 6.35 },
  PE: { gasoline: 6.15, ethanol: 4.45, diesel: 6.30 },
  PI: { gasoline: 6.30, ethanol: 4.60, diesel: 6.45 },
  PR: { gasoline: 5.80, ethanol: 3.75, diesel: 5.98 },
  RJ: { gasoline: 6.40, ethanol: 4.50, diesel: 6.55 },
  RN: { gasoline: 6.20, ethanol: 4.50, diesel: 6.35 },
  RO: { gasoline: 6.30, ethanol: 5.00, diesel: 6.50 },
  RR: { gasoline: 6.60, ethanol: 5.50, diesel: 6.75 },
  RS: { gasoline: 5.90, ethanol: 4.00, diesel: 6.10 },
  SC: { gasoline: 5.85, ethanol: 3.95, diesel: 6.05 },
  SE: { gasoline: 6.20, ethanol: 4.55, diesel: 6.35 },
  SP: { gasoline: 6.10, ethanol: 4.20, diesel: 6.28 },
  TO: { gasoline: 6.20, ethanol: 4.55, diesel: 6.40 },
};

/**
 * For flex cars: use ethanol if it costs less than 70% of gasoline price
 * (ethanol has ~30% lower energy density, so the break-even is 70%).
 */
function resolveFlexFuel(prices: FuelPrices): { price: number; resolved: "gasoline" | "ethanol" } {
  if (prices.ethanol < prices.gasoline * 0.7) {
    return { price: prices.ethanol, resolved: "ethanol" };
  }
  return { price: prices.gasoline, resolved: "gasoline" };
}

export function getFuelPrice(state: BrazilianState, fuelType: FuelType): number {
  const prices = FUEL_PRICES[state];
  switch (fuelType) {
    case "gasoline":
      return prices.gasoline;
    case "ethanol":
      return prices.ethanol;
    case "diesel":
      return prices.diesel;
    case "flex":
      return resolveFlexFuel(prices).price;
  }
}

export function getFuelLabel(fuelType: FuelType): string {
  const labels: Record<FuelType, string> = {
    gasoline: "Gasolina",
    ethanol: "Etanol",
    diesel: "Diesel",
    flex: "Flex (mais barato)",
  };
  return labels[fuelType];
}
