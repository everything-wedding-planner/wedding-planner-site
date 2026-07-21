import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    label?: string;
  };
  icon?: LucideIcon;
}

export default function StatsCard({ label, value, trend, icon }: StatsCardProps) {
  const isPositive = trend && trend.value > 0;
  const isNegative = trend && trend.value < 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <span className="text-xs sm:text-sm font-medium text-stone-500">
          {label}
        </span>
        {icon && <icon className="h-6 w-6 text-stone-400 shrink-0" />}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
        {value}
      </p>
      {trend && (
        <div
          className={`flex items-center gap-1 mt-1 text-xs font-medium ${
            isPositive
              ? "text-green-600"
              : isNegative
                ? "text-red-600"
                : "text-stone-500"
          }`}
        >
          {isPositive && <TrendingUp className="h-3 w-3" />}
          {isNegative && <TrendingDown className="h-3 w-3" />}
          <span>
            {isPositive ? "+" : ""}
            {trend.value}%
            {trend.label ? ` ${trend.label}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}
