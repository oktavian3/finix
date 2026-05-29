"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { SavingRateRing } from "@/components/dashboard/SavingRateRing";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { GoalsPreview } from "@/components/dashboard/GoalsPreview";
import { useFinixData } from "@/hooks/useFinixData";
import { useWallet } from "@/hooks/useWallet";
import { formatCurrency, getMonthLabel } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { Plus, Wallet, Flame } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data, currentSummary, allSummaries, currentMonth } = useFinixData();
  const { isConnected, connect, isConnecting, address } = useWallet();
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const monthLabel = getMonthLabel(currentMonth);

  if (!isConnected) {
    return (
      <AppShell title="Dashboard" subtitle={`${monthLabel} // CONNECT_WALLET_TO_START`}>
        <div className="flex flex-col items-center justify-center py-24">
          <Wallet size={48} className="text-[#1E293B] mb-4" />
          <h2 className="text-[16px] font-semibold text-white font-mono mb-2">CONNECT YOUR WALLET</h2>
          <p className="text-[12px] font-mono text-[#6B7280] mb-6">Connect your Sui wallet to track finances on-chain</p>
          <Button size="lg" onClick={connect} loading={isConnecting}>
            <Wallet size={15} />
            CONNECT WALLET
          </Button>
        </div>
      </AppShell>
    );
  }

  const prevMonth = allSummaries.length >= 2 ? allSummaries[allSummaries.length - 2] : null;
  const prevIncome = prevMonth?.totalIncome || 1;
  const prevExpense = prevMonth?.totalExpense || 1;
  const prevRate = prevMonth?.savingRate || 0;

  const incomeChange = prevMonth ? Math.round(((currentSummary.totalIncome - prevIncome) / prevIncome) * 100) : 0;
  const expenseChange = prevMonth ? Math.round(((currentSummary.totalExpense - prevExpense) / prevExpense) * 100) : 0;
  const rateChange = prevMonth ? currentSummary.savingRate - prevRate : 0;

  return (
    <AppShell
      title="Dashboard"
      subtitle={`${monthLabel} // DATA_STORED_ON_WALRUS`}
      topbarExtra={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#111827] border border-[#1E293B]">
            <Flame size={11} className="text-[#C2410C]" />
            <span className="text-[10px] font-mono text-[#C2410C]">{data.streaks.currentStreak}D_STREAK</span>
          </div>
          <Link href="/transactions">
            <Button size="sm">
              <Plus size={12} />
              ADD TX
            </Button>
          </Link>
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#111827] border border-[#1E293B]">
            <span className="flex h-[5px] w-[5px] items-center justify-center rounded-full bg-[#15803D] animate-pulse" />
            <span className="text-[10px] font-mono text-[#9CA3AF]">NODE: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
        </div>
      }
    >
      {/* Section /01 — Metrics */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono text-[#3B5BDB]">/01</span>
          <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">METRICS</span>
          <div className="flex-1 h-px bg-[#1E293B]" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          <MetricCard
            label="TOTAL_INCOME"
            value={currentSummary.totalIncome}
            type="income"
            vsLastMonth={incomeChange}
            onClick={() => setExpandedMetric(expandedMetric === 'income' ? null : 'income')}
          />
          <MetricCard
            label="TOTAL_EXPENSES"
            value={currentSummary.totalExpense}
            type="expense"
            vsLastMonth={expenseChange}
            onClick={() => setExpandedMetric(expandedMetric === 'expense' ? null : 'expense')}
          />
          <MetricCard
            label="NET_BALANCE"
            value={currentSummary.netBalance}
            type="balance"
            onClick={() => setExpandedMetric(expandedMetric === 'balance' ? null : 'balance')}
          />
          <MetricCard
            label="SAVING_RATE"
            value={currentSummary.savingRate}
            type="rate"
            vsLastMonth={rateChange}
            onClick={() => setExpandedMetric(expandedMetric === 'rate' ? null : 'rate')}
          />
        </div>
      </div>

      {/* Expanded metric detail */}
      {expandedMetric && (
        <div className="bg-[#111827] border border-[#1E293B] p-4 mb-5 border-l-2 border-l-[#3B5BDB]">
          <h4 className="text-[11px] font-mono font-semibold text-[#3B5BDB] mb-2 uppercase tracking-wider">{`// DETAIL_BREAKDOWN`}</h4>
          {expandedMetric === 'income' && (
            <div className="space-y-1">
              {Object.entries(currentSummary.bySource).map(([src, amt]) => (
                <div key={src} className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#9CA3AF] uppercase">{src}</span>
                  <span className="text-[#15803D] font-semibold">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          )}
          {expandedMetric === 'expense' && (
            <div className="space-y-1">
              {Object.entries(currentSummary.byCategory).map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#9CA3AF] uppercase">{cat}</span>
                  <span className="text-[#B91C1C] font-semibold">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          )}
          {expandedMetric === 'balance' && (
            <p className="text-[11px] font-mono text-[#9CA3AF]">
              {currentSummary.netBalance >= 0
                ? `NET_POSITIVE: ${formatCurrency(currentSummary.netBalance)} // THIS_MONTH`
                : `NET_NEGATIVE: ${formatCurrency(Math.abs(currentSummary.netBalance))} // WARNING`}
            </p>
          )}
          {expandedMetric === 'rate' && (
            <p className="text-[11px] font-mono text-[#9CA3AF]">
              TARGET: {data.profile.monthlyTargetSavingRate}% // {currentSummary.savingRate >= data.profile.monthlyTargetSavingRate ? 'ON_TRACK' : `${data.profile.monthlyTargetSavingRate - currentSummary.savingRate}%_REMAINING`}
            </p>
          )}
        </div>
      )}

      {/* Section /02 — Trends */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono text-[#3B5BDB]">/02</span>
          <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">TRENDS</span>
          <div className="flex-1 h-px bg-[#1E293B]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TrendChart data={allSummaries} />
          <SavingRateRing savingRate={currentSummary.savingRate} vsLastMonth={rateChange} />
        </div>
      </div>

      {/* Section /03 — Details */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono text-[#3B5BDB]">/03</span>
          <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">DETAILS</span>
          <div className="flex-1 h-px bg-[#1E293B]" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <CategoryBreakdown
              byCategory={currentSummary.byCategory}
              totalExpense={currentSummary.totalExpense}
              transactions={data.transactions.filter(t => t.type === 'expense')}
            />
          </div>
          <div className="col-span-1">
            <ActivityHeatmap
              data={data.transactions.map(t => ({ date: t.date, amount: t.amount }))}
            />
          </div>
          <div className="col-span-1 space-y-3">
            <RecentTransactions transactions={data.transactions} />
            <GoalsPreview goals={data.goals} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
