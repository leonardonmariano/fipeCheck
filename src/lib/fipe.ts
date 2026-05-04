"use client";

import useSWR from "swr";
import type { FipeBrand, FipeModel, FipeYear, FipePrice } from "@/types";

const BASE_URL = "https://parallelum.com.br/fipe/api/v2";

// ─── Generic fetcher ──────────────────────────────────────────────────────────

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FIPE API error: ${res.status} ${res.statusText} — ${url}`);
  }
  return res.json() as Promise<T>;
}

// ─── Raw fetch functions (usable server-side or inside SWR) ──────────────────

export async function fetchBrands(): Promise<FipeBrand[]> {
  return fetcher<FipeBrand[]>(`${BASE_URL}/cars/brands`);
}

export async function fetchModels(brandCode: string): Promise<FipeModel[]> {
  return fetcher<FipeModel[]>(`${BASE_URL}/cars/brands/${brandCode}/models`);
}

export async function fetchYears(
  brandCode: string,
  modelCode: number
): Promise<FipeYear[]> {
  return fetcher<FipeYear[]>(
    `${BASE_URL}/cars/brands/${brandCode}/models/${modelCode}/years`
  );
}

// The FIPE API may return `value` as a formatted string ("R$ 17.272,00") or a number
async function priceFetcher(url: string): Promise<FipePrice> {
  const raw = await fetcher<Record<string, unknown>>(url);
  const rawValue = raw.value;
  const numericValue =
    typeof rawValue === "number"
      ? rawValue
      : typeof rawValue === "string"
      ? parseFloat(rawValue.replace(/[R$\s.]/g, "").replace(",", "."))
      : 0;
  return { ...(raw as unknown as FipePrice), value: numericValue };
}

export async function fetchPrice(
  brandCode: string,
  modelCode: number,
  yearCode: string
): Promise<FipePrice> {
  return priceFetcher(
    `${BASE_URL}/cars/brands/${brandCode}/models/${modelCode}/years/${yearCode}`
  );
}

// ─── SWR hooks ────────────────────────────────────────────────────────────────

const SWR_OPTIONS = {
  revalidateOnFocus: false,
  dedupingInterval: 60_000 * 60, // cache for 1 hour per session
};

export function useBrands() {
  return useSWR<FipeBrand[], Error>(
    `${BASE_URL}/cars/brands`,
    fetcher<FipeBrand[]>,
    SWR_OPTIONS
  );
}

export function useModels(brandCode: string | null) {
  return useSWR<FipeModel[], Error>(
    brandCode ? `${BASE_URL}/cars/brands/${brandCode}/models` : null,
    fetcher<FipeModel[]>,
    SWR_OPTIONS
  );
}

export function useYears(brandCode: string | null, modelCode: number | null) {
  return useSWR<FipeYear[], Error>(
    brandCode && modelCode
      ? `${BASE_URL}/cars/brands/${brandCode}/models/${modelCode}/years`
      : null,
    fetcher<FipeYear[]>,
    SWR_OPTIONS
  );
}

export function usePrice(
  brandCode: string | null,
  modelCode: number | null,
  yearCode: string | null
) {
  return useSWR<FipePrice, Error>(
    brandCode && modelCode && yearCode
      ? `${BASE_URL}/cars/brands/${brandCode}/models/${modelCode}/years/${yearCode}`
      : null,
    priceFetcher,
    SWR_OPTIONS
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Finds the year code for a given calendar year and fuel code within a years list.
 * E.g. findYearCode(years, 2022, "1") → "2022-1"
 */
export function findYearCode(
  years: FipeYear[],
  calendarYear: number,
  fuelCode: string
): string | undefined {
  return years.find((y) => y.code === `${calendarYear}-${fuelCode}`)?.code;
}
