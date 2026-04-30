"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { BrazilianState, FuelType, SelectedCar } from "@/types";
import { suggestConsumption } from "@/lib/calculations/fuel";
import { formatCurrency } from "@/lib/utils";

const STATES: { value: BrazilianState; label: string }[] = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AM", label: "Amazonas" },
  { value: "AP", label: "Amapá" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MG", label: "Minas Gerais" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MT", label: "Mato Grosso" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "PR", label: "Paraná" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SE", label: "Sergipe" },
  { value: "SP", label: "São Paulo" },
  { value: "TO", label: "Tocantins" },
];

interface UsageFormProps {
  car: SelectedCar | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UsageForm({ car, open, onOpenChange }: UsageFormProps) {
  const router = useRouter();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [kmPerMonth, setKmPerMonth] = useState(1500);
  const [fuelType, setFuelType] = useState<FuelType>("gasoline");
  const [consumption, setConsumption] = useState(11);
  const [state, setState] = useState<BrazilianState>("SP");
  const [driverAge, setDriverAge] = useState(30);
  const [parkingMonthly, setParkingMonthly] = useState(0);
  const [financingEnabled, setFinancingEnabled] = useState(false);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [termMonths, setTermMonths] = useState(48);
  const [interestRate, setInterestRate] = useState(1.5);

  // Auto-suggest consumption when fuel type or car changes
  useEffect(() => {
    if (car) {
      setConsumption(parseFloat(suggestConsumption(car.fipeData.value, fuelType).toFixed(1)));
    }
  }, [fuelType, car]);

  const handleSubmit = () => {
    if (!car || kmPerMonth < 100) return;

    const params = new URLSearchParams({
      bc: car.brandCode,
      bn: car.brandName,
      mc: car.modelCode.toString(),
      mn: car.modelName,
      yc: car.yearCode,
      yn: car.yearName,
      fv: car.fipeData.value.toString(),
      fc: car.fipeData.codeFipe,
      my: car.fipeData.modelYear.toString(),
      fa: car.fipeData.fuelAcronym,
      km: kmPerMonth.toString(),
      ft: fuelType,
      cn: consumption.toString(),
      st: state,
      ag: driverAge.toString(),
      pk: parkingMonthly.toString(),
      fn: financingEnabled ? "1" : "0",
    });

    if (financingEnabled) {
      params.set("dp", downPaymentPct.toString());
      params.set("tm", termMonths.toString());
      params.set("ir", interestRate.toString());
    }

    router.push(`/resultado?${params.toString()}`);
  };

  if (!car) return null;

  const downPaymentValue = car.fipeData.value * (downPaymentPct / 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Como você usa o carro?</DialogTitle>
          <DialogDescription>
            {car.brandName} {car.modelName} {car.yearName} —{" "}
            {formatCurrency(car.fipeData.value)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* ── Uso diário ─────────────────────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Uso diário
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="km">Km por mês</Label>
                <Input
                  id="km"
                  type="number"
                  min={100}
                  max={20000}
                  step={100}
                  value={kmPerMonth}
                  onChange={(e) => setKmPerMonth(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="consumption">Consumo (km/L)</Label>
                <Input
                  id="consumption"
                  type="number"
                  min={3}
                  max={30}
                  step={0.5}
                  value={consumption}
                  onChange={(e) => setConsumption(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Combustível</Label>
              <Select value={fuelType} onValueChange={(v) => setFuelType(v as FuelType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">Gasolina</SelectItem>
                  <SelectItem value="ethanol">Etanol</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="flex">Flex (usa o mais barato)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* ── Perfil ─────────────────────────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Perfil
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Estado (UF)</Label>
                <Select value={state} onValueChange={(v) => setState(v as BrazilianState)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="age">Idade do motorista</Label>
                <Input
                  id="age"
                  type="number"
                  min={18}
                  max={90}
                  value={driverAge}
                  onChange={(e) => setDriverAge(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="parking">Estacionamento mensal (R$)</Label>
              <Input
                id="parking"
                type="number"
                min={0}
                max={3000}
                step={50}
                value={parkingMonthly}
                onChange={(e) => setParkingMonthly(Number(e.target.value))}
              />
            </div>
          </div>

          <Separator />

          {/* ── Financiamento ───────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Financiamento
              </h3>
              <Switch
                checked={financingEnabled}
                onCheckedChange={setFinancingEnabled}
              />
            </div>

            {financingEnabled && (
              <div className="space-y-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="dp" className="text-xs">Entrada (%)</Label>
                    <Input
                      id="dp"
                      type="number"
                      min={0}
                      max={90}
                      value={downPaymentPct}
                      onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="term" className="text-xs">Prazo (meses)</Label>
                    <Input
                      id="term"
                      type="number"
                      min={12}
                      max={96}
                      step={12}
                      value={termMonths}
                      onChange={(e) => setTermMonths(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rate" className="text-xs">Taxa (% a.m.)</Label>
                    <Input
                      id="rate"
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Entrada: {formatCurrency(downPaymentValue)} · Financiado:{" "}
                  {formatCurrency(car.fipeData.value - downPaymentValue)}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={kmPerMonth < 100 || consumption < 1}
            className="w-full font-semibold"
          >
            Ver resultado →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
