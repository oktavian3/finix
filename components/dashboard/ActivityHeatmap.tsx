"use client";

import { formatCurrency } from '@/lib/analytics';

interface ActivityHeatmapProps {
  data: Array<{ date: string; amount: number }>;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const dayMap = new Map<string, number>();
  data.forEach(d => { dayMap.set(d.date, d.amount); });

  const days: Array<{ date: string; amount: number; day: number; month: string }> = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const amount = dayMap.get(dateStr) || 0;
    days.push({
      date: dateStr,
      amount,
      day: d.getDate(),
      month: d.toLocaleString('en-US', { month: 'short' }),
    });
  }

  const maxAmount = Math.max(...days.map(d => d.amount), 1);
  
  const getIntensity = (amount: number): string => {
    if (amount === 0) return 'bg-[#0A0E1A]';
    const ratio = amount / maxAmount;
    if (ratio > 0.75) return 'bg-[#3B5BDB]';
    if (ratio > 0.5) return 'bg-[#4F6EF7]';
    if (ratio > 0.25) return 'bg-[#3B5BDB]/40';
    return 'bg-[#3B5BDB]/20';
  };

  return (
    <div className="bg-[#111827] border border-[#1E293B] p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-mono text-[#3B5BDB]">/ACTIVITY</span>
        <h3 className="text-[12px] font-mono font-semibold text-white uppercase tracking-wider">Daily Activity</h3>
      </div>
      <div className="grid grid-cols-15 gap-1">
        {days.map((d, i) => {
          const showLabel = i === 0 || d.date.slice(0, 7) !== days[i - 1]?.date.slice(0, 7);
          return (
            <div key={d.date} className="flex flex-col items-center gap-0.5 group relative">
              {showLabel && <span className="text-[8px] font-mono text-[#334155] mb-0.5">{d.month}</span>}
              <div
                className={`w-full aspect-square ${getIntensity(d.amount)} cursor-pointer transition-all duration-150 hover:ring-1 hover:ring-[#3B5BDB] hover:scale-125`}
                title={`${d.date}: ${d.amount > 0 ? formatCurrency(d.amount) : 'No activity'}`}
              />
              <span className="text-[7px] font-mono text-[#334155]">{d.day}</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0E1A] text-[#9CA3AF] text-[9px] font-mono px-2 py-1 border border-[#1E293B] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {d.date}: {d.amount > 0 ? formatCurrency(d.amount) : 'NONE'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
