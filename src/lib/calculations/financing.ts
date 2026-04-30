import type { FinancingConfig, FinancingCost } from "@/types";

/**
 * Tabela Price (constant installments).
 * PMT = PV * i / (1 - (1 + i)^-n)
 *
 * Where:
 *   PV = financed amount
 *   i  = monthly interest rate as a fraction (e.g. 0.015 for 1.5% a.m.)
 *   n  = term in months
 */
export function calculateFinancing(
  carValue: number,
  config: FinancingConfig
): FinancingCost {
  if (!config.enabled) {
    return {
      enabled: false,
      monthlyPayment: 0,
      totalInterest: 0,
      totalFinanced: 0,
      downPayment: 0,
    };
  }

  const downPayment = carValue * (config.downPaymentPercent / 100);
  const financed = carValue - downPayment;
  const rate = config.monthlyInterestRate / 100;
  const n = config.termMonths;

  let monthlyPayment: number;

  if (rate === 0) {
    // Zero-interest: divide evenly (rare but valid input)
    monthlyPayment = financed / n;
  } else {
    monthlyPayment = (financed * rate) / (1 - Math.pow(1 + rate, -n));
  }

  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - financed;

  return {
    enabled: true,
    downPayment,
    monthlyPayment,
    totalFinanced: financed,
    totalInterest,
  };
}

/** Effective annual interest rate from a monthly rate (%) */
export function monthlyToAnnualRate(monthlyPercent: number): number {
  return (Math.pow(1 + monthlyPercent / 100, 12) - 1) * 100;
}
