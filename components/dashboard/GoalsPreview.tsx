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
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px] hover-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[#111827]">Goals</h3>
        <Link href="/goals" className="text-xs text-[#3B5BDB] font-medium hover:underline transition-colors duration-200 hover:text-[#2F4BC0]">View all</Link>
      </div>
      <div className="space-y-3">
        {active.map((g, i) => {
          const progress = g.targetAmount > 0 ? Math.min((g.savedAmount / g.targetAmount) * 100, 100) : 0;
          return (
            <div 
              key={g.id} 
              className="p-2 rounded-[8px] hover:bg-[#F5F7FF] transition-all duration-200 cursor-pointer group"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="transition-transform duration-200 group-hover:scale-110">{g.emoji}</span>
                  <span className="text-xs font-medium text-[#111827] group-hover:text-[#3B5BDB] transition-colors duration-200">{g.name}</span>
                </div>
                <span className="text-xs text-[#6B7280] font-medium">{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#EEF2FF] overflow-hidden">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-[#3B5BDB] to-[#4F6EF7] transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="text-2xs text-[#9CA3AF] mt-0.5">{formatCurrency(g.savedAmount)} of {formatCurrency(g.targetAmount)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
