import type { InvestmentComparison, InvestmentDataPoint } from "@/types";
import { annualToMonthlyRate, futureValue } from "@/lib/utils";

const PROJECTION_YEARS = 10;

/**
 * Compares two scenarios over time:
 *  A) Owning the car: patrimony = depreciating FIPE value
 *  B) Investing the same money: patrimony = CDI compound returns
 *
 * @param selicAnnualPercent  Selic rate as % per year (e.g. 13.75)
 * @param initialInvestment   Down payment (or full car value if cash purchase)
 * @param monthlyContribution Monthly amount that "would have been invested" (financing installment or cost)
 * @param carValue            Current FIPE value
 * @param depreciationRate    Annual depreciation rate as fraction (e.g. 0.12)
 */
export function calculateInvestmentComparison(
  selicAnnualPercent: number,
  initialInvestment: number,
  monthlyContribution: number,
  carValue: number,
  depreciationRate: number
): InvestmentComparison {
  // CDI ≈ 97% of Selic
  const cdiAnnualPercent = selicAnnualPercent * 0.97;
  const monthlyInvestReturn = annualToMonthlyRate(cdiAnnualPercent);

  // Monthly depreciation factor
  const monthlyDepreciation = 1 - Math.pow(1 - depreciationRate, 1 / 12);

  const data: InvestmentDataPoint[] = [];
  let investedPatrimony = initialInvestment;
  let carPatrimony = carValue;

  const totalMonths = PROJECTION_YEARS * 12;

  for (let month = 1; month <= totalMonths; month++) {
    investedPatrimony =
      futureValue(investedPatrimony, monthlyInvestReturn, 1, monthlyContribution);
    carPatrimony = carPatrimony * (1 - monthlyDepreciation);

    // Record one data point per year
    if (month % 12 === 0) {
      data.push({
        month,
        year: month / 12,
        carPatrimony: Math.max(carPatrimony, 0),
        investedPatrimony,
      });
    }
  }

  const last = data[data.length - 1];
  const finalDifference = (last?.investedPatrimony ?? 0) - (last?.carPatrimony ?? 0);

  return {
    selicRate: selicAnnualPercent,
    cdiRate: cdiAnnualPercent,
    initialInvestment,
    monthlyContribution,
    projectionYears: PROJECTION_YEARS,
    data,
    finalDifference,
  };
}
