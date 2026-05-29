"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinixData } from "@/hooks/useFinixData";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/Button";
import { Wallet, Bot, Send, Loader2 } from "lucide-react";

export default function AiAdvisorPage() {
  const { currentSummary } = useFinixData();
  const { isConnected, connect, isConnecting, address } = useWallet();
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: string; content: string}>>([]);

  const generateAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          financialSummary: {
            totalIncome: currentSummary.totalIncome,
            totalExpense: currentSummary.totalExpense,
            savingRate: currentSummary.savingRate,
            topCategory: Object.entries(currentSummary.byCategory)
              .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A',
          },
        }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.analysis }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'ERROR: Analysis generation failed. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setChatHistory(prev => [...prev, { role: 'assistant', content: 'PLACEHOLDER_RESPONSE: AI integration coming soon. Consider reviewing your biggest expense categories and setting up automatic savings.' }]);
    setMessage('');
  };

  if (!isConnected) {
    return (
      <AppShell title="AI Advisor">
        <div className="flex flex-col items-center justify-center py-24">
          <Bot size={48} className="text-[#1E293B] mb-4" />
          <Button size="lg" onClick={connect} loading={isConnecting}><Wallet size={15} /> CONNECT WALLET</Button>
        </div>
      </AppShell>
    );
  }

  const suggestionChips = [
    'How can I improve my saving rate?',
    'What\'s my biggest expense?',
    'Am I on track for my goals?',
    'Where should I cut spending?',
  ];

  return (
    <AppShell
      title="AI Financial Advisor"
      subtitle="// POWERED_BY_CLAUDE // DATA_ON_WALRUS"
      topbarExtra={
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#111827] border border-[#1E293B]">
          <span className="flex h-[5px] w-[5px] items-center justify-center rounded-full bg-[#15803D] animate-pulse" />
          <span className="text-[10px] font-mono text-[#9CA3AF]">NODE: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
      }
    >
      <div className="grid grid-cols-[1fr_280px] gap-3">
        {/* Main Chat */}
        <div className="bg-[#111827] border border-[#1E293B] flex flex-col min-h-[500px]">
          {chatHistory.length === 0 && !analysis && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 bg-[#3B5BDB]/20 border border-[#3B5BDB]/30 flex items-center justify-center mb-4">
                <Bot size={26} className="text-[#3B5BDB]" />
              </div>
              <h3 className="text-[14px] font-mono font-semibold text-white mb-2">AI_FINANCIAL_ADVISOR</h3>
              <p className="text-[11px] font-mono text-[#6B7280] max-w-[400px] mb-6 leading-5">
                Get personalized financial insights based on your Walrus-stored data.
                All analysis happens server-side — your raw data stays private.
              </p>
              <Button onClick={generateAnalysis} loading={isLoading}>
                <Bot size={13} /> GENERATE_ANALYSIS
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 ${
                  msg.role === 'user'
                    ? 'bg-[#3B5BDB] text-white'
                    : 'bg-[#0A0E1A] border border-[#1E293B] text-[#9CA3AF]'
                }`}>
                  <p className="text-[11px] font-mono leading-5 whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#0A0E1A] border border-[#1E293B] p-3">
                  <Loader2 size={15} className="animate-spin text-[#3B5BDB]" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#1E293B] p-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about your finances..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-3 py-2 text-[11px] font-mono border border-[#1E293B] bg-[#0A0E1A] text-white focus:outline-none focus:border-[#3B5BDB] placeholder-[#334155]"
              />
              <Button size="sm" onClick={handleSend} disabled={!message.trim()}>
                <Send size={12} />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <div className="bg-[#111827] border border-[#1E293B] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono text-[#3B5BDB]">/Q</span>
              <h4 className="text-[11px] font-mono font-semibold text-white uppercase tracking-wider">Quick Questions</h4>
            </div>
            <div className="space-y-1.5">
              {suggestionChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMessage(chip);
                    setChatHistory(prev => [...prev, { role: 'user', content: chip }]);
                    setChatHistory(prev => [...prev, { role: 'assistant', content: 'PLACEHOLDER: Full AI integration will analyze your Walrus-stored data for personalized advice.' }]);
                  }}
                  className="w-full text-left px-3 py-2 text-[10px] font-mono text-[#9CA3AF] bg-[#0A0E1A] border border-[#1E293B] hover:bg-[#1E293B]/50 hover:text-white transition-colors duration-150"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#3B5BDB]/10 border border-[#3B5BDB]/30 p-4">
            <Bot size={16} className="text-[#3B5BDB] mb-2" />
            <p className="text-[10px] font-mono text-[#9CA3AF] leading-4">
              Your financial data never leaves Walrus. Only anonymized summaries are sent to the AI.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
