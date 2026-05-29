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
  let accentColor: string;

  switch (type) {
    case 'income':
      displayValue = formatCurrency(value);
      valueColor = 'text-[#15803D]';
      accentColor = 'bg-[#15803D]';
      break;
    case 'expense':
      displayValue = formatCurrency(value);
      valueColor = 'text-[#B91C1C]';
      accentColor = 'bg-[#B91C1C]';
      break;
    case 'rate':
      displayValue = `${value}%`;
      valueColor = 'text-[#3B5BDB]';
      accentColor = 'bg-[#3B5BDB]';
      break;
    default:
      displayValue = formatCurrency(value);
      valueColor = value >= 0 ? 'text-white' : 'text-[#B91C1C]';
      accentColor = 'bg-[#3B5BDB]';
  }

  return (
    <div
      onClick={onClick}
      className="bg-[#111827] border border-[#1E293B] p-4 hover:border-[#334155] hover:shadow-[0_0_15px_rgba(59,91,219,0.1)] transition-all duration-150 cursor-pointer relative overflow-hidden"
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${accentColor}`} />
      
      <p className="text-[9px] font-mono text-[#6B7280] uppercase tracking-wider pl-2">{label}</p>
      <p className={`mt-2 text-[20px] font-bold font-mono ${valueColor} pl-2`}>{displayValue}</p>
      {vsLastMonth !== undefined && (
        <div className={`mt-2 flex items-center gap-1 text-[10px] font-mono ${isPositive ? 'text-[#15803D]' : isNegative ? 'text-[#B91C1C]' : 'text-[#6B7280]'} pl-2`}>
          {isPositive ? <TrendingUp size={11} /> : isNegative ? <TrendingDown size={11} /> : null}
          <span>{isPositive ? '+' : ''}{vsLastMonth}% VS_PREV</span>
        </div>
      )}
    </div>
  );
}
