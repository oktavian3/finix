"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  Flame,
  LockKeyhole,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
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

const insightTiles = [
  {
    title: "Portfolio Overview",
    description: "Review income, expenses, and net balance from your own records.",
  },
  {
    title: "Smart Spending View",
    description: "Understand categories and activity patterns as you add transactions.",
  },
  {
    title: "Walrus Sync",
    description: "Keep your Finix data ready for the configured Walrus storage flow.",
  },
];

export default function DashboardPage() {
  const { data, currentSummary, allSummaries, currentMonth } = useFinixData();
  const { isConnected, connect, isConnecting, address } = useWallet();
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const router = useRouter();
  const displayData = data;
  const displaySummary = currentSummary;
  const displaySummaries = allSummaries;

  const monthLabel = getMonthLabel(currentMonth);
  const prevMonth = displaySummaries.length >= 2 ? displaySummaries[displaySummaries.length - 2] : null;
  const prevIncome = prevMonth?.totalIncome || 1;
  const prevExpense = prevMonth?.totalExpense || 1;
  const prevRate = prevMonth?.savingRate || 0;

  const incomeChange = prevMonth ? Math.round(((displaySummary.totalIncome - prevIncome) / prevIncome) * 100) : 0;
  const expenseChange = prevMonth ? Math.round(((displaySummary.totalExpense - prevExpense) / prevExpense) * 100) : 0;
  const rateChange = prevMonth ? displaySummary.savingRate - prevRate : 0;

  const handleWalletAction = async () => {
    setWalletError(null);
    if (isConnected) {
      router.push("/transactions");
      return;
    }

    try {
      await connect();
    } catch (err: unknown) {
      setWalletError(err instanceof Error ? err.message : "Failed to connect wallet");
    }
  };

  if (!isConnected) {
    return (
      <AppShell
        title="Finix Dashboard"
        subtitle="Connect your wallet to start building your financial workspace"
        topbarExtra={
          <Button size="sm" onClick={handleWalletAction} loading={isConnecting} className="rounded-full bg-[#050505] px-4 hover:bg-[#111827]">
            <Wallet size={13} />
            Connect Wallet
          </Button>
        }
      >
        {walletError && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {walletError}
          </div>
        )}
        <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-[#0B1020] p-8 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.85)]">
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-[#4F6EF7]/30 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
              <LockKeyhole size={14} />
              Wallet required for private app data
            </div>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              Start with a clean workspace.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
              Finix does not pre-fill fake balances or transactions. Connect your Sui wallet, add your first record, and the dashboard will grow from your own data.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={handleWalletAction}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#111827] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Wallet size={16} />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
              <button
                onClick={() => router.push("/transactions")}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-bold text-white/80 hover:-translate-y-0.5 hover:bg-white/15"
              >
                View app flow
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {[
            ["Add transactions", "Log income and expenses after connecting your wallet."],
            ["Track goals", "Create savings targets and update progress from your real records."],
            ["Sync to Walrus", "Store your app data with the configured Walrus storage flow."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)]">
              <p className="text-sm font-black text-[#111827]">{title}</p>
              <p className="mt-2 text-sm leading-6 text-[#64748B]">{desc}</p>
            </div>
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Good morning, ${displayData.profile.displayName}`}
      subtitle={`${monthLabel} - Wallet finance workspace`}
      topbarExtra={
        <div className="flex w-full flex-wrap items-center justify-end gap-2 lg:flex-nowrap">
          <div className="hidden min-w-[240px] items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#94A3B8] shadow-sm xl:flex">
            <Search size={15} />
            <span>Search insights...</span>
            <span className="ml-auto rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-bold text-[#64748B]">K</span>
          </div>
          <button
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#64748B] shadow-sm hover:-translate-y-0.5 hover:border-[#C7D2FE] hover:text-[#111827] md:flex"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>
          <div className="flex items-center gap-1.5 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-3 py-2">
            <Flame size={14} className="text-[#C2410C]" />
            <span className="text-xs font-bold text-[#C2410C]">{displayData.streaks.currentStreak} day streak</span>
          </div>
          <Button size="sm" onClick={handleWalletAction} loading={isConnecting} className="rounded-full bg-[#050505] px-4 hover:bg-[#111827]">
            <Plus size={13} />
            Add Transaction
          </Button>
          <div className="hidden items-center gap-1.5 rounded-full border border-[#C5D0FF] bg-[#EEF2FF] px-3 py-2 md:flex">
            <Wallet size={14} className="text-[#3B5BDB]" />
            <span className="text-xs font-bold text-[#374151]">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
        </div>
      }
    >
      {walletError && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {walletError}
        </div>
      )}

      <div className="mb-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[#0B1020] p-6 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.85)]">
          <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-[#4F6EF7]/35 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-[#8FE5C0]/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
                <Sparkles size={14} />
                Wallet workspace
              </div>
              <h2 className="max-w-[680px] text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Financial Command Center
              </h2>
              <p className="mt-4 max-w-[620px] text-sm leading-7 text-white/65 sm:text-base">
                Review your income, expenses, savings goals, and Walrus sync status from your own Finix records.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleWalletAction}
                  disabled={isConnecting}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#111827] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={16} />
                  {isConnecting ? "Connecting..." : "Add Transaction"}
                </button>
                <button
                  onClick={() => router.push("/transactions")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-bold text-white/80 hover:-translate-y-0.5 hover:bg-white/15"
                >
                  View records
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Net balance</p>
                  <p className="mt-2 text-3xl font-black">{formatCurrency(displaySummary.netBalance)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#111827] shadow-lg">
                  <ArrowUpRight size={22} />
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

        <section className="rounded-[28px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94A3B8]">Access status</p>
              <h3 className="mt-2 text-xl font-black text-[#111827]">Wallet connected</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#EAFBF6] text-[#111827]">
              <ShieldCheck size={22} />
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-[#64748B]">
            Your wallet-specific workspace is active. Transaction actions and user data are available for this connected address.
          </p>
          <div className="mt-5 grid gap-3">
            {insightTiles.map((tile) => (
              <div key={tile.title} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C7D2FE] hover:bg-white">
                <p className="text-sm font-black text-[#111827]">{tile.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#64748B]">{tile.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Income"
          value={displaySummary.totalIncome}
          type="income"
          vsLastMonth={incomeChange}
          active={expandedMetric === "income"}
          onClick={() => setExpandedMetric(expandedMetric === "income" ? null : "income")}
        />
        <MetricCard
          label="Total Expenses"
          value={displaySummary.totalExpense}
          type="expense"
          vsLastMonth={expenseChange}
          active={expandedMetric === "expense"}
          onClick={() => setExpandedMetric(expandedMetric === "expense" ? null : "expense")}
        />
        <MetricCard
          label="Net Balance"
          value={displaySummary.netBalance}
          type="balance"
          active={expandedMetric === "balance"}
          onClick={() => setExpandedMetric(expandedMetric === "balance" ? null : "balance")}
        />
        <MetricCard
          label="Saving Rate"
          value={displaySummary.savingRate}
          type="rate"
          vsLastMonth={rateChange}
          active={expandedMetric === "rate"}
          onClick={() => setExpandedMetric(expandedMetric === "rate" ? null : "rate")}
        />
      </div>

      {expandedMetric && (
        <div className="mb-5 rounded-[22px] border border-[#C7D2FE] bg-white p-5 shadow-[0_18px_50px_-42px_rgba(59,91,219,0.45)] animate-slide-up">
          <h4 className="mb-3 text-sm font-black text-[#111827]">Detail Breakdown</h4>
          {expandedMetric === "income" && (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(displaySummary.bySource).map(([src, amt]) => (
                <div key={src} className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <span className="text-xs font-bold capitalize text-[#64748B]">{src}</span>
                  <p className="mt-1 text-sm font-black text-[#15803D]">{formatCurrency(amt)}</p>
                </div>
              ))}
            </div>
          )}
          {expandedMetric === "expense" && (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(displaySummary.byCategory).map(([cat, amt]) => (
                <div key={cat} className="rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <span className="text-xs font-bold capitalize text-[#64748B]">{cat}</span>
                  <p className="mt-1 text-sm font-black text-[#B91C1C]">{formatCurrency(amt)}</p>
                </div>
              ))}
            </div>
          )}
          {expandedMetric === "balance" && (
            <p className="text-sm leading-7 text-[#64748B]">
              {displaySummary.netBalance >= 0
                ? `Net positive by ${formatCurrency(displaySummary.netBalance)} this month.`
                : `Net negative by ${formatCurrency(Math.abs(displaySummary.netBalance))} this month.`}
            </p>
          )}
          {expandedMetric === "rate" && (
            <p className="text-sm leading-7 text-[#64748B]">
              Target: {displayData.profile.monthlyTargetSavingRate}%.{" "}
              {displaySummary.savingRate >= displayData.profile.monthlyTargetSavingRate
                ? "Current saving rate is on track."
                : `${displayData.profile.monthlyTargetSavingRate - displaySummary.savingRate}% more needed to reach target.`}
            </p>
          )}
        </div>
      )}

      <div className="mb-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <TrendChart data={displaySummaries} />
        <SavingRateRing savingRate={displaySummary.savingRate} vsLastMonth={rateChange} />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2 2xl:grid-cols-[0.95fr_0.95fr_1.1fr]">
        <CategoryBreakdown
          byCategory={displaySummary.byCategory}
          totalExpense={displaySummary.totalExpense}
          transactions={displayData.transactions.filter((t) => t.type === "expense")}
        />
        <ActivityHeatmap data={displayData.transactions.map((t) => ({ date: t.date, amount: t.amount }))} />
        <div className="grid gap-5 xl:col-span-2 2xl:col-span-1">
          <RecentTransactions transactions={displayData.transactions} />
          <GoalsPreview goals={displayData.goals} />
        </div>
      </div>
    </AppShell>
  );
}
