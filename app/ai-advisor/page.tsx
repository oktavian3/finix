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
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble generating the analysis. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setChatHistory(prev => [...prev, { role: 'assistant', content: 'Great question! (AI integration coming soon — for now this is a placeholder response.) Consider reviewing your biggest expense categories and setting up automatic savings.' }]);
    setMessage('');
  };

  if (!isConnected) {
    return (
      <AppShell title="AI Advisor">
        <div className="flex flex-col items-center justify-center py-24">
          <Bot size={48} className="text-[#C5D0FF] mb-4" />
          <Button size="lg" onClick={connect} loading={isConnecting}><Wallet size={16} /> Connect Wallet</Button>
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
      subtitle="Powered by Claude · Your data stays on Walrus"
      topbarExtra={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-[#EEF2FF] border border-[#C5D0FF]">
            <Wallet size={12} className="text-[#3B5BDB]" />
            <span className="text-[11px] font-medium text-[#374151]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-[1fr_280px] gap-5">
        {/* Main Chat */}
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] flex flex-col min-h-[500px]">
          {/* Welcome / Analysis */}
          {chatHistory.length === 0 && !analysis && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B5BDB] to-[#6D28D9] flex items-center justify-center mb-4">
                <Bot size={28} className="text-white" />
              </div>
              <h3 className="text-[16px] font-semibold text-[#111827] mb-2">AI Financial Advisor</h3>
              <p className="text-[12px] text-[#6B7280] max-w-[400px] mb-6">
                Get personalized financial insights based on your Walrus-stored data.
                All analysis happens server-side — your raw data stays private.
              </p>
              <Button onClick={generateAnalysis} loading={isLoading}>
                <Bot size={14} /> Generate Monthly Analysis
              </Button>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-[12px] p-3 ${
                  msg.role === 'user'
                    ? 'bg-[#3B5BDB] text-white'
                    : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#374151]'
                }`}>
                  <p className="text-[12px] leading-5 whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] p-3">
                  <Loader2 size={16} className="animate-spin text-[#3B5BDB]" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[#E2E8F0] p-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask anything about your finances..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-3 py-2 text-[12px] border border-[#E2E8F0] rounded-[10px] focus:outline-none focus:border-[#3B5BDB]"
              />
              <Button size="sm" onClick={handleSend} disabled={!message.trim()}>
                <Send size={13} />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4">
            <h4 className="text-[12px] font-semibold text-[#111827] mb-3">Quick Questions</h4>
            <div className="space-y-2">
              {suggestionChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMessage(chip);
                    setChatHistory(prev => [...prev, { role: 'user', content: chip }]);
                    setChatHistory(prev => [...prev, { role: 'assistant', content: 'Great question! This is a placeholder response. The full AI integration will analyze your Walrus-stored data and give personalized advice.' }]);
                  }}
                  className="w-full text-left px-3 py-2 text-[11px] text-[#374151] bg-[#F8FAFC] rounded-[8px] hover:bg-[#EEF2FF] transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#3B5BDB] to-[#6D28D9] rounded-[12px] p-4 text-white">
            <Bot size={18} className="mb-2" />
            <p className="text-[11px] leading-5 opacity-90">
              Your financial data never leaves Walrus. Only anonymized summaries are sent to the AI.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
