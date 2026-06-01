"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinixData } from "@/hooks/useFinixData";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/Button";
import { Bot, Sparkles, Loader2, TrendingUp, Target, PiggyBank, AlertTriangle, Wallet, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/analytics";

export default function AiAdvisorPage() {
  const { data, currentSummary, allSummaries } = useFinixData();
  const { isConnected, connect, isConnecting, address } = useWallet();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisKey, setAnalysisKey] = useState(0);
  const [regenerating, setRegenerating] = useState(false);

  // Fresh analysis on mount
  const generateAnalysis = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
      setError(null);
    }

    // Get top category by actual amount
    const catEntries = Object.entries(currentSummary.byCategory).sort(([, a], [, b]) => b - a);
    const srcEntries = Object.entries(currentSummary.bySource).sort(([, a], [, b]) => b - a);

    const goalsData = data.goals.map(g => ({
      name: g.name,
      targetAmount: g.targetAmount,
      savedAmount: g.savedAmount,
      progress: Math.round((g.savedAmount / g.targetAmount) * 100),
    }));

    const trendData = allSummaries.map(s => ({
      month: s.month,
      income: s.totalIncome,
      expense: s.totalExpense,
    }));

    try {
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          financialSummary: {
            totalIncome: currentSummary.totalIncome,
            totalExpense: currentSummary.totalExpense,
            netBalance: currentSummary.netBalance,
            savingRate: currentSummary.savingRate,
            topCategory: catEntries[0]?.[0] || 'N/A',
            topCategoryAmount: catEntries[0]?.[1] || 0,
            topSource: srcEntries[0]?.[0] || 'N/A',
            topSourceAmount: srcEntries[0]?.[1] || 0,
            byCategory: currentSummary.byCategory,
            bySource: currentSummary.bySource,
          },
          goals: goalsData,
          trendData,
        }),
      });
      const dataJson = await res.json();
      if (!res.ok) throw new Error(dataJson.error || 'Analysis failed');
      setAnalysis(dataJson.analysis);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate analysis';
      setError(msg);
      if (!silent) setAnalysis(null);
    } finally {
      setIsLoading(false);
      setRegenerating(false);
    }
  }, [currentSummary, data.goals, allSummaries]);

  useEffect(() => {
    if (isConnected) {
      generateAnalysis(true);
    }
  }, [isConnected, analysisKey, generateAnalysis]);

  const handleRegenerate = () => {
    setRegenerating(true);
    setAnalysisKey(k => k + 1);
  };

  if (!isConnected) {
    return (
      <AppShell title="AI Advisor">
        <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-[#0B1020] p-8 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.85)]">
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-[#4F6EF7]/30 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
              <Bot size={14} />
              AI workspace
            </div>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">Ask from clean financial context.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">Finix sends only aggregated summaries to the advisor, not raw transaction rows.</p>
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

  const topCategory = Object.entries(currentSummary.byCategory).sort(([, a], [, b]) => b - a);
  const topSource = Object.entries(currentSummary.bySource).sort(([, a], [, b]) => b - a);

  return (
    <AppShell
      title="AI Financial Advisor"
      subtitle="AI-powered financial analysis based on your spending habits"
      topbarExtra={
        <div className="flex w-full flex-wrap items-center justify-end gap-2 lg:flex-nowrap">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold text-[#475569] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C7D2FE] disabled:opacity-50"
          >
            <Sparkles size={14} />
            Regenerate
          </button>
          <div className="hidden items-center gap-1.5 rounded-full border border-[#C5D0FF] bg-[#EEF2FF] px-3 py-2 md:flex">
            <Wallet size={14} className="text-[#3B5BDB]" />
            <span className="text-xs font-bold text-[#374151]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[#0B1020] p-6 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.85)]">
          <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-[#4F6EF7]/35 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-[#8FE5C0]/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
                <Sparkles size={14} />
                DeepSeek advisor
              </div>
              <h2 className="max-w-[680px] text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">AI Advisor Command Center</h2>
              <p className="mt-4 max-w-[620px] text-sm leading-7 text-white/65 sm:text-base">Get concise English insights from monthly summaries, categories, goals, and trend data.</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#111827] hover:-translate-y-0.5 hover:bg-[#F8FAFC] disabled:opacity-50"
                >
                  <Sparkles size={15} />
                  Generate insight
                </button>
                <button className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-bold text-white/80 hover:-translate-y-0.5 hover:bg-white/15">
                  Aggregated data only
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Context score</p>
                  <p className="mt-2 text-3xl font-black">{data.transactions.length > 0 ? "Ready" : "Empty"}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#111827] shadow-lg">
                  <Bot size={22} />
                </div>
              </div>
              <div className="mt-6 grid gap-2">
                {["Summaries", "Categories", "Goals"].map((label, index) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl bg-white/10 px-3 py-2 text-xs font-bold text-white/70">
                    <span>{label}</span>
                    <span>{index === 0 ? allSummaries.length : index === 1 ? Object.keys(currentSummary.byCategory).length : data.goals.length}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Data Summary Cards — income, expenses, saving rate, goals */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-[#15803D]" />
              <span className="text-2xs font-semibold text-[#6B7280] uppercase tracking-wider">Income</span>
            </div>
            <p className="text-lg font-bold text-[#111827]">{formatCurrency(currentSummary.totalIncome)}</p>
          </div>
          <div className="rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)]">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-[#B91C1C]" />
              <span className="text-2xs font-semibold text-[#6B7280] uppercase tracking-wider">Expenses</span>
            </div>
            <p className="text-lg font-bold text-[#111827]">{formatCurrency(currentSummary.totalExpense)}</p>
          </div>
          <div className="rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)]">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank size={14} className="text-[#3B5BDB]" />
              <span className="text-2xs font-semibold text-[#6B7280] uppercase tracking-wider">Saving Rate</span>
            </div>
            <p className={`text-lg font-bold ${currentSummary.savingRate >= 30 ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
              {currentSummary.savingRate}%
            </p>
          </div>
          <div className="rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)]">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-[#6D28D9]" />
              <span className="text-2xs font-semibold text-[#6B7280] uppercase tracking-wider">Goals</span>
            </div>
            <p className="text-lg font-bold text-[#111827]">
              {data.goals.filter(g => g.savedAmount >= g.targetAmount).length}/{data.goals.length}
            </p>
          </div>
        </div>

        {/* Category & Source mini-table */}
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)]">
            <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Top Expenses</h4>
            <div className="space-y-2">
              {topCategory.length === 0 && <p className="text-xs leading-5 text-[#64748B]">No expense records yet.</p>}
              {topCategory.slice(0, 4).map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-xs text-[#374151] capitalize">{cat}</span>
                  <span className="text-xs font-medium text-[#B91C1C]">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)]">
            <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Top Income Sources</h4>
            <div className="space-y-2">
              {topSource.length === 0 && <p className="text-xs leading-5 text-[#64748B]">No income records yet.</p>}
              {topSource.slice(0, 4).map(([src, amt]) => (
                <div key={src} className="flex items-center justify-between">
                  <span className="text-xs text-[#374151] capitalize">{src}</span>
                  <span className="text-xs font-medium text-[#15803D]">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E8F0] bg-[#FAFBFC]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3B5BDB] to-[#6D28D9] flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-[#111827]">AI Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              {analysis && (
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#3B5BDB] hover:bg-[#EEF2FF] rounded-[8px] transition-colors disabled:opacity-50"
                >
                  <Sparkles size={13} />
                  Regenerate
                </button>
              )}
              <span className="text-2xs text-[#9CA3AF]">DeepSeek</span>
            </div>
          </div>
          <div className="p-5 min-h-[200px]">
            {isLoading || regenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-[#3B5BDB] mb-3" />
                <p className="text-sm text-[#6B7280]">Analyzing your financial data...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle size={24} className="text-[#B91C1C] mb-3" />
                <p className="text-xs text-[#6B7280] mb-3">{error}</p>
                <Button size="sm" onClick={() => generateAnalysis()}>
                  <Sparkles size={13} /> Try Again
                </Button>
              </div>
            ) : analysis ? (
              <div className="prose prose-sm max-w-none">
                {analysis.split('\n').map((line, i) => {
                  if (!line.trim()) return <br key={i} />;
                  if (line.startsWith('###') || line.startsWith('##') || line.startsWith('#')) {
                    return (
                      <h3 key={i} className="text-base font-semibold text-[#111827] mt-4 mb-2">
                        {line.replace(/^#+\s*/, '')}
                      </h3>
                    );
                  }
                  if (line.startsWith('- ') || line.startsWith('* ')) {
                    return (
                      <li key={i} className="text-xs text-[#374151] leading-6 ml-4 list-disc">
                        {line.replace(/^[-*]\s*/, '')}
                      </li>
                    );
                  }
                  if (/^\d+[\.\)]/.test(line)) {
                    return (
                      <li key={i} className="text-xs text-[#374151] leading-6 ml-4 list-decimal">
                        {line.replace(/^\d+[\.\)]\s*/, '')}
                      </li>
                    );
                  }
                  return (
                    <p key={i} className="text-xs text-[#374151] leading-6 mb-1">
                      {line}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Bot size={24} className="text-[#C5D0FF] mb-3" />
                <p className="text-xs text-[#6B7280]">Generating analysis...</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom info — how data is used */}
        <div className="rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#EAFBF6] text-[#111827]">
              <Bot size={18} />
            </div>
            <div>
              <p className="text-sm font-black text-[#111827] mb-1">How Your Data Is Used</p>
              <p className="text-xs leading-6 text-[#64748B]">
                We analyze your financial habits to give you personalized insights. Your raw transactions are not sent to the AI service.
                Only aggregated data (monthly summaries, categories, goals) is used for AI analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
