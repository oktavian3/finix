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
          <Wallet size={48} className="text-[#1E293B] mb-4" />
          <h2 className="text-[16px] font-semibold text-white font-mono mb-2">CONNECT WALLET TO VIEW ANALYTICS</h2>
          <Button size="lg" onClick={connect} loading={isConnecting}><Wallet size={15} /> CONNECT WALLET</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Analytics"
      subtitle="// FINANCIAL_INSIGHTS"
      topbarExtra={
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#111827] border border-[#1E293B]">
          <span className="flex h-[5px] w-[5px] items-center justify-center rounded-full bg-[#15803D] animate-pulse" />
          <span className="text-[10px] font-mono text-[#9CA3AF]">NODE: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
      }
    >
      {/* Section /01 — Period */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono text-[#3B5BDB]">/01</span>
          <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">PERIOD</span>
          <div className="flex-1 h-px bg-[#1E293B]" />
        </div>
        <div className="flex gap-1">
          {(['1m', '3m', '6m'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-[10px] font-mono font-medium transition-all duration-150 rounded-none ${
                period === p ? 'bg-[#3B5BDB] text-white' : 'bg-[#111827] border border-[#1E293B] text-[#9CA3AF] hover:text-white hover:border-[#334155]'
              }`}
            >
              {p === '1m' ? 'THIS_MONTH' : p === '3m' ? '3_MONTHS' : '6_MONTHS'}
            </button>
          ))}
        </div>
      </div>

      {/* Section /02 — Overview Stats */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono text-[#3B5BDB]">/02</span>
          <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">OVERVIEW</span>
          <div className="flex-1 h-px bg-[#1E293B]" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#111827] border border-[#1E293B] p-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#15803D]" />
            <p className="text-[9px] font-mono text-[#6B7280] uppercase tracking-wider pl-2">INCOME</p>
            <p className="text-[16px] font-mono font-bold text-[#15803D] mt-1 pl-2">{formatCurrency(currentSummary.totalIncome)}</p>
            {lastPeriod && <p className="text-[9px] font-mono text-[#6B7280] mt-1 pl-2">{incomeChange >= 0 ? '↑' : '↓'} VS_PREV</p>}
          </div>
          <div className="bg-[#111827] border border-[#1E293B] p-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#B91C1C]" />
            <p className="text-[9px] font-mono text-[#6B7280] uppercase tracking-wider pl-2">EXPENSES</p>
            <p className="text-[16px] font-mono font-bold text-[#B91C1C] mt-1 pl-2">{formatCurrency(currentSummary.totalExpense)}</p>
            {lastPeriod && <p className="text-[9px] font-mono text-[#6B7280] mt-1 pl-2">{expenseChange >= 0 ? '↑' : '↓'} VS_PREV</p>}
          </div>
          <div className="bg-[#111827] border border-[#1E293B] p-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#3B5BDB]" />
            <p className="text-[9px] font-mono text-[#6B7280] uppercase tracking-wider pl-2">NET_SAVED</p>
            <p className={`text-[16px] font-mono font-bold mt-1 pl-2 ${currentSummary.netBalance >= 0 ? 'text-white' : 'text-[#B91C1C]'}`}>
              {formatCurrency(currentSummary.netBalance)}
            </p>
          </div>
          <div className="bg-[#111827] border border-[#1E293B] p-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#3B5BDB]" />
            <p className="text-[9px] font-mono text-[#6B7280] uppercase tracking-wider pl-2">SAVING_RATE</p>
            <p className="text-[16px] font-mono font-bold text-[#3B5BDB] mt-1 pl-2">{currentSummary.savingRate}%</p>
            {lastPeriod && <p className="text-[9px] font-mono mt-1 pl-2" style={{color: rateChange >= 0 ? '#15803D' : '#B91C1C'}}>{rateChange >= 0 ? '↑' : '↓'} {Math.abs(rateChange)}%</p>}
          </div>
        </div>
      </div>

      {/* Section /03 — Charts */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono text-[#3B5BDB]">/03</span>
          <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">TRENDS</span>
          <div className="flex-1 h-px bg-[#1E293B]" />
        </div>
        <div className="bg-[#111827] border border-[#1E293B] p-4 mb-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-mono text-[#3B5BDB]">/CHART</span>
            <h3 className="text-[12px] font-mono font-semibold text-white uppercase tracking-wider">Income vs Expense</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }} axisLine={{ stroke: '#1E293B' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }} axisLine={{ stroke: '#1E293B' }} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 0, border: '1px solid #1E293B', background: '#0A0E1A', color: '#9CA3AF', fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="Income" stroke="#3B5BDB" fill="#3B5BDB" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="Expenses" stroke="#F06595" fill="#F06595" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section /04 — Category & Rate */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono text-[#3B5BDB]">/04</span>
          <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">BREAKDOWN</span>
          <div className="flex-1 h-px bg-[#1E293B]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#111827] border border-[#1E293B] p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-mono text-[#3B5BDB]">/PIE</span>
              <h3 className="text-[12px] font-mono font-semibold text-white uppercase tracking-wider">Spending by Category</h3>
            </div>
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
              <div className="flex-1 space-y-1.5">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-[10px] font-mono text-[#9CA3AF] uppercase">{cat.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-white">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1E293B] p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-mono text-[#3B5BDB]">/LINE</span>
              <h3 className="text-[12px] font-mono font-semibold text-white uppercase tracking-wider">Saving Rate Trend</h3>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }} axisLine={{ stroke: '#1E293B' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }} axisLine={{ stroke: '#1E293B' }} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 0, border: '1px solid #1E293B', background: '#0A0E1A', color: '#9CA3AF', fontFamily: 'monospace' }} />
                  <Line type="monotone" dataKey="rate" stroke="#3B5BDB" strokeWidth={2} dot={{ fill: '#3B5BDB', r: 3, stroke: '#0A0E1A', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
