"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface SavingRateRingProps {
  savingRate: number;
  vsLastMonth?: number;
}

export function SavingRateRing({ savingRate, vsLastMonth }: SavingRateRingProps) {
  const data = [
    { name: 'Saved', value: savingRate },
    { name: 'Spent', value: 100 - savingRate },
  ];

  const COLORS = ['#3B5BDB', '#1E293B'];

  return (
    <div className="bg-[#111827] border border-[#1E293B] p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-mono text-[#3B5BDB]">/SAVING</span>
        <h3 className="text-[12px] font-mono font-semibold text-white uppercase tracking-wider">Saving Rate</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative h-[140px] w-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={60}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[22px] font-bold text-[#3B5BDB] font-mono">{savingRate}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-mono text-[#9CA3AF]">You save {savingRate}% of income</p>
          {vsLastMonth !== undefined && (
            <p className={`text-[10px] font-mono mt-1 ${vsLastMonth >= 0 ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
              {vsLastMonth >= 0 ? '↑' : '↓'} {Math.abs(vsLastMonth)}% VS_PREV
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
