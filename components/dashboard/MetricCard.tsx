"use client";

import { formatCurrency } from "@/lib/analytics";
import { ArrowDownRight, ArrowUpRight, CreditCard, PiggyBank, TrendingDown, TrendingUp, WalletCards } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number;
  type?: "income" | "expense" | "balance" | "rate";
  vsLastMonth?: number;
  active?: boolean;
  onClick?: () => void;
}

const cardConfig = {
  income: {
    valueColor: "text-[#047857]",
    gradient: "from-[#DFF8EF] via-white to-[#EEF2FF]",
    icon: ArrowDownRight,
    iconBg: "bg-[#DFF8EF] text-[#047857]",
  },
  expense: {
    valueColor: "text-[#B91C1C]",
    gradient: "from-[#FFE7D6] via-white to-[#FCE7F3]",
    icon: ArrowUpRight,
    iconBg: "bg-[#FFE7D6] text-[#B91C1C]",
  },
  balance: {
    valueColor: "text-[#111827]",
    gradient: "from-[#EEF2FF] via-white to-[#EAFBF6]",
    icon: WalletCards,
    iconBg: "bg-[#EEF2FF] text-[#3B5BDB]",
  },
  rate: {
    valueColor: "text-[#3B5BDB]",
    gradient: "from-[#E0F2FE] via-white to-[#F3E8FF]",
    icon: PiggyBank,
    iconBg: "bg-[#E0F2FE] text-[#0369A1]",
  },
};

export function MetricCard({ label, value, type = "balance", vsLastMonth, active = false, onClick }: MetricCardProps) {
  const isPositive = vsLastMonth !== undefined && vsLastMonth >= 0;
  const isNegative = vsLastMonth !== undefined && vsLastMonth < 0;
  const config = cardConfig[type];
  const Icon = config.icon;

  const displayValue = type === "rate" ? `${value}%` : formatCurrency(value);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[24px] border bg-gradient-to-br ${config.gradient} p-5 text-left shadow-[0_18px_50px_-42px_rgba(15,23,42,0.75)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-[#C7D2FE] hover:shadow-[0_26px_70px_-48px_rgba(59,91,219,0.55)] ${
        active ? "border-[#8EA4FF] ring-4 ring-[#EEF2FF]" : "border-white/80"
      }`}
      aria-pressed={active}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/50 blur-2xl transition-transform duration-300 group-hover:scale-125" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">{label}</p>
          <p className={`mt-3 text-2xl font-black tracking-tight ${config.valueColor}`}>{displayValue}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${config.iconBg}`}>
          <Icon size={21} strokeWidth={1.9} />
        </div>
      </div>
      {vsLastMonth !== undefined && (
        <div
          className={`relative mt-5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
            isPositive ? "bg-[#ECFDF5] text-[#047857]" : isNegative ? "bg-[#FEF2F2] text-[#B91C1C]" : "bg-[#F1F5F9] text-[#64748B]"
          }`}
        >
          {isPositive ? <TrendingUp size={13} /> : isNegative ? <TrendingDown size={13} /> : <CreditCard size={13} />}
          <span>{isPositive ? "+" : ""}{vsLastMonth}% vs last month</span>
        </div>
      )}
    </button>
  );
}
