"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { useFinixData } from "@/hooks/useFinixData";
import { useWallet } from "@/hooks/useWallet";
import { formatCurrency, getMonthLabel } from "@/lib/analytics";
import { BarChart3, ChevronRight, PiggyBank, Sparkles, TrendingDown, TrendingUp, Wallet } from "lucide-react";

const PIE_COLORS = ["#F59E0B", "#3B82F6", "#EC4899", "#8B5CF6", "#F97316", "#EF4444", "#10B981", "#6B7280"];

export default function AnalyticsPage() {
  const { allSummaries, currentSummary } = useFinixData();
  const { isConnected, connect, isConnecting, address } = useWallet();
  const [period, setPeriod] = useState<"1m" | "3m" | "6m">("6m");

  const periodData = useMemo(() => {
    if (period === "6m") return allSummaries;
    if (period === "3m") return allSummaries.slice(-3);
    return allSummaries.slice(-1);
  }, [allSummaries, period]);

  const lastPeriod = periodData.length >= 2 ? periodData[periodData.length - 2] : null;
  const incomeChange = lastPeriod && lastPeriod.totalIncome > 0 ? Math.round(((currentSummary.totalIncome - lastPeriod.totalIncome) / lastPeriod.totalIncome) * 100) : 0;
  const expenseChange = lastPeriod && lastPeriod.totalExpense > 0 ? Math.round(((currentSummary.totalExpense - lastPeriod.totalExpense) / lastPeriod.totalExpense) * 100) : 0;
  const rateChange = lastPeriod ? currentSummary.savingRate - lastPeriod.savingRate : 0;

  const areaData = periodData.map((m) => ({
    month: getMonthLabel(m.month).split(" ")[0],
    Income: m.totalIncome,
    Expenses: m.totalExpense,
  }));
  const categoryData = Object.entries(currentSummary.byCategory).map(([name, value]) => ({ name, value }));
  const rateData = periodData.map((m) => ({ month: getMonthLabel(m.month).split(" ")[0], rate: m.savingRate }));

  if (!isConnected) {
    return (
      <AppShell title="Analytics">
        <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-[#0B1020] p-8 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.85)]">
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-[#4F6EF7]/30 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
              <BarChart3 size={14} />
              Analytics workspace
            </div>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">Insights from your own records.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">Connect your wallet to unlock clean charts, category context, and saving-rate trends.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={connect}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#111827] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Wallet size={16} /> {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Analytics"
      subtitle="Trends and spending signals from your records"
      topbarExtra={
        <div className="flex w-full flex-wrap items-center justify-end gap-2 lg:flex-nowrap">
          <div className="hidden min-w-[240px] items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#94A3B8] shadow-sm xl:flex">
            <BarChart3 size={15} />
            <span>Filter insights...</span>
          </div>
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
              Financial signals
            </div>
            <h2 className="max-w-[680px] text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">Analytics Command Center</h2>
            <p className="mt-4 max-w-[620px] text-sm leading-7 text-white/65 sm:text-base">Compare income, expenses, categories, and saving momentum from your Finix records.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-bold text-white/80 hover:-translate-y-0.5 hover:bg-white/15">
                {period === "1m" ? "This month" : period === "3m" ? "Last 3 months" : "Last 6 months"}
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Saving rate</p>
                <p className="mt-2 text-3xl font-black">{currentSummary.savingRate}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#111827] shadow-lg">
                <BarChart3 size={22} />
              </div>
            </div>
            <div className="mt-6 flex h-28 items-end gap-2">
              {[52, 44, 60, 48, 70, 62, 86].map((height, index) => (
                <div key={height + index} className="flex-1 rounded-t-xl bg-gradient-to-t from-[#4F6EF7] to-[#8FE5C0]" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mb-5 flex flex-wrap gap-2 rounded-[22px] border border-white/70 bg-white p-3 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)]">
        {(["1m", "3m", "6m"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${
              period === p ? "bg-[#111827] text-white shadow-sm" : "border border-[#E2E8F0] bg-white text-[#475569] hover:-translate-y-0.5 hover:border-[#C7D2FE]"
            }`}
          >
            {p === "1m" ? "This Month" : p === "3m" ? "Last 3 Months" : "Last 6 Months"}
          </button>
        ))}
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Income", value: formatCurrency(currentSummary.totalIncome), meta: lastPeriod ? `${incomeChange >= 0 ? "+" : ""}${incomeChange}% vs last period` : "No prior period", icon: TrendingUp, tone: "from-[#ECFDF5] to-white", color: "text-[#15803D]" },
          { label: "Expenses", value: formatCurrency(currentSummary.totalExpense), meta: lastPeriod ? `${expenseChange >= 0 ? "+" : ""}${expenseChange}% vs last period` : "No prior period", icon: TrendingDown, tone: "from-[#FFF7ED] to-white", color: "text-[#B91C1C]" },
          { label: "Net Saved", value: formatCurrency(currentSummary.netBalance), meta: "Current month", icon: PiggyBank, tone: "from-[#EEF2FF] to-white", color: currentSummary.netBalance >= 0 ? "text-[#111827]" : "text-[#B91C1C]" },
          { label: "Saving Rate", value: `${currentSummary.savingRate}%`, meta: lastPeriod ? `${rateChange >= 0 ? "+" : "-"}${Math.abs(rateChange)}%` : "No prior period", icon: BarChart3, tone: "from-[#F8FAFC] to-white", color: "text-[#3B5BDB]" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`rounded-[22px] border border-white/70 bg-gradient-to-br ${card.tone} p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C7D2FE]`}>
              <Icon size={18} className={`mb-3 ${card.color}`} />
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94A3B8]">{card.label}</p>
              <p className={`mt-2 text-xl font-black ${card.color}`}>{card.value}</p>
              <p className="mt-1 text-xs font-medium text-[#64748B]">{card.meta}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-5 rounded-[24px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-48px_rgba(15,23,42,0.75)]">
        <h3 className="mb-4 text-base font-black text-[#111827]">Income vs Expense</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 14, border: "1px solid #E2E8F0" }} />
              <Area type="monotone" dataKey="Income" stroke="#4F6EF7" fill="#EEF2FF" strokeWidth={2} />
              <Area type="monotone" dataKey="Expenses" stroke="#F06595" fill="#FFF0F5" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-48px_rgba(15,23,42,0.75)]">
          <h3 className="mb-4 text-base font-black text-[#111827]">Spending by Category</h3>
          {categoryData.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#C7D2FE] bg-[#F8FAFC] p-6 text-sm leading-6 text-[#64748B]">No expense categories yet. Add records to populate this view.</p>
          ) : (
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="h-[190px] w-full md:w-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={44} outerRadius={78} dataKey="value" stroke="none">
                      {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs font-bold capitalize text-[#374151]">{cat.name}</span>
                    </div>
                    <span className="text-xs font-black text-[#111827]">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-48px_rgba(15,23,42,0.75)]">
          <h3 className="mb-4 text-base font-black text-[#111827]">Saving Rate Trend</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 14, border: "1px solid #E2E8F0" }} />
                <Line type="monotone" dataKey="rate" stroke="#4F6EF7" strokeWidth={2} dot={{ fill: "#4F6EF7", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
