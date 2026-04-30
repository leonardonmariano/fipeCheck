import type { InsuranceCost } from "@/types";
import { getVehicleCategory, getInsuranceRate } from "@/lib/data/insurance-estimates";

export function calculateInsurance(
  fipeValue: number,
  driverAge: number,
  customMonthly?: number
): InsuranceCost {
  if (customMonthly !== undefined) {
    return {
      monthly: customMonthly,
      annual: customMonthly * 12,
      isCustom: true,
    };
  }

  const category = getVehicleCategory(fipeValue);
  const rate = getInsuranceRate(category, driverAge);
  const annual = fipeValue * rate;

  return {
    monthly: annual / 12,
    annual,
    isCustom: false,
  };
}
