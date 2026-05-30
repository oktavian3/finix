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

  // Get current month name
  const monthLabel = getMonthLabel(currentMonth);

  if (!isConnected) {
    return (
      <AppShell title="Dashboard" subtitle={`${monthLabel} · Connect wallet to start`}>
        <div className="flex flex-col items-center justify-center py-24">
          <Wallet size={48} className="text-[#C5D0FF] mb-4" />
          <h2 className="text-[18px] font-semibold text-[#111827] mb-2">Connect your Sui wallet</h2>
          <p className="text-[13px] text-[#6B7280] mb-6">Connect your wallet to track your finances on-chain</p>
          <Button size="lg" onClick={connect} loading={isConnecting}><Wallet size={16} /> Connect Wallet</Button>
        </div>
      </AppShell>
    );
  }

  // For the vsLastMonth comparison
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
      subtitle={`${monthLabel} · Data stored on Walrus`}
      topbarExtra={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF7ED] border border-[#FED7AA]">
            <Flame size={12} className="text-[#C2410C]" />
            <span className="text-[11px] font-semibold text-[#C2410C]">{data.streaks.currentStreak} day streak</span>
          </div>
          <Link href="/transactions">
            <Button size="sm">
              <Plus size={13} />
              Add Transaction
            </Button>
          </Link>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-[#EEF2FF] border border-[#C5D0FF]">
            <Wallet size={12} className="text-[#3B5BDB]" />
            <span className="text-[11px] font-medium text-[#374151]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
        </div>
      }
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <MetricCard
          label="Total Income"
          value={currentSummary.totalIncome}
          type="income"
          vsLastMonth={incomeChange}
          onClick={() => setExpandedMetric(expandedMetric === 'income' ? null : 'income')}
        />
        <MetricCard
          label="Total Expenses"
          value={currentSummary.totalExpense}
          type="expense"
          vsLastMonth={expenseChange}
          onClick={() => setExpandedMetric(expandedMetric === 'expense' ? null : 'expense')}
        />
        <MetricCard
          label="Net Balance"
          value={currentSummary.netBalance}
          type="balance"
          onClick={() => setExpandedMetric(expandedMetric === 'balance' ? null : 'balance')}
        />
        <MetricCard
          label="Saving Rate"
          value={currentSummary.savingRate}
          type="rate"
          vsLastMonth={rateChange}
          onClick={() => setExpandedMetric(expandedMetric === 'rate' ? null : 'rate')}
        />
      </div>

      {/* Expanded metric detail */}
      {expandedMetric && (
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px] mb-5">
          <h4 className="text-[13px] font-semibold text-[#111827] mb-2">Detail Breakdown</h4>
          {expandedMetric === 'income' && (
            <div className="space-y-1">
              {Object.entries(currentSummary.bySource).map(([src, amt]) => (
                <div key={src} className="flex items-center justify-between text-[12px]">
                  <span className="text-[#374151] capitalize">{src}</span>
                  <span className="text-[#15803D] font-medium">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          )}
          {expandedMetric === 'expense' && (
            <div className="space-y-1">
              {Object.entries(currentSummary.byCategory).map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between text-[12px]">
                  <span className="text-[#374151] capitalize">{cat}</span>
                  <span className="text-[#B91C1C] font-medium">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          )}
          {expandedMetric === 'balance' && (
            <p className="text-[12px] text-[#6B7280]">
              {currentSummary.netBalance >= 0
                ? `You're in the green! Net positive of ${formatCurrency(currentSummary.netBalance)} this month.`
                : `You're spending more than earning. Net negative of ${formatCurrency(Math.abs(currentSummary.netBalance))}.`}
            </p>
          )}
          {expandedMetric === 'rate' && (
            <p className="text-[12px] text-[#6B7280]">
              Target: {data.profile.monthlyTargetSavingRate}% · {currentSummary.savingRate >= data.profile.monthlyTargetSavingRate ? 'On track! 🎉' : `${data.profile.monthlyTargetSavingRate - currentSummary.savingRate}% more to reach target`}
            </p>
          )}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <TrendChart data={allSummaries} />
        <SavingRateRing savingRate={currentSummary.savingRate} vsLastMonth={rateChange} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-5 mb-5">
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
        <div className="col-span-1 space-y-5">
          <RecentTransactions transactions={data.transactions} />
          <GoalsPreview goals={data.goals} />
        </div>
      </div>
    </AppShell>
  );
}
