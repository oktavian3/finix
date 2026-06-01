"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal";
import { useFinixData } from "@/hooks/useFinixData";
import { useWallet } from "@/hooks/useWallet";
import { formatCurrency } from '@/lib/analytics';
import { Button } from "@/components/ui/Button";
import {
  Wallet,
  Plus,
  Search,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Film,
  HeartPulse,
  BookOpen,
  ReceiptText,
  Banknote,
  BriefcaseBusiness,
  CircleDollarSign,
  Repeat,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import type { Transaction } from "@/types/finix";

const transactionIcons: Record<string, LucideIcon> = {
  food: Utensils,
  transport: Car,
  fashion: ShoppingBag,
  bills: Zap,
  entertainment: Film,
  health: HeartPulse,
  education: BookOpen,
  other: ReceiptText,
  salary: Banknote,
  freelance: BriefcaseBusiness,
  yield: CircleDollarSign,
  airdrop: CircleDollarSign,
  transfer: Repeat,
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

  const flatTxs = useMemo(
    () => filteredTxs.flatMap((group) => group.transactions),
    [filteredTxs]
  );

  const handleDelete = (id: string) => {
    const updated = { ...data, transactions: data.transactions.filter(t => t.id !== id) };
    updateData(updated);
    showToast('success', 'Transaction deleted');
  };

  if (!isConnected) {
    return (
      <AppShell title="Transactions">
        <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-[#0B1020] p-8 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.85)]">
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-[#4F6EF7]/30 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
              <Wallet size={14} />
              Wallet records
            </div>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">Your transaction ledger starts clean.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">Connect your Sui wallet to add income and expenses, then sync your Finix records to Walrus testnet.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={connect}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#111827] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Wallet size={16} /> Connect Wallet
              </button>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Transactions"
      topbarExtra={
        <div className="flex w-full flex-wrap items-center justify-end gap-2 lg:flex-nowrap">
          <div className="hidden min-w-[240px] items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#94A3B8] shadow-sm xl:flex">
            <Search size={15} />
            <span>Search records...</span>
          </div>
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="rounded-full bg-[#050505] px-4 hover:bg-[#111827]">
            <Plus size={13} /> Add Transaction
          </Button>
          <div className="hidden items-center gap-1.5 rounded-full border border-[#C5D0FF] bg-[#EEF2FF] px-3 py-2 md:flex">
            <Wallet size={14} className="text-[#3B5BDB]" />
            <span className="text-xs font-bold text-[#374151]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
        </div>
      }
    >
      <section className="relative mb-5 overflow-hidden rounded-[28px] border border-white/70 bg-[#0B1020] p-6 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.85)]">
        <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-[#4F6EF7]/35 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-[#8FE5C0]/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
              <Sparkles size={14} />
              Wallet ledger
            </div>
            <h2 className="max-w-[680px] text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">Transaction Command Center</h2>
            <p className="mt-4 max-w-[620px] text-sm leading-7 text-white/65 sm:text-base">Record income, expenses, and spending context from your own wallet workspace.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#111827] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F8FAFC]"
              >
                <Plus size={16} /> Add Transaction
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-bold text-white/80 hover:-translate-y-0.5 hover:bg-white/15">
                {filteredTxs.length} active groups
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Records</p>
                <p className="mt-2 text-3xl font-black">{data.transactions.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#111827] shadow-lg">
                <ReceiptText size={22} />
              </div>
            </div>
            <div className="mt-6 flex h-28 items-end gap-2">
              {[44, 62, 48, 72, 58, 84, 76].map((height, index) => (
                <div key={height + index} className="flex-1 rounded-t-xl bg-gradient-to-t from-[#4F6EF7] to-[#8FE5C0]" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Records', value: data.transactions.length, icon: ReceiptText, tone: 'from-[#EEF2FF] to-white' },
          { label: 'Income items', value: data.transactions.filter((t) => t.type === 'income').length, icon: ArrowUpRight, tone: 'from-[#ECFDF5] to-white' },
          { label: 'Expense items', value: data.transactions.filter((t) => t.type === 'expense').length, icon: ArrowDownRight, tone: 'from-[#FFF7ED] to-white' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`rounded-[22px] border border-white/70 bg-gradient-to-br ${item.tone} p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C7D2FE]`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94A3B8]">{item.label}</p>
                  <p className="mt-2 text-2xl font-black text-[#111827]">{item.value}</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#3B5BDB] shadow-sm">
                  <Icon size={19} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="mb-5 flex flex-col gap-3 rounded-[22px] border border-white/70 bg-white p-3 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)] md:flex-row md:items-center">
        <div className="relative flex-1 md:max-w-[340px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-[10px] bg-white focus:outline-none focus:border-[#3B5BDB]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'income', 'expense'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-all ${
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
          className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-[8px] bg-white focus:outline-none focus:border-[#3B5BDB]"
        />
      </div>

      <section className="overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_18px_55px_-48px_rgba(15,23,42,0.75)]">
        <div className="flex flex-col gap-3 border-b border-[#E2E8F0] px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-black text-[#111827]">Recent Transactions</h3>
            <p className="mt-1 text-xs font-medium text-[#94A3B8]">Showing {flatTxs.length} records for the selected period</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-bold text-[#475569] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C7D2FE]">
              Data Views
              <ChevronRight size={13} />
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-bold text-[#475569] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C7D2FE]">
              <SlidersHorizontal size={13} />
              Filters
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-bold text-[#475569] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C7D2FE]">
              <Download size={13} />
              Export All
            </button>
          </div>
        </div>

        {flatTxs.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[880px] border-collapse text-left">
                <thead className="bg-[#F8FAFC]">
                  <tr className="border-b border-[#E2E8F0] text-[11px] font-black uppercase tracking-[0.12em] text-[#94A3B8]">
                    <th className="w-10 px-4 py-3"><input type="checkbox" className="h-4 w-4 rounded border-[#CBD5E1]" readOnly /></th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Record</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Storage</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {flatTxs.map((t) => {
                    const Icon = transactionIcons[t.category || t.source || 'other'] || ReceiptText;
                    const isIncome = t.type === 'income';
                    return (
                      <tr key={t.id} className="group border-b border-[#E2E8F0] text-xs transition-colors duration-200 last:border-b-0 hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3"><input type="checkbox" className="h-4 w-4 rounded border-[#CBD5E1]" readOnly /></td>
                        <td className="whitespace-nowrap px-4 py-3 font-bold text-[#475569]">{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${isIncome ? 'bg-[#ECFDF5] text-[#15803D]' : 'bg-[#EEF2FF] text-[#3B5BDB]'}`}>
                              <Icon size={15} />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-black text-[#111827]">{t.description || (t.category || t.source || 'Untitled record')}</p>
                              <p className="mt-0.5 capitalize text-[#94A3B8]">{t.category || t.source || 'other'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${isIncome ? 'bg-[#D1FAE5] text-[#047857]' : 'bg-[#FFEDD5] text-[#C2410C]'}`}>
                            {isIncome ? 'Income' : 'Expense'}
                          </span>
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 text-right font-black ${isIncome ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-bold text-[#475569]">{address?.slice(0, 6)}...{address?.slice(-4)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 font-bold text-[#475569]">
                            <Wallet size={12} />
                            Sui wallet
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-[#EEF2FF] px-2.5 py-1 font-black text-[#3B5BDB]">Walrus</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDelete(t.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F8FAFC] text-[#94A3B8] transition-all duration-200 hover:bg-[#FEF2F2] hover:text-[#B91C1C]">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-[#E2E8F0] lg:hidden">
              {flatTxs.map((t) => {
                const Icon = transactionIcons[t.category || t.source || 'other'] || ReceiptText;
                const isIncome = t.type === 'income';
                return (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isIncome ? 'bg-[#ECFDF5] text-[#15803D]' : 'bg-[#EEF2FF] text-[#3B5BDB]'}`}>
                      <Icon size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-[#111827]">{t.description || (t.category || t.source || 'Untitled record')}</p>
                      <p className="mt-1 text-xs capitalize text-[#94A3B8]">{t.date} - {t.category || t.source || 'other'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${isIncome ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>{isIncome ? '+' : '-'}{formatCurrency(t.amount)}</p>
                      <button onClick={() => handleDelete(t.id)} className="mt-1 text-xs font-bold text-[#94A3B8] hover:text-[#B91C1C]">Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 border-t border-[#E2E8F0] px-4 py-3 text-xs font-bold text-[#64748B] md:flex-row md:items-center md:justify-between">
              <span>Showing 1-{flatTxs.length} of {flatTxs.length} records</span>
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <span className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-[#111827]">10</span>
                <button className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-[#475569]">Previous</button>
                <button className="rounded-xl bg-[#EEF2FF] px-3 py-1.5 text-[#3B5BDB]">1</button>
                <button className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-[#475569]">Next</button>
              </div>
            </div>
          </>
        ) : (
          <div className="px-6 py-16 text-center">
            <ShieldCheck size={38} className="mx-auto mb-4 text-[#3B5BDB]" />
            <h3 className="text-lg font-black text-[#111827]">No records yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#64748B]">Add your first income or expense record to start building the dashboard from real data.</p>
            <Button onClick={() => setIsModalOpen(true)} className="mt-5"><Plus size={14} /> Add Transaction</Button>
          </div>
        )}
      </section>

      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AppShell>
  );
}
