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
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px]">
      <h3 className="text-[14px] font-semibold text-[#111827] mb-4">Recent Transactions</h3>
      <div className="space-y-2">
        {recent.map(t => (
          <div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-[8px] hover:bg-[#F8FAFC] transition-colors">
            <span className="text-[16px]">{categoryIcons[t.category || t.source || 'other']}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[#111827] truncate">{t.description || (t.type === 'income' ? 'Income' : 'Expense')}</p>
              <p className="text-[10px] text-[#9CA3AF]">{t.date}</p>
            </div>
            <div className={`flex items-center gap-1 text-[12px] font-semibold ${t.type === 'income' ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
              {t.type === 'income' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {formatCurrency(t.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
