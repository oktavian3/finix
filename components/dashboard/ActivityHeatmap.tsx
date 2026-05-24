"use client";

import { formatCurrency } from '@/lib/analytics';

interface ActivityHeatmapProps {
  data: Array<{ date: string; amount: number }>;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Build day map
  const dayMap = new Map<string, number>();
  data.forEach(d => { dayMap.set(d.date, d.amount); });

  // Generate last 30 days
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
    if (amount === 0) return 'bg-[#F1F5F9]';
    const ratio = amount / maxAmount;
    if (ratio > 0.75) return 'bg-[#4F6EF7]';
    if (ratio > 0.5) return 'bg-[#93C5FD]';
    if (ratio > 0.25) return 'bg-[#BFDBFE]';
    return 'bg-[#EEF2FF]';
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px]">
      <h3 className="text-[14px] font-semibold text-[#111827] mb-4">Daily Activity</h3>
      <div className="grid grid-cols-15 gap-1.5">
        {days.map((d, i) => {
          // Show month label at start of each month group
          const showLabel = i === 0 || d.date.slice(0, 7) !== days[i - 1]?.date.slice(0, 7);
          return (
            <div key={d.date} className="flex flex-col items-center gap-0.5 group relative">
              {showLabel && <span className="text-[9px] text-[#9CA3AF] mb-1">{d.month}</span>}
              <div
                className={`w-full aspect-square rounded-[3px] ${getIntensity(d.amount)} cursor-pointer transition-transform hover:scale-125`}
                title={`${d.date}: ${d.amount > 0 ? formatCurrency(d.amount) : 'No activity'}`}
              />
              <span className="text-[8px] text-[#9CA3AF]">{d.day}</span>
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#111827] text-white text-[10px] px-2 py-1 rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                {d.date}: {d.amount > 0 ? formatCurrency(d.amount) : 'No activity'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
