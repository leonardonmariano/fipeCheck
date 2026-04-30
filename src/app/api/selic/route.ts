import { NextResponse } from "next/server";
import type { SelicResponse } from "@/types";

// Revalidate cache every 24 hours (Next.js route segment config)
export const revalidate = 86400;

/**
 * BCB SGS series 11 — "Taxa de juros - Selic"
 * Observed: returns the DAILY overnight Selic rate in % (e.g. "0.0543" = 0.0543%/day).
 * Annualized using 252 Brazilian business days: ((1 + daily/100)^252 - 1) * 100
 * CDI ≈ Selic * 0.97
 */
const BCB_URL =
  "https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/1?formato=json";

// Fallback in case the BCB API is unavailable
const FALLBACK_ANNUAL_RATE = 13.75;

export async function GET() {
  try {
    const res = await fetch(BCB_URL, {
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`BCB API responded with ${res.status}`);
    }

    const data = (await res.json()) as Array<{ data: string; valor: string }>;
    const latest = data[0];

    if (!latest?.valor) {
      throw new Error("BCB API returned empty data");
    }

    // Daily Selic rate in % (e.g. "0.0543" means 0.0543%/business day)
    const dailyRate = parseFloat(latest.valor.replace(",", "."));

    if (isNaN(dailyRate)) {
      throw new Error("BCB API returned non-numeric value");
    }

    // Annualize: 252 Brazilian business days per year
    const annualRate = (Math.pow(1 + dailyRate / 100, 252) - 1) * 100;
    const monthlyRate = (Math.pow(1 + dailyRate / 100, 21) - 1) * 100; // ~21 biz days/month
    const cdiRate = annualRate * 0.97;

    const response: SelicResponse = {
      annualRate: parseFloat(annualRate.toFixed(2)),
      monthlyRate: parseFloat(monthlyRate.toFixed(4)),
      cdiRate: parseFloat(cdiRate.toFixed(2)),
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    // Serve a known-good fallback so the app never breaks due to BCB outages
    const fallback: SelicResponse = {
      annualRate: FALLBACK_ANNUAL_RATE,
      monthlyRate: parseFloat(
        ((Math.pow(1 + FALLBACK_ANNUAL_RATE / 100, 1 / 12) - 1) * 100).toFixed(4)
      ),
      cdiRate: parseFloat((FALLBACK_ANNUAL_RATE * 0.97).toFixed(2)),
      fetchedAt: new Date().toISOString(),
    };

    console.error("[/api/selic] BCB fetch failed, using fallback:", err);

    return NextResponse.json(fallback, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600",
        "X-Fallback": "true",
      },
    });
  }
}
