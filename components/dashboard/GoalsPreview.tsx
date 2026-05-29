"use client";

import Link from 'next/link';
import { formatCurrency } from '@/lib/analytics';
import type { Goal } from '@/types/finix';

interface GoalsPreviewProps {
  goals: Goal[];
}

export function GoalsPreview({ goals }: GoalsPreviewProps) {
  const active = goals.filter(g => !g.completedAt).slice(0, 3);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-[#111827]">Goals</h3>
        <Link href="/goals" className="text-[11px] text-[#3B5BDB] font-medium hover:underline">View all</Link>
      </div>
      <div className="space-y-3">
        {active.map(g => {
          const progress = g.targetAmount > 0 ? Math.min((g.savedAmount / g.targetAmount) * 100, 100) : 0;
          return (
            <div key={g.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span>{g.emoji}</span>
                  <span className="text-[12px] font-medium text-[#111827]">{g.name}</span>
                </div>
                <span className="text-[11px] text-[#6B7280]">{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#EEF2FF]">
                <div className="h-2 rounded-full bg-gradient-to-r from-[#3B5BDB] to-[#4F6EF7]" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[10px] text-[#9CA3AF] mt-0.5">{formatCurrency(g.savedAmount)} of {formatCurrency(g.targetAmount)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
