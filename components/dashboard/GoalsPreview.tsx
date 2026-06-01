"use client";

import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { formatCurrency } from "@/lib/analytics";
import type { Goal } from "@/types/finix";

interface GoalsPreviewProps {
  goals: Goal[];
}

export function GoalsPreview({ goals }: GoalsPreviewProps) {
  const active = goals.filter((g) => !g.completedAt).slice(0, 3);

  return (
    <div className="rounded-[26px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C7D2FE]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94A3B8]">Targets</p>
          <h3 className="mt-1 text-lg font-black text-[#111827]">Goals</h3>
        </div>
        <Link href="/goals" className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-3 py-1.5 text-xs font-bold text-[#3B5BDB] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#EEF2FF]">
          View all
          <ArrowRight size={13} />
        </Link>
      </div>

      {active.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-sm leading-6 text-[#64748B]">
          No active goals yet. Connect your wallet and create a target to track progress.
        </div>
      ) : (
        <div className="space-y-3">
          {active.map((g) => {
            const progress = g.targetAmount > 0 ? Math.min((g.savedAmount / g.targetAmount) * 100, 100) : 0;
            return (
              <div key={g.id} className="group rounded-2xl border border-transparent p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E2E8F0] hover:bg-[#F8FAFC]">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#3B5BDB] transition-transform duration-200 group-hover:scale-105">
                      <Target size={15} />
                    </div>
                    <span className="truncate text-sm font-bold text-[#111827] transition-colors duration-200 group-hover:text-[#3B5BDB]">{g.name}</span>
                  </div>
                  <span className="text-xs font-black text-[#64748B]">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#EEF2FF]">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#3B5BDB] to-[#22C55E] transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1.5 text-xs font-medium text-[#94A3B8]">
                  {formatCurrency(g.savedAmount)} of {formatCurrency(g.targetAmount)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
