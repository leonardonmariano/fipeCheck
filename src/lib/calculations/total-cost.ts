import type {
  SelectedCar,
  UsageProfile,
  CostBreakdown,
  CarCostResult,
} from "@/types";
import { calculateDepreciation } from "./depreciation";
import { calculateFuelCost } from "./fuel";
import { calculateFinancing } from "./financing";
import { calculateInsurance } from "./insurance";
import { calculateMaintenance } from "./maintenance";
import { calculateInvestmentComparison } from "./investment";
import { generateInsights } from "./insights";
import { getIpvaRate } from "@/lib/data/ipva-rates";
import { extractYearFromCode } from "@/lib/utils";

const WASHING_MONTHLY = 50;
const LICENSING_ANNUAL = 150;

interface TotalCostInput {
  car: SelectedCar;
  usage: UsageProfile;
  /** FIPE value for the same model one year older (used for real depreciation rate) */
  olderYearValue?: number;
  /** Current Selic rate as % per year — defaults to 13.75 if unavailable */
  selicRate?: number;
}

export function calculateTotalCost({
  car,
  usage,
  olderYearValue,
  selicRate = 13.75,
}: TotalCostInput): CarCostResult {
  const fipeValue = car.fipeData.value;
  const carYear = extractYearFromCode(car.yearCode);
  const currentYear = new Date().getFullYear();
  const vehicleAge = Math.max(0, currentYear - carYear);

  // ── Depreciation ──────────────────────────────────────────────────────────
  const depreciation = calculateDepreciation(fipeValue, olderYearValue);

  // ── Fuel ──────────────────────────────────────────────────────────────────
  const fuel = calculateFuelCost(
    usage.kmPerMonth,
    usage.fuelConsumptionKmL,
    usage.fuelType,
    usage.state,
    usage.customFuelPrice
  );

  // ── IPVA ─────────────────────────────────────────────────────────────────
  const ipvaRate = getIpvaRate(usage.state);
  const ipvaAnnual = fipeValue * ipvaRate;
  const ipva = {
    monthly: ipvaAnnual / 12,
    annual: ipvaAnnual,
    rate: ipvaRate,
    state: usage.state,
  };

  // ── Insurance ─────────────────────────────────────────────────────────────
  const insurance = calculateInsurance(
    fipeValue,
    usage.driverAge,
    usage.customInsuranceMonthly
  );

  // ── Maintenance ───────────────────────────────────────────────────────────
  const maintenance = calculateMaintenance(vehicleAge, usage.kmPerMonth);

  // ── Financing ─────────────────────────────────────────────────────────────
  const financing = calculateFinancing(fipeValue, usage.financing);

  // ── Other fixed costs ─────────────────────────────────────────────────────
  const otherAnnual = LICENSING_ANNUAL + WASHING_MONTHLY * 12 + usage.parkingMonthly * 12;
  const other = {
    parking: usage.parkingMonthly,
    washing: WASHING_MONTHLY,
    licensing: LICENSING_ANNUAL / 12,
    monthly: otherAnnual / 12,
    annual: otherAnnual,
  };

  // ── Total ─────────────────────────────────────────────────────────────────
  const monthlyFixed =
    depreciation.monthly +
    fuel.monthly +
    ipva.monthly +
    insurance.monthly +
    maintenance.monthly +
    other.monthly;

  const monthly = monthlyFixed + (financing.enabled ? financing.monthlyPayment : 0);
  const annual = monthly * 12;
  const costPerKm = usage.kmPerMonth > 0 ? monthly / usage.kmPerMonth : 0;

  const costs: CostBreakdown = {
    depreciation,
    fuel,
    ipva,
    insurance,
    maintenance,
    financing,
    other,
    total: {
      monthly,
      annual,
      per10Years: annual * 10,
      costPerKm,
    },
  };

  // ── Investment comparison ─────────────────────────────────────────────────
  // If financing: invest the down payment + monthly installments.
  // If cash: invest the full car price + monthly costs (opportunity cost).
  const initialInvestment = financing.enabled
    ? financing.downPayment
    : fipeValue;

  const monthlyContribution = financing.enabled
    ? financing.monthlyPayment
    : monthlyFixed;

  const investment = calculateInvestmentComparison(
    selicRate,
    initialInvestment,
    monthlyContribution,
    fipeValue,
    depreciation.rate
  );

  const insights = generateInsights(costs, usage, car);

  return { car, usage, costs, investment, insights };
}
