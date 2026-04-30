"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CarSelector } from "@/components/car-selector";
import { calculateTotalCost } from "@/lib/calculations/total-cost";
import { suggestConsumption } from "@/lib/calculations/fuel";
import type { BrazilianState, FuelType, SelectedCar, ComparisonEntry } from "@/types";

const STATES: { value: BrazilianState; label: string }[] = [
  { value: "SP", label: "São Paulo" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PR", label: "Paraná" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "SC", label: "Santa Catarina" },
  { value: "BA", label: "Bahia" },
  { value: "DF", label: "Distrito Federal" },
  { value: "GO", label: "Goiás" },
  { value: "PE", label: "Pernambuco" },
  { value: "CE", label: "Ceará" },
  { value: "AM", label: "Amazonas" },
  { value: "PA", label: "Pará" },
  { value: "MA", label: "Maranhão" },
  { value: "ES", label: "Espírito Santo" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "PB", label: "Paraíba" },
  { value: "AL", label: "Alagoas" },
  { value: "PI", label: "Piauí" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
  { value: "RO", label: "Rondônia" },
  { value: "AC", label: "Acre" },
  { value: "AP", label: "Amapá" },
  { value: "RR", label: "Roraima" },
];

interface AddCarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (entry: ComparisonEntry) => void;
  selicRate?: number;
}

export function AddCarDialog({ open, onOpenChange, onAdd, selicRate = 13.75 }: AddCarDialogProps) {
  const [brandCode, setBrandCode] = useState<string | null>(null);
  const [modelCode, setModelCode] = useState<number | null>(null);
  const [yearCode, setYearCode] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<SelectedCar | null>(null);

  const [kmPerMonth, setKmPerMonth] = useState(1500);
  const [fuelType, setFuelType] = useState<FuelType>("gasoline");
  const [consumption, setConsumption] = useState(11);
  const [state, setState] = useState<BrazilianState>("SP");
  const [driverAge, setDriverAge] = useState(30);

  useEffect(() => {
    if (selectedCar) {
      setConsumption(parseFloat(suggestConsumption(selectedCar.fipeData.value, fuelType).toFixed(1)));
    }
  }, [fuelType, selectedCar]);

  const handleBrandChange = (code: string) => {
    setBrandCode(code);
    setModelCode(null);
    setYearCode(null);
    setSelectedCar(null);
  };

  const handleAdd = () => {
    if (!selectedCar) return;

    const usage = {
      kmPerMonth,
      fuelType,
      fuelConsumptionKmL: consumption,
      state,
      driverAge,
      parkingMonthly: 0,
      financing: {
        enabled: false,
        downPaymentPercent: 0,
        termMonths: 0,
        monthlyInterestRate: 0,
      },
    };

    const result = calculateTotalCost({ car: selectedCar, usage, selicRate });

    onAdd({
      id: crypto.randomUUID(),
      car: selectedCar,
      usage,
      costs: result.costs,
    });

    // Reset
    setBrandCode(null);
    setModelCode(null);
    setYearCode(null);
    setSelectedCar(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar carro ao comparativo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <CarSelector
            brandCode={brandCode}
            modelCode={modelCode}
            yearCode={yearCode}
            onBrandChange={handleBrandChange}
            onModelChange={(code) => { setModelCode(code); setYearCode(null); setSelectedCar(null); }}
            onYearChange={(code) => { setYearCode(code); setSelectedCar(null); }}
            onCarReady={setSelectedCar}
          />

          {selectedCar && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Uso rápido
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="d-km">Km por mês</Label>
                    <Input
                      id="d-km"
                      type="number"
                      min={100}
                      max={20000}
                      step={100}
                      value={kmPerMonth}
                      onChange={(e) => setKmPerMonth(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="d-cons">Consumo (km/L)</Label>
                    <Input
                      id="d-cons"
                      type="number"
                      min={3}
                      max={30}
                      step={0.5}
                      value={consumption}
                      onChange={(e) => setConsumption(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Combustível</Label>
                    <Select value={fuelType} onValueChange={(v) => { if (v) setFuelType(v as FuelType); }}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasoline">Gasolina</SelectItem>
                        <SelectItem value="ethanol">Etanol</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="flex">Flex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="d-age">Idade</Label>
                    <Input
                      id="d-age"
                      type="number"
                      min={18}
                      max={90}
                      value={driverAge}
                      onChange={(e) => setDriverAge(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Estado (IPVA)</Label>
                  <Select value={state} onValueChange={(v) => { if (v) setState(v as BrazilianState); }}>
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
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleAdd}
            disabled={!selectedCar || kmPerMonth < 100}
            className="w-full font-semibold"
          >
            Adicionar ao comparativo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
