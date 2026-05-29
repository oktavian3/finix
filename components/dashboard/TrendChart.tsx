"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getMonthLabel } from '@/lib/analytics';
import type { MonthlySummary } from '@/types/finix';

interface TrendChartProps {
  data: MonthlySummary[];
}

export function TrendChart({ data }: TrendChartProps) {
  const chartData = data.map((m: MonthlySummary) => ({
    month: getMonthLabel(m.month).split(' ')[0],
    Income: m.totalIncome,
    Expenses: m.totalExpense,
  }));

  return (
    <div className="bg-[#111827] border border-[#1E293B] p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-mono text-[#3B5BDB]">/TREND</span>
        <h3 className="text-[12px] font-mono font-semibold text-white uppercase tracking-wider">6-Month Trend</h3>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }} axisLine={{ stroke: '#1E293B' }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }} axisLine={{ stroke: '#1E293B' }} tickLine={false} />
            <Bar dataKey="Income" fill="#3B5BDB" radius={[2, 2, 0, 0]} opacity={0.85} />
            <Bar dataKey="Expenses" fill="#F06595" radius={[2, 2, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
