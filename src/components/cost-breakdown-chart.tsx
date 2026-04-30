"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { CostBreakdown } from "@/types";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  { key: "depreciation", label: "Depreciação", color: "#F59E0B" },
  { key: "fuel",         label: "Combustível", color: "#10B981" },
  { key: "insurance",    label: "Seguro",       color: "#3B82F6" },
  { key: "ipva",         label: "IPVA",         color: "#EF4444" },
  { key: "maintenance",  label: "Manutenção",   color: "#8B5CF6" },
  { key: "financing",    label: "Financiamento",color: "#F97316" },
  { key: "other",        label: "Outros",       color: "#6B7280" },
];

interface CostBreakdownChartProps {
  costs: CostBreakdown;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-popover-foreground">{item.name}</p>
      <p className="font-mono text-muted-foreground">{formatCurrency(item.value)}/mês</p>
    </div>
  );
}

export function CostBreakdownChart({ costs }: CostBreakdownChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = COLORS.map(({ key, label, color }) => {
    let value = 0;
    switch (key) {
      case "depreciation": value = costs.depreciation.monthly; break;
      case "fuel":         value = costs.fuel.monthly; break;
      case "insurance":    value = costs.insurance.monthly; break;
      case "ipva":         value = costs.ipva.monthly; break;
      case "maintenance":  value = costs.maintenance.monthly; break;
      case "financing":    value = costs.financing.enabled ? costs.financing.monthlyPayment : 0; break;
      case "other":        value = costs.other.monthly; break;
    }
    return { name: label, value: parseFloat(value.toFixed(2)), color };
  }).filter((d) => d.value > 0);

  if (!mounted) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 min-w-0">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground truncate">{item.name}</span>
            <span className="ml-auto font-mono font-medium text-foreground shrink-0">
              {Math.round((item.value / costs.total.monthly) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
