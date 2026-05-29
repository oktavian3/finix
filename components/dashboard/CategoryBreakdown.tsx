"use client";

import { useState } from 'react';
import { formatCurrency } from '@/lib/analytics';
import { ChevronDown, ChevronRight, Utensils, Car, ShoppingBag, Zap, Film, Heart, BookOpen, MoreHorizontal } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import type { Transaction } from '@/types/finix';

const categoryConfig: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  food: { label: 'Food & Drinks', icon: Utensils, color: '#F59E0B' },
  transport: { label: 'Transport', icon: Car, color: '#3B82F6' },
  fashion: { label: 'Fashion', icon: ShoppingBag, color: '#EC4899' },
  bills: { label: 'Bills & Utilities', icon: Zap, color: '#8B5CF6' },
  entertainment: { label: 'Entertainment', icon: Film, color: '#F97316' },
  health: { label: 'Health', icon: Heart, color: '#EF4444' },
  education: { label: 'Education', icon: BookOpen, color: '#10B981' },
  other: { label: 'Other', icon: MoreHorizontal, color: '#6B7280' },
};

interface CategoryBreakdownProps {
  byCategory: Record<string, number>;
  totalExpense: number;
  transactions?: Transaction[];
}

export function CategoryBreakdown({ byCategory, totalExpense, transactions = [] }: CategoryBreakdownProps) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const sorted = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="bg-[#111827] border border-[#1E293B] p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-mono text-[#3B5BDB]">/CAT</span>
        <h3 className="text-[12px] font-mono font-semibold text-white uppercase tracking-wider">Spending by Category</h3>
      </div>
      <div className="space-y-1.5">
        {sorted.map(([cat, amount]) => {
          const config = categoryConfig[cat] || categoryConfig.other;
          const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
          const isExpanded = expandedCat === cat;
          const Icon = config.icon;
          const catTransactions = transactions.filter(t => t.category === cat);

          return (
            <div key={cat}>
              <div
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#1E293B]/50 cursor-pointer transition-colors"
                onClick={() => setExpandedCat(isExpanded ? null : cat)}
              >
                <Icon size={12} color={config.color} />
                <span className="flex-1 text-[11px] font-mono text-[#9CA3AF]">{config.label}</span>
                <span className="text-[11px] font-mono font-semibold text-white">{formatCurrency(amount)}</span>
                <span className="text-[10px] font-mono text-[#6B7280] w-[36px] text-right">{percentage.toFixed(0)}%</span>
                <div className="w-[50px] h-1 bg-[#1E293B]">
                  <div className="h-1" style={{ width: `${percentage}%`, backgroundColor: config.color }} />
                </div>
                {isExpanded ? <ChevronDown size={12} className="text-[#6B7280]" /> : <ChevronRight size={12} className="text-[#6B7280]" />}
              </div>
              {isExpanded && catTransactions.length > 0 && (
                <div className="ml-7 pl-2 border-l border-[#1E293B] space-y-0.5 pb-1">
                  {catTransactions.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center justify-between py-0.5">
                      <span className="text-[10px] font-mono text-[#6B7280]">{t.description || '—'}</span>
                      <span className="text-[10px] font-mono font-medium text-[#B91C1C]">{formatCurrency(t.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
