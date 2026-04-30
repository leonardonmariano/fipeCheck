"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { InvestmentComparison } from "@/types";
import { formatCurrencyCompact, formatCurrency } from "@/lib/utils";

interface InvestmentComparisonChartProps {
  data: InvestmentComparison;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2.5 shadow-md text-sm space-y-1.5 min-w-[180px]">
      <p className="font-medium text-popover-foreground">Ano {label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            {item.name}
          </span>
          <span className="font-mono font-medium text-foreground">
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function InvestmentComparisonChart({ data }: InvestmentComparisonChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Skeleton className="h-[320px] w-full rounded-xl" />;
  }

  const chartData = data.data.map((point) => ({
    year: point.year,
    Investido: Math.round(point.investedPatrimony),
    Carro: Math.round(point.carPatrimony),
  }));

  const diff = data.finalDifference;
  const diffPositive = diff > 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Em {data.projectionYears} anos, investir no CDI ({data.cdiRate.toFixed(1)}% a.a.) em vez do carro
          resultaria em um patrimônio{" "}
          <span className={diffPositive ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-destructive font-semibold"}>
            {diffPositive ? "R$ " + formatCurrency(diff).replace("R$ ", "") + " maior" : "equivalente"}
          </span>.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
          <XAxis
            dataKey="year"
            tickFormatter={(v) => `Ano ${v}`}
            tick={{ fontSize: 11 }}
            stroke="currentColor"
            strokeOpacity={0.3}
          />
          <YAxis
            tickFormatter={(v) => formatCurrencyCompact(v)}
            tick={{ fontSize: 11 }}
            stroke="currentColor"
            strokeOpacity={0.3}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="Investido"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Carro"
            stroke="#F59E0B"
            strokeWidth={2.5}
            dot={false}
            strokeDasharray="5 3"
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
