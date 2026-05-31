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
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px] hover-card">
      <h3 className="text-base font-semibold text-[#111827] mb-4">Spending by Category</h3>
      <div className="space-y-1">
        {sorted.map(([cat, amount]) => {
          const config = categoryConfig[cat] || categoryConfig.other;
          const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
          const isExpanded = expandedCat === cat;
          const Icon = config.icon;
          const catTransactions = transactions.filter(t => t.category === cat);

          return (
            <div key={cat}>
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] hover:bg-[#F5F7FF] cursor-pointer transition-all duration-200 group"
                onClick={() => setExpandedCat(isExpanded ? null : cat)}
              >
                <div className="transition-transform duration-200 group-hover:scale-110">
                  <Icon size={13} color={config.color} />
                </div>
                <span className="flex-1 text-xs font-medium text-[#374151] group-hover:text-[#111827] transition-colors duration-200">{config.label}</span>
                <span className="text-xs font-semibold text-[#111827]">{formatCurrency(amount)}</span>
                <span className="text-xs text-[#6B7280] w-[40px] text-right">{percentage.toFixed(0)}%</span>
                <div className="w-[60px] h-1.5 rounded-full bg-[#EEF2FF] overflow-hidden">
                  <div 
                    className="h-1.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${percentage}%`, backgroundColor: config.color }} 
                  />
                </div>
                <div className="transition-transform duration-200">
                  {isExpanded ? <ChevronDown size={13} className="text-[#9CA3AF]" /> : <ChevronRight size={13} className="text-[#9CA3AF]" />}
                </div>
              </div>
              {isExpanded && catTransactions.length > 0 && (
                <div className="ml-9 pl-3 border-l-2 border-[#EEF2FF] space-y-1 pb-1 animate-fade-in">
                  {catTransactions.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center justify-between py-1 hover:bg-[#F8FAFC] rounded px-2 transition-colors duration-150">
                      <span className="text-xs text-[#6B7280]">{t.description || '—'}</span>
                      <span className="text-xs font-medium text-[#B91C1C]">{formatCurrency(t.amount)}</span>
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
