"use client";

import { formatCurrency } from '@/lib/analytics';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number;
  type?: 'income' | 'expense' | 'balance' | 'rate';
  vsLastMonth?: number;
  onClick?: () => void;
}

export function MetricCard({ label, value, type = 'balance', vsLastMonth, onClick }: MetricCardProps) {
  const isPositive = vsLastMonth !== undefined && vsLastMonth >= 0;
  const isNegative = vsLastMonth !== undefined && vsLastMonth < 0;

  let displayValue: string;
  let valueColor: string;

  switch (type) {
    case 'income':
      displayValue = formatCurrency(value);
      valueColor = 'text-[#15803D]';
      break;
    case 'expense':
      displayValue = formatCurrency(value);
      valueColor = 'text-[#B91C1C]';
      break;
    case 'rate':
      displayValue = `${value}%`;
      valueColor = 'text-[#3B5BDB]';
      break;
    default:
      displayValue = formatCurrency(value);
      valueColor = value >= 0 ? 'text-[#111827]' : 'text-[#B91C1C]';
  }

  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px] hover:shadow-md transition-shadow cursor-pointer"
    >
      <p className="text-[11px] text-[#6B7280] font-medium">{label}</p>
      <p className={`mt-2 text-[22px] font-semibold ${valueColor}`}>{displayValue}</p>
      {vsLastMonth !== undefined && (
        <div className={`mt-2 flex items-center gap-1 text-[11px] ${isPositive ? 'text-[#15803D]' : isNegative ? 'text-[#B91C1C]' : 'text-[#6B7280]'}`}>
          {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : null}
          <span>{isPositive ? '+' : ''}{vsLastMonth}% vs last month</span>
        </div>
      )}
    </div>
  );
}
