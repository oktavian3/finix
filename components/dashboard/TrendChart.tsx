"use client";

import { Area, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getMonthLabel, formatCurrency } from "@/lib/analytics";
import type { MonthlySummary } from "@/types/finix";

interface TrendChartProps {
  data: MonthlySummary[];
}

export function TrendChart({ data }: TrendChartProps) {
  const chartData = data.map((m: MonthlySummary) => ({
    month: getMonthLabel(m.month).split(" ")[0],
    Income: m.totalIncome,
    Expenses: m.totalExpense,
    Balance: m.netBalance,
  }));

  return (
    <div className="rounded-[26px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C7D2FE]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94A3B8]">Cashflow Overview</p>
          <h3 className="mt-1 text-lg font-black text-[#111827]">6-Month Trend</h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-[#64748B]">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#3B5BDB]" /> Income</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#F06595]" /> Expenses</span>
        </div>
      </div>
      <div className="h-[290px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B5BDB" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#3B5BDB" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F06595" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#F06595" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
            <Tooltip
              cursor={{ stroke: "#CBD5E1", strokeDasharray: "4 4" }}
              contentStyle={{ borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 20px 45px -30px rgba(15,23,42,0.85)" }}
              formatter={(value) => formatCurrency(Number(value || 0))}
            />
            <Bar dataKey="Balance" fill="#DDE7FF" radius={[8, 8, 0, 0]} barSize={22} />
            <Area type="monotone" dataKey="Income" stroke="#3B5BDB" strokeWidth={3} fill="url(#incomeFill)" dot={{ r: 3, fill: "#3B5BDB" }} activeDot={{ r: 5 }} />
            <Area type="monotone" dataKey="Expenses" stroke="#F06595" strokeWidth={3} fill="url(#expenseFill)" dot={{ r: 3, fill: "#F06595" }} activeDot={{ r: 5 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
