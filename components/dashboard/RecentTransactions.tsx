"use client";

import { formatCurrency } from "@/lib/analytics";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  Car,
  CircleDollarSign,
  Film,
  HeartPulse,
  ReceiptText,
  Repeat,
  ShoppingBag,
  Utensils,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Transaction } from "@/types/finix";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

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

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5);

  return (
    <div className="rounded-[26px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C7D2FE]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94A3B8]">Records</p>
          <h3 className="mt-1 text-lg font-black text-[#111827]">Recent Transactions</h3>
        </div>
        <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-xs font-bold text-[#64748B]">{transactions.length}</span>
      </div>

      {recent.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-sm leading-6 text-[#64748B]">
          No transactions yet. Connect your wallet and add your first record when you are ready.
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((t) => {
            const Icon = transactionIcons[t.category || t.source || "other"] || ReceiptText;
            const isIncome = t.type === "income";
            return (
              <div
                key={t.id}
                className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E2E8F0] hover:bg-[#F8FAFC]"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isIncome ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#EEF2FF] text-[#3B5BDB]"}`}>
                  <Icon size={17} strokeWidth={1.9} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#111827] transition-colors duration-200 group-hover:text-[#3B5BDB]">
                    {t.description || (isIncome ? "Income" : "Expense")}
                  </p>
                  <p className="text-xs font-medium text-[#94A3B8]">{t.date}</p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-black ${isIncome ? "text-[#047857]" : "text-[#B91C1C]"}`}>
                  {isIncome ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                  {formatCurrency(t.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
