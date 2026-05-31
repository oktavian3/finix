"use client";

import { formatCurrency } from '@/lib/analytics';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Transaction } from '@/types/finix';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const categoryIcons: Record<string, string> = {
  food: '🍔', transport: '🚗', fashion: '👕', bills: '⚡',
  entertainment: '🎬', health: '❤️', education: '📚', other: '📋',
  salary: '💰', freelance: '💻', yield: '📈', airdrop: '🪂', transfer: '🔄',
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px] hover-card">
      <h3 className="text-base font-semibold text-[#111827] mb-4">Recent Transactions</h3>
      <div className="space-y-1">
        {recent.map((t, i) => (
          <div 
            key={t.id} 
            className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] hover:bg-[#F5F7FF] transition-all duration-200 cursor-pointer group"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className="text-md transition-transform duration-200 group-hover:scale-110">{categoryIcons[t.category || t.source || 'other']}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111827] truncate group-hover:text-[#3B5BDB] transition-colors duration-200">{t.description || (t.type === 'income' ? 'Income' : 'Expense')}</p>
              <p className="text-xs text-[#9CA3AF]">{t.date}</p>
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold ${t.type === 'income' ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
              {t.type === 'income' ? <ArrowUpRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /> : <ArrowDownRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />}
              {formatCurrency(t.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
