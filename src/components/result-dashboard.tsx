"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import { motion } from "framer-motion";
import { animate } from "framer-motion";
import useSWR from "swr";
import {
  ArrowLeft,
  TrendingDown,
  Fuel,
  Shield,
  Wrench,
  CreditCard,
  Info,
  Share2,
  Download,
  GitCompare,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CostBreakdownChart } from "@/components/cost-breakdown-chart";
import { InvestmentComparisonChart } from "@/components/investment-comparison";
import { useYears, usePrice, findYearCode } from "@/lib/fipe";
import { calculateTotalCost } from "@/lib/calculations/total-cost";
import { formatCurrency, formatPercentAnnual, extractFuelCodeFromYearCode } from "@/lib/utils";
import type { BrazilianState, FuelType, SelectedCar, UsageProfile, CarCostResult, SelicResponse } from "@/types";

// ─── Zod schema for URL params ────────────────────────────────────────────────

const STATES = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO",
  "MA","MG","MS","MT","PA","PB","PE","PI","PR",
  "RJ","RN","RO","RR","RS","SC","SE","SP","TO",
] as const;

const FUEL_TYPES = ["gasoline", "ethanol", "diesel", "flex"] as const;

const paramsSchema = z.object({
  bc:  z.string().min(1),
  bn:  z.string().min(1),
  mc:  z.coerce.number().positive(),
  mn:  z.string().min(1),
  yc:  z.string().min(1),
  yn:  z.string().min(1),
  fv:  z.coerce.number().positive(),
  fc:  z.string().default(""),
  my:  z.coerce.number().positive(),
  fa:  z.string().default("G"),
  km:  z.coerce.number().positive().default(1500),
  ft:  z.enum(FUEL_TYPES).default("gasoline"),
  cn:  z.coerce.number().positive().default(11),
  st:  z.enum(STATES).default("SP"),
  ag:  z.coerce.number().positive().default(30),
  pk:  z.coerce.number().min(0).default(0),
  fn:  z.coerce.number().default(0),
  dp:  z.coerce.number().min(0).max(100).default(20),
  tm:  z.coerce.number().positive().default(48),
  ir:  z.coerce.number().min(0).default(1.5),
});

type ParsedParams = z.infer<typeof paramsSchema>;

// ─── Counter animation hook ───────────────────────────────────────────────────

function useCountUp(target: number, duration = 1.2) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate(v) { setValue(v); },
    });
    return controls.stop;
  }, [target, duration]);
  return value;
}

// ─── Fetcher for Selic ────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ─── Cost row component ───────────────────────────────────────────────────────

function CostRow({
  icon: Icon,
  label,
  monthly,
  annual,
  color,
  tooltip,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  monthly: number;
  annual: number;
  color: string;
  tooltip?: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: color + "20", color }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
          {tooltip && (
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{formatCurrency(annual)}/ano</p>
      </div>
      <p className="font-mono text-sm font-semibold text-foreground tabular-nums">
        {formatCurrency(monthly)}/mês
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ResultDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const parsed = paramsSchema.safeParse(
    Object.fromEntries(searchParams?.entries() ?? [])
  );

  if (!parsed.success) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Parâmetros inválidos.</p>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Voltar ao início
        </Button>
      </div>
    );
  }

  return <ResultContent p={parsed.data} />;
}

// ─── Inner content (avoids conditional hook after early return) ───────────────

function ResultContent({ p }: { p: ParsedParams }) {
  const router = useRouter();

  // Reconstruct SelectedCar + UsageProfile from URL params
  const car: SelectedCar = {
    brandCode: p.bc,
    brandName: p.bn,
    modelCode: p.mc,
    modelName: p.mn,
    yearCode:  p.yc,
    yearName:  p.yn,
    fipeData: {
      value:         p.fv,
      brand:         p.bn,
      model:         p.mn,
      modelYear:     p.my,
      fuel:          p.ft === "ethanol" ? "Etanol" : p.ft === "diesel" ? "Diesel" : "Gasolina",
      codeFipe:      p.fc,
      referenceMonth:"",
      vehicleType:   1,
      fuelAcronym:   p.fa,
    },
  };

  const usage: UsageProfile = {
    kmPerMonth:           p.km,
    fuelType:             p.ft as FuelType,
    fuelConsumptionKmL:   p.cn,
    state:                p.st as BrazilianState,
    driverAge:            p.ag,
    parkingMonthly:       p.pk,
    financing: {
      enabled:            p.fn === 1,
      downPaymentPercent: p.dp,
      termMonths:         p.tm,
      monthlyInterestRate:p.ir,
    },
  };

  // Fetch Selic (non-blocking — uses fallback if loading)
  const { data: selicData } = useSWR<SelicResponse>("/api/selic", fetcher, {
    revalidateOnFocus: false,
  });

  // Fetch older year for depreciation (optional — non-blocking)
  const { data: years } = useYears(p.bc, p.mc);
  const fuelCode = extractFuelCodeFromYearCode(p.yc);
  const olderYearCode = years ? findYearCode(years, p.my - 1, fuelCode) ?? null : null;
  const { data: olderPrice } = usePrice(p.bc, p.mc, olderYearCode);

  // Calculate — always runs, uses defaults if async data not yet available
  const result: CarCostResult = calculateTotalCost({
    car,
    usage,
    olderYearValue: olderPrice?.value,
    selicRate: selicData?.annualRate ?? 13.75,
  });

  const { costs, investment, insights } = result;
  const animatedMonthly = useCountUp(costs.total.monthly);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: "Quanto Custa Esse Trem?", url });
    } else {
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    }
  };

  const downloadCard = async () => {
    const params = new URLSearchParams({
      bc: p.bc, bn: p.bn,
      mc: String(p.mc), mn: p.mn,
      yc: p.yc, yn: p.yn,
      fv: String(p.fv), fc: p.fc,
      my: String(p.my), fa: p.fa,
      km: String(p.km), ft: p.ft,
      cn: String(p.cn), st: p.st,
      ag: String(p.ag), pk: String(p.pk),
      fn: String(p.fn), dp: String(p.dp),
      tm: String(p.tm), ir: String(p.ir),
    });
    const res = await fetch(`/api/og?${params.toString()}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.mn}-${p.yn}.png`.replace(/\s+/g, "-");
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* ── Back + title ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-semibold text-foreground leading-tight">
            {car.brandName} {car.modelName}
          </h1>
          <p className="text-xs text-muted-foreground">
            {car.yearName} · {formatCurrency(car.fipeData.value)} FIPE
          </p>
        </div>
        {costs.depreciation.isEstimated && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="ml-auto gap-1 text-xs">
                <AlertTriangle className="h-3 w-3" />
                Depreciação estimada
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              Usamos a média de 12% ao ano porque não encontramos o FIPE do ano anterior deste modelo.
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* ── Hero: custo mensal ────────────────────────────────────────────── */}
      <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
        <CardContent className="pt-8 pb-6 text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Custo total mensal estimado
          </p>
          <motion.p
            aria-hidden="true"
            className="mt-2 font-mono text-5xl font-bold text-foreground sm:text-6xl lg:text-7xl font-numeric"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {formatCurrency(animatedMonthly)}
          </motion.p>
          <span className="sr-only">{formatCurrency(costs.total.monthly)} por mês</span>
          <p className="mt-2 text-muted-foreground">
            ou{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(costs.total.annual)}
            </span>{" "}
            por ano
          </p>
        </CardContent>
      </Card>

      {/* ── Secondary stats ───────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Custo por km</p>
            <p className="mt-1 font-mono text-2xl font-bold text-foreground font-numeric">
              {formatCurrency(costs.total.costPerKm)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              para {p.km.toLocaleString("pt-BR")} km/mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Em 10 anos</p>
            <p className="mt-1 font-mono text-2xl font-bold text-foreground font-numeric">
              {formatCurrency(costs.total.per10Years)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">custo total acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Depreciação/mês</p>
            <p className="mt-1 font-mono text-2xl font-bold text-foreground font-numeric">
              {formatCurrency(costs.depreciation.monthly)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatPercentAnnual(costs.depreciation.rate)} ao ano
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts row ────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Composição dos custos</CardTitle>
          </CardHeader>
          <CardContent>
            <CostBreakdownChart costs={costs} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Detalhamento mensal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-border/50">
            <CostRow
              icon={TrendingDown}
              label="Depreciação"
              monthly={costs.depreciation.monthly}
              annual={costs.depreciation.annual}
              color="#F59E0B"
              tooltip="Perda de valor do carro na tabela FIPE ao longo do tempo."
              badge={costs.depreciation.isEstimated ? "estimada" : undefined}
            />
            <CostRow
              icon={Fuel}
              label="Combustível"
              monthly={costs.fuel.monthly}
              annual={costs.fuel.annual}
              color="#10B981"
              tooltip={`${costs.fuel.litersPerMonth.toFixed(0)} L/mês a ${formatCurrency(costs.fuel.pricePerLiter)}/L`}
            />
            <CostRow
              icon={Shield}
              label="Seguro"
              monthly={costs.insurance.monthly}
              annual={costs.insurance.annual}
              color="#3B82F6"
              tooltip="Estimativa baseada no valor FIPE e na faixa etária do motorista. Consulte corretoras para um valor real."
              badge={costs.insurance.isCustom ? "personalizado" : undefined}
            />
            <CostRow
              icon={CreditCard}
              label={`IPVA (${(costs.ipva.rate * 100).toFixed(1)}% — ${p.st})`}
              monthly={costs.ipva.monthly}
              annual={costs.ipva.annual}
              color="#EF4444"
              tooltip="Taxa anual aplicada sobre o valor FIPE do veículo, variando por estado. Dividido em 12 parcelas mensais."
            />
            <CostRow
              icon={Wrench}
              label="Manutenção + pneus"
              monthly={costs.maintenance.monthly}
              annual={costs.maintenance.annual}
              color="#8B5CF6"
              tooltip="Revisões, fluidos, filtros e pneus amortizados pelo uso mensal."
            />
            {costs.financing.enabled && (
              <CostRow
                icon={CreditCard}
                label={`Financiamento (${p.tm}x)`}
                monthly={costs.financing.monthlyPayment}
                annual={costs.financing.monthlyPayment * 12}
                color="#F97316"
                tooltip={`Juros totais: ${formatCurrency(costs.financing.totalInterest)}`}
              />
            )}
            <CostRow
              icon={Wrench}
              label="Outros (lavagem, licenciamento, estac.)"
              monthly={costs.other.monthly}
              annual={costs.other.annual}
              color="#6B7280"
              tooltip={`Lavagem (~R$50/mês), licenciamento (~R$13/mês)${p.pk > 0 ? ` e estacionamento (${formatCurrency(p.pk)}/mês)` : ""}`}
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Investment comparison ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            E se você tivesse investido?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InvestmentComparisonChart data={investment} />
        </CardContent>
      </Card>

      {/* ── Insights ──────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Insights
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="rounded-xl border border-border/50 bg-card px-4 py-3 text-sm text-muted-foreground leading-relaxed"
            >
              {insight}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" className="flex-1 gap-2" onClick={() => router.push("/comparar")}>
          <GitCompare className="h-4 w-4" />
          Comparar com outro carro
        </Button>
        <Button variant="outline" className="flex-1 gap-2" onClick={downloadCard}>
          <Download className="h-4 w-4" />
          Baixar card
        </Button>
        <Button className="flex-1 gap-2" onClick={handleShare}>
          {shareState === "copied" ? (
            <Check className="h-4 w-4" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          {shareState === "copied" ? "Link copiado!" : "Compartilhar resultado"}
        </Button>
      </div>

      {/* ── Disclaimer ────────────────────────────────────────────────────── */}
      <p className="text-center text-xs text-muted-foreground/60 pb-4">
        Todos os valores são estimativas baseadas em médias nacionais. Consulte profissionais para decisões financeiras.
      </p>
    </div>
  );
}
