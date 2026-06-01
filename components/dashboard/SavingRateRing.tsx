"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";

interface SavingRateRingProps {
  savingRate: number;
  vsLastMonth?: number;
}

export function SavingRateRing({ savingRate, vsLastMonth }: SavingRateRingProps) {
  const clampedRate = Math.max(0, Math.min(100, savingRate));
  const data = [
    { name: "Saved", value: clampedRate },
    { name: "Spent", value: 100 - clampedRate },
  ];

  return (
    <div className="rounded-[26px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C7D2FE]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94A3B8]">Savings Health</p>
          <h3 className="mt-1 text-lg font-black text-[#111827]">Saving Rate</h3>
        </div>
        {vsLastMonth !== undefined && (
          <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${vsLastMonth >= 0 ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#FEF2F2] text-[#B91C1C]"}`}>
            {vsLastMonth >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(vsLastMonth)}%
          </div>
        )}
      </div>

      <div className="grid items-center gap-5 sm:grid-cols-[160px_1fr] xl:grid-cols-1 2xl:grid-cols-[160px_1fr]">
        <div className="relative mx-auto h-[160px] w-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={72} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                <Cell fill="#3B5BDB" />
                <Cell fill="#EEF2FF" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-[#111827]">{savingRate}%</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#94A3B8]">saved</span>
          </div>
        </div>

        <div>
          <p className="text-sm leading-7 text-[#64748B]">
            You are saving {savingRate}% of income in this period. The ring keeps the target visible without hiding the trend context.
          </p>
          <div className="mt-5 h-2 rounded-full bg-[#EEF2FF]">
            <div className="h-2 rounded-full bg-gradient-to-r from-[#3B5BDB] to-[#22C55E] transition-all duration-700" style={{ width: `${clampedRate}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
