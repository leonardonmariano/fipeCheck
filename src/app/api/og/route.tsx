import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";
import { calculateTotalCost } from "@/lib/calculations/total-cost";
import type { BrazilianState, FuelType, SelectedCar, UsageProfile } from "@/types";

export const runtime = "edge";

// Cost categories for the card (top 3 shown)
const COST_LABELS: Record<string, string> = {
  depreciation: "Depreciação",
  fuel:         "Combustível",
  insurance:    "Seguro",
  ipva:         "IPVA",
  maintenance:  "Manutenção",
};

function parseSafeNumber(v: string | null, fallback: number): number {
  const n = parseFloat(v ?? "");
  return isNaN(n) ? fallback : n;
}

function parseSafeString<T extends string>(v: string | null, fallback: T): T {
  return (v as T) ?? fallback;
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  try {
    const brandName  = parseSafeString(searchParams.get("bn"), "Carro");
    const modelName  = parseSafeString(searchParams.get("mn"), "");
    const yearName   = parseSafeString(searchParams.get("yn"), "");
    const fipeValue  = parseSafeNumber(searchParams.get("fv"), 50000);
    const modelYear  = parseSafeNumber(searchParams.get("my"), new Date().getFullYear());
    const fuelAcronym = parseSafeString(searchParams.get("fa"), "G");
    const codeFipe   = parseSafeString(searchParams.get("fc"), "");
    const kmPerMonth = parseSafeNumber(searchParams.get("km"), 1500);
    const fuelType   = parseSafeString<FuelType>(searchParams.get("ft"), "gasoline");
    const consumption = parseSafeNumber(searchParams.get("cn"), 11);
    const state      = parseSafeString<BrazilianState>(searchParams.get("st"), "SP");
    const driverAge  = parseSafeNumber(searchParams.get("ag"), 30);

    const car: SelectedCar = {
      brandCode: searchParams.get("bc") ?? "0",
      brandName,
      modelCode: parseSafeNumber(searchParams.get("mc"), 0),
      modelName,
      yearCode:  searchParams.get("yc") ?? "0",
      yearName,
      fipeData: {
        value: fipeValue,
        brand: brandName,
        model: modelName,
        modelYear,
        fuel: fuelType === "ethanol" ? "Etanol" : fuelType === "diesel" ? "Diesel" : "Gasolina",
        codeFipe,
        referenceMonth: "",
        vehicleType: 1,
        fuelAcronym,
      },
    };

    const usage: UsageProfile = {
      kmPerMonth,
      fuelType,
      fuelConsumptionKmL: consumption,
      state,
      driverAge,
      parkingMonthly: parseSafeNumber(searchParams.get("pk"), 0),
      financing: {
        enabled: searchParams.get("fn") === "1",
        downPaymentPercent: parseSafeNumber(searchParams.get("dp"), 20),
        termMonths: parseSafeNumber(searchParams.get("tm"), 48),
        monthlyInterestRate: parseSafeNumber(searchParams.get("ir"), 1.5),
      },
    };

    const result = calculateTotalCost({ car, usage });
    const { costs } = result;

    // Pick top 3 monthly costs
    const costItems = [
      { label: COST_LABELS.depreciation, value: costs.depreciation.monthly, color: "#F59E0B" },
      { label: COST_LABELS.fuel,         value: costs.fuel.monthly,         color: "#10B981" },
      { label: COST_LABELS.insurance,    value: costs.insurance.monthly,    color: "#3B82F6" },
      { label: COST_LABELS.ipva,         value: costs.ipva.monthly,         color: "#EF4444" },
      { label: COST_LABELS.maintenance,  value: costs.maintenance.monthly,  color: "#8B5CF6" },
    ]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    const monthly = costs.total.monthly;

    return new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #18181b 0%, #09090b 60%, #111827 100%)",
          padding: "56px 64px",
          fontFamily: "sans-serif",
          color: "white",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#F59E0B",
              }}
            >
              <span style={{ fontSize: 20 }}>🚗</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 600, color: "#d4d4d8" }}>
              Quanto Custa Esse Trem?
            </span>
          </div>
          <span
            style={{
              fontSize: 13,
              color: "#71717a",
              background: "#27272a",
              padding: "4px 12px",
              borderRadius: 999,
              border: "1px solid #3f3f46",
            }}
          >
            {state} · {kmPerMonth.toLocaleString("pt-BR")} km/mês
          </span>
        </div>

        {/* Car name */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 48, gap: 4 }}>
          <span style={{ fontSize: 24, color: "#a1a1aa", fontWeight: 500 }}>
            {brandName} {modelName}
          </span>
          <span style={{ fontSize: 16, color: "#52525b" }}>{yearName} · FIPE {formatBRL(fipeValue)}</span>
        </div>

        {/* Cost hero */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 20, gap: 4 }}>
          <span
            style={{
              fontSize: 88,
              fontWeight: 800,
              color: "#F59E0B",
              lineHeight: 1,
              letterSpacing: "-2px",
            }}
          >
            {formatBRL(monthly)}
          </span>
          <span style={{ fontSize: 22, color: "#71717a", fontWeight: 400 }}>por mês</span>
        </div>

        {/* Cost breakdown mini */}
        <div style={{ display: "flex", gap: 16, marginTop: "auto" }}>
          {costItems.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                flex: 1,
                background: "#27272a",
                borderRadius: 12,
                padding: "16px 20px",
                border: `1px solid ${item.color}30`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: item.color,
                  }}
                />
                <span style={{ fontSize: 13, color: "#a1a1aa" }}>{item.label}</span>
              </div>
              <span style={{ fontSize: 22, fontWeight: 700, color: "white" }}>
                {formatBRL(item.value)}
                <span style={{ fontSize: 13, color: "#71717a", fontWeight: 400 }}>/mês</span>
              </span>
            </div>
          ))}
        </div>

        {/* CTA footer */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <span style={{ fontSize: 14, color: "#52525b" }}>
            Calcule o seu em{" "}
            <span style={{ color: "#F59E0B" }}>quantocustaessetrem.com.br</span>
          </span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    // Fallback minimal image on any error
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#18181b",
          color: "#F59E0B",
          fontSize: 32,
          fontFamily: "sans-serif",
        }}
      >
        Quanto Custa Esse Trem?
      </div>,
      { width: 1200, height: 630 }
    );
  }
}
