"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal";
import { useFinixData } from "@/hooks/useFinixData";
import { useWallet } from "@/hooks/useWallet";
import { formatCurrency } from '@/lib/analytics';
import { Button } from "@/components/ui/Button";
import { Wallet, Plus, Search, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import type { Transaction } from "@/types/finix";

const categoryEmojis: Record<string, string> = {
  food: '🍔', transport: '🚗', fashion: '👕', bills: '⚡',
  entertainment: '🎬', health: '❤️', education: '📚', other: '📋',
  salary: '💰', freelance: '💻', yield: '📈', airdrop: '🪂', transfer: '🔄',
};

export default function TransactionsPage() {
  const { data, updateData, currentMonth } = useFinixData();
  const { isConnected, connect, isConnecting, address } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const filteredTxs = useMemo(() => {
    let txs = data.transactions.filter(t => t.date.startsWith(selectedMonth));
    
    if (filterType !== 'all') {
      txs = txs.filter(t => t.type === filterType);
    }
    
    if (search) {
      const q = search.toLowerCase();
      txs = txs.filter(t => 
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.source?.toLowerCase().includes(q)
      );
    }

    // Group by date (most recent first)
    const groups: Record<string, Transaction[]> = {};
    txs.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([date, transactions]) => ({
        date,
        dayTotal: transactions.reduce((sum, t) => sum + (t.type === 'expense' ? -t.amount : t.amount), 0),
        transactions,
      }));
  }, [data.transactions, selectedMonth, filterType, search]);

  const handleDelete = (id: string) => {
    const updated = { ...data, transactions: data.transactions.filter(t => t.id !== id) };
    localStorage.setItem('finix_blob_mock', JSON.stringify(updated));
    updateData(updated);
    showToast('success', 'Transaction deleted');
  };

  if (!isConnected) {
    return (
      <AppShell title="Transactions">
        <div className="flex flex-col items-center justify-center py-24">
          <Wallet size={48} className="text-[#C5D0FF] mb-4" />
          <h2 className="text-[18px] font-semibold text-[#111827] mb-2">Connect your wallet</h2>
          <p className="text-[13px] text-[#6B7280] mb-6">Connect to view and manage transactions</p>
          <Button size="lg" onClick={connect} loading={isConnecting}>
            <Wallet size={16} /> Connect Wallet
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Transactions"
      topbarExtra={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-[#EEF2FF] border border-[#C5D0FF]">
            <Wallet size={12} className="text-[#3B5BDB]" />
            <span className="text-[11px] font-medium text-[#374151]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={13} /> Add Transaction
          </Button>
        </div>
      }
    >
      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-[300px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[12px] border border-[#E2E8F0] rounded-[10px] bg-white focus:outline-none focus:border-[#3B5BDB]"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'income', 'expense'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-[8px] transition-all ${
                filterType === t 
                  ? 'bg-[#3B5BDB] text-white' 
                  : 'bg-white border border-[#E2E8F0] text-[#374151] hover:bg-[#F5F7FF]'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-1.5 text-[11px] border border-[#E2E8F0] rounded-[8px] bg-white focus:outline-none focus:border-[#3B5BDB]"
        />
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTxs.map(group => (
          <div key={group.date}>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-semibold text-[#111827]">{group.date}</span>
              <span className={`text-[11px] font-semibold ${group.dayTotal >= 0 ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
                {group.dayTotal >= 0 ? '+' : ''}{formatCurrency(group.dayTotal)}
              </span>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-[12px] overflow-hidden">
              {group.transactions.map(t => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors border-b border-[#E2E8F0] last:border-b-0 group">
                  <span className="text-[18px]">{categoryEmojis[t.category || t.source || 'other']}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#111827] truncate">{t.description || (t.category || t.source || 'Unknown')}</p>
                    <p className="text-[10px] text-[#9CA3AF] capitalize">{t.category || t.source || 'other'}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-[12px] font-semibold ${t.type === 'income' ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
                    {t.type === 'income' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {formatCurrency(t.amount)}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-[6px] text-[#9CA3AF] hover:text-[#B91C1C] hover:bg-[#FEF2F2]">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filteredTxs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[13px] text-[#6B7280]">No transactions found</p>
          </div>
        )}
      </div>

      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AppShell>
  );
}
