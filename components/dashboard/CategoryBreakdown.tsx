"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/analytics";
import { BookOpen, Car, ChevronDown, ChevronRight, Film, Heart, MoreHorizontal, ShoppingBag, Utensils, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Transaction } from "@/types/finix";

const categoryConfig: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  food: { label: "Food & Drinks", icon: Utensils, color: "#F59E0B" },
  transport: { label: "Transport", icon: Car, color: "#3B82F6" },
  fashion: { label: "Fashion", icon: ShoppingBag, color: "#EC4899" },
  bills: { label: "Bills & Utilities", icon: Zap, color: "#8B5CF6" },
  entertainment: { label: "Entertainment", icon: Film, color: "#F97316" },
  health: { label: "Health", icon: Heart, color: "#EF4444" },
  education: { label: "Education", icon: BookOpen, color: "#10B981" },
  other: { label: "Other", icon: MoreHorizontal, color: "#6B7280" },
};

interface CategoryBreakdownProps {
  byCategory: Record<string, number>;
  totalExpense: number;
  transactions?: Transaction[];
}

export function CategoryBreakdown({ byCategory, totalExpense, transactions = [] }: CategoryBreakdownProps) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const sorted = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

  return (
    <div className="rounded-[26px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C7D2FE]">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94A3B8]">Spend Map</p>
        <h3 className="mt-1 text-lg font-black text-[#111827]">Spending by Category</h3>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-sm leading-6 text-[#64748B]">
          No spending categories yet. New expense records will appear here.
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(([cat, amount]) => {
            const config = categoryConfig[cat] || categoryConfig.other;
            const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
            const isExpanded = expandedCat === cat;
            const Icon = config.icon;
            const catTransactions = transactions.filter((t) => t.category === cat);

            return (
              <div key={cat}>
                <button
                  type="button"
                  className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E2E8F0] hover:bg-[#F8FAFC]"
                  onClick={() => setExpandedCat(isExpanded ? null : cat)}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#F8FAFC] transition-transform duration-200 group-hover:scale-105">
                    <Icon size={14} color={config.color} />
                  </div>
                  <span className="min-w-0 flex-1 text-sm font-bold text-[#374151] transition-colors duration-200 group-hover:text-[#111827]">{config.label}</span>
                  <span className="text-xs font-black text-[#111827]">{formatCurrency(amount)}</span>
                  <span className="w-[40px] text-right text-xs font-bold text-[#64748B]">{percentage.toFixed(0)}%</span>
                  <div className="hidden h-1.5 w-[60px] overflow-hidden rounded-full bg-[#EEF2FF] sm:block">
                    <div className="h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${percentage}%`, backgroundColor: config.color }} />
                  </div>
                  <div className="transition-transform duration-200 group-hover:translate-x-0.5">
                    {isExpanded ? <ChevronDown size={14} className="text-[#9CA3AF]" /> : <ChevronRight size={14} className="text-[#9CA3AF]" />}
                  </div>
                </button>
                {isExpanded && catTransactions.length > 0 && (
                  <div className="ml-11 space-y-1 border-l-2 border-[#EEF2FF] pb-1 pl-3 animate-fade-in">
                    {catTransactions.slice(0, 5).map((t) => (
                      <div key={t.id} className="flex items-center justify-between rounded px-2 py-1 transition-colors duration-150 hover:bg-[#F8FAFC]">
                        <span className="text-xs text-[#6B7280]">{t.description || "Unlabeled transaction"}</span>
                        <span className="text-xs font-bold text-[#B91C1C]">{formatCurrency(t.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
