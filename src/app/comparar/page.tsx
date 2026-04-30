"use client";

import { useState } from "react";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trophy, TrendingDown } from "lucide-react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddCarDialog } from "@/components/add-car-dialog";
import { ComparisonBarChart } from "@/components/comparison-bar-chart";
import type { ComparisonEntry, SelicResponse } from "@/types";
import { formatCurrency, formatPercentAnnual } from "@/lib/utils";

const CAR_COLORS = ["#F59E0B", "#10B981", "#3B82F6"];
const fetcher = (url: string) => fetch(url).then((r) => r.json());

const COMPARISON_ROWS = [
  { label: "Total mensal",       key: (e: ComparisonEntry) => e.costs.total.monthly },
  { label: "Total anual",        key: (e: ComparisonEntry) => e.costs.total.annual },
  { label: "Custo por km",       key: (e: ComparisonEntry) => e.costs.total.costPerKm },
  { label: "Depreciação/mês",    key: (e: ComparisonEntry) => e.costs.depreciation.monthly },
  { label: "Combustível/mês",    key: (e: ComparisonEntry) => e.costs.fuel.monthly },
  { label: "Seguro/mês",         key: (e: ComparisonEntry) => e.costs.insurance.monthly },
  { label: "IPVA/mês",           key: (e: ComparisonEntry) => e.costs.ipva.monthly },
  { label: "Manutenção/mês",     key: (e: ComparisonEntry) => e.costs.maintenance.monthly },
  { label: "Outros/mês",         key: (e: ComparisonEntry) => e.costs.other.monthly },
  { label: "Em 10 anos",         key: (e: ComparisonEntry) => e.costs.total.per10Years },
] as const;

function ComparisonTable({ entries }: { entries: ComparisonEntry[] }) {
  const monthlies = entries.map((e) => e.costs.total.monthly);
  const minIdx = monthlies.indexOf(Math.min(...monthlies));
  const maxIdx = monthlies.indexOf(Math.max(...monthlies));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50">
            <th className="py-2.5 pr-4 text-left text-xs font-medium text-muted-foreground w-36">
              Métrica
            </th>
            {entries.map((entry, i) => (
              <th key={entry.id} className="px-3 py-2.5 text-right text-xs font-medium">
                <span className="flex items-center justify-end gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: CAR_COLORS[i] }}
                  />
                  <span className="truncate max-w-[120px]">
                    {entry.car.brandName} {entry.car.modelName}
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map(({ label, key }) => {
            const values = entries.map((e) => key(e));
            const min = Math.min(...values);
            const max = Math.max(...values);

            return (
              <tr key={label} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 pr-4 text-xs text-muted-foreground">{label}</td>
                {entries.map((entry, i) => {
                  const v = key(entry);
                  const isBest = entries.length > 1 && v === min;
                  const isWorst = entries.length > 1 && v === max;
                  return (
                    <td
                      key={entry.id}
                      className="px-3 py-2.5 text-right font-mono tabular-nums"
                    >
                      <span
                        className={
                          isBest
                            ? "font-semibold text-emerald-600 dark:text-emerald-400"
                            : isWorst
                            ? "font-semibold text-destructive"
                            : "text-foreground"
                        }
                      >
                        {formatCurrency(v)}
                      </span>
                      {isBest && entries.length > 1 && (
                        <Trophy className="ml-1 inline h-3 w-3 text-emerald-500" />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {entries.length > 1 && (
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Trophy className="h-3 w-3 text-emerald-500" />
            Mais barato na categoria
          </span>
          <span className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-destructive" />
            Mais caro
          </span>
        </div>
      )}
    </div>
  );
}

export default function CompararPage() {
  const [entries, setEntries] = useState<ComparisonEntry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: selicData } = useSWR<SelicResponse>("/api/selic", fetcher, {
    revalidateOnFocus: false,
  });

  const handleAdd = (entry: ComparisonEntry) => {
    setEntries((prev) => [...prev, entry].slice(0, 3));
  };

  const handleRemove = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const cheapest = entries.length > 1
    ? entries.reduce((a, b) => (a.costs.total.monthly < b.costs.total.monthly ? a : b))
    : null;

  return (
    <Suspense>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Comparar carros</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Adicione até 3 carros para comparar o custo total lado a lado.
            </p>
          </div>
          {entries.length < 3 && (
            <Button onClick={() => setDialogOpen(true)} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Adicionar carro
            </Button>
          )}
        </div>

        {/* Empty state */}
        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mt-4 font-semibold text-foreground">Nenhum carro adicionado</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Adicione até 3 carros para ver uma comparação completa de custos.
            </p>
            <Button className="mt-6 gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Adicionar primeiro carro
            </Button>
          </div>
        )}

        {/* Car summary cards */}
        {entries.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {entries.map((entry, i) => {
                  const isCheapest = cheapest?.id === entry.id;
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className="relative border-2 transition-colors"
                        style={{
                          borderColor: isCheapest ? CAR_COLORS[i] + "60" : undefined,
                        }}
                      >
                        <button
                          onClick={() => handleRemove(entry.id)}
                          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          aria-label="Remover"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <CardContent className="pt-5 pb-4">
                          <div className="flex items-start gap-2">
                            <span
                              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: CAR_COLORS[i] }}
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground leading-tight truncate">
                                {entry.car.brandName} {entry.car.modelName}
                              </p>
                              <p className="text-xs text-muted-foreground">{entry.car.yearName}</p>
                            </div>
                          </div>

                          <p className="mt-4 font-mono text-3xl font-bold text-foreground tabular-nums">
                            {formatCurrency(entry.costs.total.monthly)}
                          </p>
                          <p className="text-xs text-muted-foreground">por mês</p>

                          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                              <span>FIPE</span>
                              <span className="font-mono text-foreground">
                                {formatCurrency(entry.car.fipeData.value)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Deprec./mês</span>
                              <span className="font-mono text-foreground">
                                {formatCurrency(entry.costs.depreciation.monthly)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Deprec. anual</span>
                              <span className="font-mono text-foreground">
                                {formatPercentAnnual(entry.costs.depreciation.rate)}
                              </span>
                            </div>
                          </div>

                          {isCheapest && entries.length > 1 && (
                            <Badge className="mt-3 gap-1 text-xs" style={{ backgroundColor: CAR_COLORS[i] }}>
                              <Trophy className="h-3 w-3" />
                              Mais barato
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}

                {/* Add slot */}
                {entries.length < 3 && (
                  <motion.button
                    key="add-slot"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setDialogOpen(true)}
                    className="flex min-h-[180px] items-center justify-center rounded-xl border-2 border-dashed border-border/50 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Plus className="h-6 w-6" />
                      <span className="text-sm font-medium">Adicionar carro</span>
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Bar chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Custos mensais por categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonBarChart entries={entries} />
              </CardContent>
            </Card>

            {/* Comparison table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tabela comparativa</CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonTable entries={entries} />
              </CardContent>
            </Card>
          </>
        )}

        <AddCarDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onAdd={handleAdd}
          selicRate={selicData?.annualRate}
        />
      </div>
    </Suspense>
  );
}
