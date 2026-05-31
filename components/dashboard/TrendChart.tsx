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
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px]">
      <h3 className="text-base font-semibold text-[#111827] mb-4">6-Month Trend</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <Bar dataKey="Income" fill="#4F6EF7" radius={[4, 4, 0, 0]} opacity={0.85} />
            <Bar dataKey="Expenses" fill="#F06595" radius={[4, 4, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
