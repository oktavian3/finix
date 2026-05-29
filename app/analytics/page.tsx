"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinixData } from "@/hooks/useFinixData";
import { useWallet } from "@/hooks/useWallet";
import { formatCurrency, getMonthLabel } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { Wallet } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function AnalyticsPage() {
  const { allSummaries, currentSummary } = useFinixData();
  const { isConnected, connect, isConnecting, address } = useWallet();
  const [period, setPeriod] = useState<'1m' | '3m' | '6m'>('6m');

  const periodData = useMemo(() => {
    if (period === '6m') return allSummaries;
    if (period === '3m') return allSummaries.slice(-3);
    return allSummaries.slice(-1);
  }, [allSummaries, period]);

  const lastPeriod = useMemo(() => {
    if (periodData.length >= 2) return periodData[periodData.length - 2];
    return null;
  }, [periodData]);

  const incomeChange = lastPeriod ? Math.round(((currentSummary.totalIncome - lastPeriod.totalIncome) / lastPeriod.totalIncome) * 100) : 0;
  const expenseChange = lastPeriod ? Math.round(((currentSummary.totalExpense - lastPeriod.totalExpense) / lastPeriod.totalExpense) * 100) : 0;
  const rateChange = lastPeriod ? currentSummary.savingRate - lastPeriod.savingRate : 0;

  const areaData = periodData.map(m => ({
    month: getMonthLabel(m.month).split(' ')[0],
    Income: m.totalIncome,
    Expenses: m.totalExpense,
  }));

  const categoryData = Object.entries(currentSummary.byCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const PIE_COLORS = ['#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#F97316', '#EF4444', '#10B981', '#6B7280'];

  const rateData = periodData.map(m => ({
    month: getMonthLabel(m.month).split(' ')[0],
    rate: m.savingRate,
  }));

  if (!isConnected) {
    return (
      <AppShell title="Analytics">
        <div className="flex flex-col items-center justify-center py-24">
          <Wallet size={48} className="text-[#C5D0FF] mb-4" />
          <h2 className="text-[18px] font-semibold text-[#111827] mb-2">Connect wallet to view analytics</h2>
          <Button size="lg" onClick={connect} loading={isConnecting}><Wallet size={16} /> Connect Wallet</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Analytics"
      subtitle="Your financial insights"
      topbarExtra={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-[#EEF2FF] border border-[#C5D0FF]">
            <Wallet size={12} className="text-[#3B5BDB]" />
            <span className="text-[11px] font-medium text-[#374151]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
        </div>
      }
    >
      {/* Period Toggle */}
      <div className="flex gap-2 mb-5">
        {(['1m', '3m', '6m'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-[8px] transition-all ${
              period === p ? 'bg-[#3B5BDB] text-white' : 'bg-white border border-[#E2E8F0] text-[#374151] hover:bg-[#F5F7FF]'
            }`}
          >
            {p === '1m' ? 'This Month' : p === '3m' ? 'Last 3 Months' : 'Last 6 Months'}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4">
          <p className="text-[11px] text-[#6B7280]">Income</p>
          <p className="text-[18px] font-semibold text-[#15803D] mt-1">{formatCurrency(currentSummary.totalIncome)}</p>
          {lastPeriod && <p className="text-[10px] text-[#6B7280] mt-1">{incomeChange >= 0 ? '↑' : '↓'} vs last period</p>}
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4">
          <p className="text-[11px] text-[#6B7280]">Expenses</p>
          <p className="text-[18px] font-semibold text-[#B91C1C] mt-1">{formatCurrency(currentSummary.totalExpense)}</p>
          {lastPeriod && <p className="text-[10px] text-[#6B7280] mt-1">{expenseChange >= 0 ? '↑' : '↓'} vs last period</p>}
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4">
          <p className="text-[11px] text-[#6B7280]">Net Saved</p>
          <p className={`text-[18px] font-semibold mt-1 ${currentSummary.netBalance >= 0 ? 'text-[#111827]' : 'text-[#B91C1C]'}`}>
            {formatCurrency(currentSummary.netBalance)}
          </p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4">
          <p className="text-[11px] text-[#6B7280]">Saving Rate</p>
          <p className="text-[18px] font-semibold text-[#3B5BDB] mt-1">{currentSummary.savingRate}%</p>
          {lastPeriod && <p className="text-[10px] mt-1" style={{color: rateChange >= 0 ? '#15803D' : '#B91C1C'}}>{rateChange >= 0 ? '↑' : '↓'} {Math.abs(rateChange)}%</p>}
        </div>
      </div>

      {/* Income vs Expense Trend */}
      <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px] mb-5">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-4">Income vs Expense</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E2E8F0' }} />
              <Area type="monotone" dataKey="Income" stroke="#4F6EF7" fill="#EEF2FF" strokeWidth={2} />
              <Area type="monotone" dataKey="Expenses" stroke="#F06595" fill="#FFF0F5" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Pie + Rate Trend */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px]">
          <h3 className="text-[14px] font-semibold text-[#111827] mb-4">Spending by Category</h3>
          <div className="flex items-center gap-4">
            <div className="h-[180px] w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} dataKey="value" stroke="none">
                    {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-[11px] text-[#374151] capitalize">{cat.name}</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#111827]">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px]">
          <h3 className="text-[14px] font-semibold text-[#111827] mb-4">Saving Rate Trend</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E2E8F0' }} />
                <Line type="monotone" dataKey="rate" stroke="#4F6EF7" strokeWidth={2} dot={{ fill: '#4F6EF7', r: 4 }} />
                <CartesianGrid stroke="#F0F0F0" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
