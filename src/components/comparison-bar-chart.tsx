"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { ComparisonEntry } from "@/types";
import { formatCurrencyCompact, formatCurrency } from "@/lib/utils";

const CAR_COLORS = ["#F59E0B", "#10B981", "#3B82F6"];

interface ComparisonBarChartProps {
  entries: ComparisonEntry[];
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
      <p className="font-medium text-popover-foreground">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="max-w-[100px] truncate text-xs">{item.name}</span>
          </span>
          <span className="font-mono font-medium text-foreground tabular-nums">
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ComparisonBarChart({ entries }: ComparisonBarChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <Skeleton className="h-[320px] w-full rounded-xl" />;

  const categories = [
    { key: "depreciation", label: "Deprec." },
    { key: "fuel",         label: "Combustível" },
    { key: "insurance",    label: "Seguro" },
    { key: "ipva",         label: "IPVA" },
    { key: "maintenance",  label: "Manutenção" },
    { key: "other",        label: "Outros" },
  ];

  const chartData = categories.map(({ key, label }) => {
    const point: Record<string, string | number> = { name: label };
    entries.forEach((entry, i) => {
      const costs = entry.costs;
      let value = 0;
      switch (key) {
        case "depreciation": value = costs.depreciation.monthly; break;
        case "fuel":         value = costs.fuel.monthly; break;
        case "insurance":    value = costs.insurance.monthly; break;
        case "ipva":         value = costs.ipva.monthly; break;
        case "maintenance":  value = costs.maintenance.monthly; break;
        case "other":        value = costs.other.monthly; break;
      }
      point[`car${i}`] = parseFloat(value.toFixed(2));
    });
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          stroke="currentColor"
          strokeOpacity={0.3}
        />
        <YAxis
          tickFormatter={(v) => formatCurrencyCompact(v)}
          tick={{ fontSize: 11 }}
          stroke="currentColor"
          strokeOpacity={0.3}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-muted-foreground">{value}</span>
          )}
        />
        {entries.map((entry, i) => (
          <Bar
            key={entry.id}
            dataKey={`car${i}`}
            fill={CAR_COLORS[i]}
            name={`${entry.car.brandName} ${entry.car.modelName} ${entry.car.yearName}`}
            radius={[3, 3, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
