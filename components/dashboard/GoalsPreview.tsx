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
    <div className="bg-[#111827] border border-[#1E293B] p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#3B5BDB]">/GOALS</span>
          <h3 className="text-[12px] font-mono font-semibold text-white uppercase tracking-wider">Goals</h3>
        </div>
        <Link href="/goals" className="text-[10px] font-mono text-[#3B5BDB] hover:text-[#4F6EF7] transition-colors">VIEW_ALL</Link>
      </div>
      <div className="space-y-3">
        {active.map(g => {
          const progress = g.targetAmount > 0 ? Math.min((g.savedAmount / g.targetAmount) * 100, 100) : 0;
          return (
            <div key={g.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span>{g.emoji}</span>
                  <span className="text-[11px] font-mono text-white">{g.name}</span>
                </div>
                <span className="text-[10px] font-mono text-[#6B7280]">{progress.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-[#1E293B]">
                <div className="h-1.5 bg-[#3B5BDB]" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[9px] font-mono text-[#6B7280] mt-0.5">{formatCurrency(g.savedAmount)} / {formatCurrency(g.targetAmount)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
