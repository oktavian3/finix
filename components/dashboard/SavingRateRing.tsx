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

  const COLORS = ['#4F6EF7', '#EEF2FF'];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px]">
      <h3 className="text-base font-semibold text-[#111827] mb-4">Saving Rate</h3>
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
            <span className="text-2xl font-bold text-[#3B5BDB]">{savingRate}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs text-[#6B7280]">You save {savingRate}% of your income</p>
          {vsLastMonth !== undefined && (
            <p className={`text-xs mt-1 ${vsLastMonth >= 0 ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
              {vsLastMonth >= 0 ? '↑' : '↓'} {Math.abs(vsLastMonth)}% vs last month
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
