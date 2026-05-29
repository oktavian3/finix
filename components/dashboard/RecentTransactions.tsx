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
    <div className="bg-[#111827] border border-[#1E293B] p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-mono text-[#3B5BDB]">/TX</span>
        <h3 className="text-[12px] font-mono font-semibold text-white uppercase tracking-wider">Recent Transactions</h3>
      </div>
      <div className="space-y-1">
        {recent.map(t => (
          <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#1E293B]/50 transition-colors border-b border-[#1E293B]/50 last:border-b-0">
            <span className="text-[14px]">{categoryIcons[t.category || t.source || 'other']}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-mono font-medium text-white truncate">{t.description || (t.type === 'income' ? 'Income' : 'Expense')}</p>
              <p className="text-[9px] font-mono text-[#6B7280]">{t.date}</p>
            </div>
            <div className={`flex items-center gap-0.5 text-[11px] font-mono font-semibold ${t.type === 'income' ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
              {t.type === 'income' ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {formatCurrency(t.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
