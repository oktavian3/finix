"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinixData } from "@/hooks/useFinixData";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/Button";
import { Wallet, Bot, Sparkles, Loader2, TrendingUp, Target, PiggyBank, AlertTriangle } from "lucide-react";
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
      emoji: g.emoji,
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
  }, [isConnected, analysisKey]);

  const handleRegenerate = () => {
    setRegenerating(true);
    setAnalysisKey(k => k + 1);
  };

  if (!isConnected) {
    return (
      <AppShell title="AI Advisor">
        <div className="flex flex-col items-center justify-center py-24">
          <Bot size={48} className="text-[#C5D0FF] mb-4" />
          <h2 className="text-[18px] font-semibold text-[#111827] mb-2">Connect Wallet untuk Insight AI</h2>
          <p className="text-[13px] text-[#6B7280] mb-6 text-center max-w-md">
            Finix menganalisis data transaksi on-chain-mu dan ngasih rekomendasi finansial personal.
          </p>
          <Button size="lg" onClick={connect} loading={isConnecting}>
            <Wallet size={16} /> Connect Wallet
          </Button>
        </div>
      </AppShell>
    );
  }

  const topCategory = Object.entries(currentSummary.byCategory).sort(([, a], [, b]) => b - a);
  const topSource = Object.entries(currentSummary.bySource).sort(([, a], [, b]) => b - a);

  return (
    <AppShell
      title="AI Financial Advisor"
      subtitle="Powered by DeepSeek · Data stays private"
      topbarExtra={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-[#EEF2FF] border border-[#C5D0FF]">
            <Wallet size={12} className="text-[#3B5BDB]" />
            <span className="text-[11px] font-medium text-[#374151]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Data Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-[#15803D]" />
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Income</span>
            </div>
            <p className="text-[18px] font-bold text-[#111827]">{formatCurrency(currentSummary.totalIncome)}</p>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-[#B91C1C]" />
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Expenses</span>
            </div>
            <p className="text-[18px] font-bold text-[#111827]">{formatCurrency(currentSummary.totalExpense)}</p>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank size={14} className="text-[#3B5BDB]" />
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Saving Rate</span>
            </div>
            <p className={`text-[18px] font-bold ${currentSummary.savingRate >= 30 ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
              {currentSummary.savingRate}%
            </p>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-[#6D28D9]" />
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Goals</span>
            </div>
            <p className="text-[18px] font-bold text-[#111827]">
              {data.goals.filter(g => g.savedAmount >= g.targetAmount).length}/{data.goals.length}
            </p>
          </div>
        </div>

        {/* Category & Source mini-table */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4">
            <h4 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Top Expenses</h4>
            <div className="space-y-2">
              {topCategory.slice(0, 4).map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-[12px] text-[#374151] capitalize">{cat}</span>
                  <span className="text-[12px] font-medium text-[#B91C1C]">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4">
            <h4 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Top Income Sources</h4>
            <div className="space-y-2">
              {topSource.slice(0, 4).map(([src, amt]) => (
                <div key={src} className="flex items-center justify-between">
                  <span className="text-[12px] text-[#374151] capitalize">{src}</span>
                  <span className="text-[12px] font-medium text-[#15803D]">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E8F0] bg-[#FAFBFC]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3B5BDB] to-[#6D28D9] flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <span className="text-[12px] font-semibold text-[#111827]">AI Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              {analysis && (
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-[#3B5BDB] hover:bg-[#EEF2FF] rounded-[8px] transition-colors disabled:opacity-50"
                >
                  <Sparkles size={13} />
                  Regenerate
                </button>
              )}
              <span className="text-[10px] text-[#9CA3AF]">DeepSeek</span>
            </div>
          </div>
          <div className="p-5 min-h-[200px]">
            {isLoading || regenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-[#3B5BDB] mb-3" />
                <p className="text-[12px] text-[#6B7280]">Menganalisis data keuangan lo...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle size={24} className="text-[#B91C1C] mb-3" />
                <p className="text-[12px] text-[#6B7280] mb-3">{error}</p>
                <Button size="sm" onClick={() => generateAnalysis()}>
                  <Sparkles size={13} /> Coba Lagi
                </Button>
              </div>
            ) : analysis ? (
              <div className="prose prose-sm max-w-none">
                {analysis.split('\n').map((line, i) => {
                  if (!line.trim()) return <br key={i} />;
                  if (line.startsWith('###') || line.startsWith('##') || line.startsWith('#')) {
                    return (
                      <h3 key={i} className="text-[14px] font-semibold text-[#111827] mt-4 mb-2">
                        {line.replace(/^#+\s*/, '')}
                      </h3>
                    );
                  }
                  if (line.startsWith('- ') || line.startsWith('* ')) {
                    return (
                      <li key={i} className="text-[12px] text-[#374151] leading-6 ml-4 list-disc">
                        {line.replace(/^[-*]\s*/, '')}
                      </li>
                    );
                  }
                  if (/^\d+[\.\)]/.test(line)) {
                    return (
                      <li key={i} className="text-[12px] text-[#374151] leading-6 ml-4 list-decimal">
                        {line.replace(/^\d+[\.\)]\s*/, '')}
                      </li>
                    );
                  }
                  return (
                    <p key={i} className="text-[12px] text-[#374151] leading-6 mb-1">
                      {line}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Bot size={24} className="text-[#C5D0FF] mb-3" />
                <p className="text-[12px] text-[#6B7280]">Generating analysis...</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom info */}
        <div className="bg-gradient-to-br from-[#3B5BDB] to-[#6D28D9] rounded-[12px] p-4 text-white flex items-start gap-3">
          <Bot size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-semibold mb-1">Privacy First 🔒</p>
            <p className="text-[11px] leading-5 opacity-90">
              AI cuma nerima data agregat (ringkasan bulanan, kategori, goals) — transaksi raw lo tetap aman di Walrus. 
              Nggak ada chat, nggak ada prompt injection. Pure data-driven insights.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
