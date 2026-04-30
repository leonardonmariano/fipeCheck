// ─── FIPE API ────────────────────────────────────────────────────────────────

export interface FipeBrand {
  code: string;
  name: string;
}

export interface FipeModel {
  code: number;
  name: string;
}

export interface FipeYear {
  code: string; // e.g. "2023-1" (year-fuelType)
  name: string; // e.g. "2023 Gasolina"
}

// The /models endpoint at parallelum v2 returns models + years together
export interface FipeModelsResponse {
  models: FipeModel[];
  years: FipeYear[];
}

export interface FipePrice {
  value: number; // numeric FIPE value (e.g. 89000.00)
  brand: string;
  model: string;
  modelYear: number;
  fuel: string;
  codeFipe: string;
  referenceMonth: string;
  vehicleType: number;
  fuelAcronym: string; // "G" | "A" | "D"
}

// ─── Domain ──────────────────────────────────────────────────────────────────

export type FuelType = "gasoline" | "ethanol" | "diesel" | "flex";

export type BrazilianState =
  | "AC" | "AL" | "AM" | "AP" | "BA" | "CE" | "DF" | "ES" | "GO"
  | "MA" | "MG" | "MS" | "MT" | "PA" | "PB" | "PE" | "PI" | "PR"
  | "RJ" | "RN" | "RO" | "RR" | "RS" | "SC" | "SE" | "SP" | "TO";

export type VehicleCategory = "popular" | "medium" | "luxury";

export interface SelectedCar {
  brandCode: string;
  brandName: string;
  modelCode: number;
  modelName: string;
  yearCode: string;
  yearName: string;
  fipeData: FipePrice;
}

export interface FinancingConfig {
  enabled: boolean;
  downPaymentPercent: number; // 0–100
  termMonths: number;
  monthlyInterestRate: number; // % a.m. (e.g. 1.5 for 1.5%)
}

export interface UsageProfile {
  kmPerMonth: number;
  fuelType: FuelType;
  fuelConsumptionKmL: number;
  state: BrazilianState;
  driverAge: number;
  financing: FinancingConfig;
  parkingMonthly: number;
  customFuelPrice?: number;
  customInsuranceMonthly?: number;
}

// ─── Cost breakdown ───────────────────────────────────────────────────────────

export interface DepreciationCost {
  monthly: number;
  annual: number;
  rate: number; // fraction (e.g. 0.12 = 12%)
  isEstimated: boolean;
}

export interface FuelCost {
  monthly: number;
  annual: number;
  litersPerMonth: number;
  pricePerLiter: number;
}

export interface IpvaCost {
  monthly: number;
  annual: number;
  rate: number;
  state: BrazilianState;
}

export interface InsuranceCost {
  monthly: number;
  annual: number;
  isCustom: boolean;
}

export interface MaintenanceCost {
  monthly: number;
  annual: number;
  tireAnnualizedMonthly: number;
}

export interface FinancingCost {
  enabled: boolean;
  monthlyPayment: number;
  totalInterest: number;
  totalFinanced: number;
  downPayment: number;
}

export interface OtherCosts {
  parking: number;
  washing: number;
  licensing: number;
  monthly: number;
  annual: number;
}

export interface TotalCost {
  monthly: number;
  annual: number;
  per10Years: number;
  costPerKm: number;
}

export interface CostBreakdown {
  depreciation: DepreciationCost;
  fuel: FuelCost;
  ipva: IpvaCost;
  insurance: InsuranceCost;
  maintenance: MaintenanceCost;
  financing: FinancingCost;
  other: OtherCosts;
  total: TotalCost;
}

// ─── Investment comparison ────────────────────────────────────────────────────

export interface InvestmentDataPoint {
  month: number;
  year: number;
  carPatrimony: number;
  investedPatrimony: number;
}

export interface InvestmentComparison {
  selicRate: number; // % per year
  cdiRate: number;   // % per year
  initialInvestment: number;
  monthlyContribution: number;
  projectionYears: number;
  data: InvestmentDataPoint[];
  finalDifference: number;
}

// ─── Final result ─────────────────────────────────────────────────────────────

export interface CarCostResult {
  car: SelectedCar;
  usage: UsageProfile;
  costs: CostBreakdown;
  investment: InvestmentComparison;
  insights: string[];
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface ComparisonEntry {
  id: string;
  car: SelectedCar;
  usage: UsageProfile;
  costs: CostBreakdown;
}

// ─── Selic API ────────────────────────────────────────────────────────────────

export interface SelicResponse {
  annualRate: number;  // % per year (e.g. 13.75)
  monthlyRate: number; // % per month (compounded from annual)
  cdiRate: number;     // CDI approximation = selic * 0.97
  fetchedAt: string;
}
