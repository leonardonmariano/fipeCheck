import type { BrazilianState } from "@/types";

/**
 * IPVA rates by state (cars/passenger vehicles).
 * Source: Secretarias de Fazenda estaduais — rates for 2024/2025.
 * All values are annual rates as fractions (e.g. 0.04 = 4%).
 */
export const IPVA_RATES: Record<BrazilianState, number> = {
  AC: 0.02,   // Acre
  AL: 0.03,   // Alagoas
  AM: 0.035,  // Amazonas
  AP: 0.02,   // Amapá
  BA: 0.035,  // Bahia
  CE: 0.03,   // Ceará
  DF: 0.035,  // Distrito Federal
  ES: 0.03,   // Espírito Santo
  GO: 0.0375, // Goiás
  MA: 0.025,  // Maranhão
  MG: 0.04,   // Minas Gerais
  MS: 0.025,  // Mato Grosso do Sul
  MT: 0.03,   // Mato Grosso
  PA: 0.025,  // Pará
  PB: 0.03,   // Paraíba
  PE: 0.035,  // Pernambuco
  PI: 0.035,  // Piauí
  PR: 0.035,  // Paraná
  RJ: 0.04,   // Rio de Janeiro
  RN: 0.03,   // Rio Grande do Norte
  RO: 0.025,  // Rondônia
  RR: 0.02,   // Roraima
  RS: 0.03,   // Rio Grande do Sul
  SC: 0.02,   // Santa Catarina
  SE: 0.035,  // Sergipe
  SP: 0.04,   // São Paulo
  TO: 0.03,   // Tocantins
};

export function getIpvaRate(state: BrazilianState): number {
  return IPVA_RATES[state];
}
