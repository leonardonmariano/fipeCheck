"use client";

import { useEffect } from "react";
import { useBrands, useModels, useYears, usePrice } from "@/lib/fipe";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SelectedCar } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface CarSelectorProps {
  brandCode: string | null;
  modelCode: number | null;
  yearCode: string | null;
  onBrandChange: (code: string) => void;
  onModelChange: (code: number) => void;
  onYearChange: (code: string) => void;
  onCarReady: (car: SelectedCar) => void;
}

export function CarSelector({
  brandCode,
  modelCode,
  yearCode,
  onBrandChange,
  onModelChange,
  onYearChange,
  onCarReady,
}: CarSelectorProps) {
  const { data: brands, isLoading: brandsLoading, error: brandsError, mutate: retryBrands } = useBrands();
  const { data: models, isLoading: modelsLoading } = useModels(brandCode);
  const { data: years, isLoading: yearsLoading } = useYears(brandCode, modelCode);
  const { data: price, isLoading: priceLoading } = usePrice(brandCode, modelCode, yearCode);

  const selectedBrand = brands?.find((b) => b.code === brandCode);
  const selectedModel = models?.find((m) => m.code === modelCode);
  const selectedYear = years?.find((y) => y.code === yearCode);

  // Notify parent when a car is fully selected
  useEffect(() => {
    if (price && selectedBrand && selectedModel && selectedYear && brandCode && modelCode && yearCode) {
      onCarReady({
        brandCode,
        brandName: selectedBrand.name,
        modelCode,
        modelName: selectedModel.name,
        yearCode,
        yearName: selectedYear.name,
        fipeData: price,
      });
    }
  }, [price, brandCode, modelCode, yearCode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {/* Marca */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Marca</label>
        {brandsLoading ? (
          <Skeleton className="h-8 w-full rounded-lg" />
        ) : brandsError ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Erro ao carregar marcas.</span>
            <Button variant="ghost" size="sm" className="ml-auto h-6 px-2 text-xs" onClick={() => retryBrands()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <Select value={brandCode} onValueChange={(v) => { if (v) onBrandChange(v); }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a marca...">
                {selectedBrand?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {brands?.map((brand) => (
                <SelectItem key={brand.code} value={brand.code}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Modelo */}
      {brandCode && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Modelo</label>
          {modelsLoading ? (
            <Skeleton className="h-8 w-full rounded-lg" />
          ) : (
            <Select
              value={modelCode?.toString() ?? null}
              onValueChange={(v) => { if (v) onModelChange(parseInt(v, 10)); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o modelo...">
                {selectedModel?.name}
              </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {models?.map((model) => (
                  <SelectItem key={model.code} value={model.code.toString()}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Ano */}
      {modelCode && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Ano / Combustível</label>
          {yearsLoading ? (
            <Skeleton className="h-8 w-full rounded-lg" />
          ) : (
            <Select value={yearCode} onValueChange={(v) => { if (v) onYearChange(v); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o ano...">
                {selectedYear?.name}
              </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {years?.map((year) => (
                  <SelectItem key={year.code} value={year.code}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Valor FIPE */}
      {yearCode && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 transition-all">
          {priceLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-5 w-32" />
            </div>
          ) : price ? (
            <>
              <p className="text-xs text-muted-foreground">
                Tabela FIPE — {price.referenceMonth}
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-foreground font-numeric">
                {formatCurrency(price.value)}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="secondary">{price.fuel}</Badge>
                <Badge variant="secondary" className="font-mono text-xs">
                  {price.codeFipe}
                </Badge>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
