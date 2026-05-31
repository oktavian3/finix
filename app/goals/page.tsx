"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinixData } from "@/hooks/useFinixData";
import { useWallet } from "@/hooks/useWallet";
import { formatCurrency } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { showToast } from "@/components/ui/Toast";
import { Wallet, Plus, Target, Trash2, ArrowUpCircle } from "lucide-react";
import type { Goal } from "@/types/finix";

const emojiSuggestions: Record<string, string> = {
  ipad: '💻', iphone: '📱', laptop: '💻', macbook: '💻',
  trip: '✈️', travel: '✈️', vacation: '✈️', bali: '✈️',
  car: '🚗', motor: '🏍️',
  house: '🏠', rent: '🏠', kos: '🏠',
  emergency: '🛡️', fund: '💰',
  invest: '📈', crypto: '₿',
};

function suggestEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(emojiSuggestions)) {
    if (lower.includes(key)) return emoji;
  }
  return '🎯';
}

export default function GoalsPage() {
  const { data, updateData, currentSummary } = useFinixData();
  const { isConnected, connect, isConnecting, address } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [emoji, setEmoji] = useState('🎯');

  // Top-up state
  const [topUpGoal, setTopUpGoal] = useState<Goal | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');

  const activeGoals = data.goals.filter(g => !g.completedAt);
  const completedGoals = data.goals.filter(g => g.completedAt);
  const totalSaved = data.goals.reduce((s, g) => s + g.savedAmount, 0);

  const handleAdd = async () => {
    if (!name || !target) return;
    const newGoal: Goal = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      name,
      emoji,
      targetAmount: parseFloat(target),
      savedAmount: 0,
      currency: 'USD',
      createdAt: new Date().toISOString(),
    };
    const updated = { ...data, goals: [...data.goals, newGoal] };
    localStorage.setItem('finix_blob_mock', JSON.stringify(updated));
    updateData(updated);
    showToast('success', 'Goal created', emoji + ' ' + name);
    setIsModalOpen(false);
    setName('');
    setTarget('');
    setEmoji('🎯');
  };

  const handleDelete = (id: string) => {
    const updated = { ...data, goals: data.goals.filter(g => g.id !== id) };
    localStorage.setItem('finix_blob_mock', JSON.stringify(updated));
    updateData(updated);
    showToast('success', 'Goal deleted');
  };

  const handleTopUp = (goal: Goal) => {
    setTopUpGoal(goal);
    setTopUpAmount('');
  };

  const handleConfirmTopUp = () => {
    if (!topUpGoal || !topUpAmount) return;
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('error', 'Invalid amount', 'Please enter a valid positive number');
      return;
    }
    const newSavedAmount = topUpGoal.savedAmount + amount;
    const completedAt = newSavedAmount >= topUpGoal.targetAmount ? new Date().toISOString() : undefined;
    const updatedGoals = data.goals.map(g =>
      g.id === topUpGoal.id
        ? { ...g, savedAmount: newSavedAmount, ...(completedAt ? { completedAt } : {}) }
        : g
    );
    const updated = { ...data, goals: updatedGoals };
    localStorage.setItem('finix_blob_mock', JSON.stringify(updated));
    updateData(updated);
    showToast('success', 'Top up successful', `${formatCurrency(amount)} added to ${topUpGoal.name}`);
    setTopUpGoal(null);
    setTopUpAmount('');
  };

  if (!isConnected) {
    return (
      <AppShell title="Goals">
        <div className="flex flex-col items-center justify-center py-24">
          <Wallet size={48} className="text-[#C5D0FF] mb-4" />
          <Button size="lg" onClick={connect} loading={isConnecting}><Wallet size={16} /> Connect Wallet</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Goals"
      subtitle={`${activeGoals.length} Active · ${completedGoals.length} Completed · Saved ${formatCurrency(totalSaved)}`}
      topbarExtra={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-[#EEF2FF] border border-[#C5D0FF]">
            <Wallet size={12} className="text-[#3B5BDB]" />
            <span className="text-xs font-medium text-[#374151]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={13} /> New Goal
          </Button>
        </div>
      }
    >
      {/* Active Goals */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {activeGoals.map(g => {
          const progress = g.targetAmount > 0 ? Math.min((g.savedAmount / g.targetAmount) * 100, 100) : 0;
          const remaining = g.targetAmount - g.savedAmount;
          const monthlyIncome = currentSummary.totalIncome * (currentSummary.savingRate / 100);
          const eta = monthlyIncome > 0
            ? Math.ceil(remaining / monthlyIncome)
            : '∞';
          return (
            <div key={g.id} className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px] group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{g.emoji}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">{g.name}</h3>
                    <p className="text-xs text-[#6B7280]">Saved {formatCurrency(g.savedAmount)} of {formatCurrency(g.targetAmount)}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded-[6px] text-[#9CA3AF] hover:text-[#B91C1C] opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="h-3 rounded-full bg-[#EEF2FF] mb-2">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-[#3B5BDB] to-[#4F6EF7] transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#3B5BDB]">{progress.toFixed(0)}%</span>
                <span className="text-2xs text-[#9CA3AF]">ETA: ~{eta} months</span>
              </div>
              <Button size="sm" variant="secondary" onClick={() => handleTopUp(g)} className="w-full">
                <ArrowUpCircle size={12} /> Top Up
              </Button>
            </div>
          );
        })}
      </div>

      {/* Completed Section */}
      {completedGoals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#111827] mb-3">Completed</h3>
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] divide-y divide-[#E2E8F0]">
            {completedGoals.map(g => (
              <div key={g.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xl">{g.emoji}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#111827]">{g.name} ✅</p>
                  <p className="text-2xs text-[#9CA3AF]">Completed {g.completedAt}</p>
                </div>
                <span className="text-xs font-medium text-[#15803D]">{formatCurrency(g.targetAmount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeGoals.length === 0 && completedGoals.length === 0 && (
        <div className="text-center py-16">
          <Target size={48} className="mx-auto text-[#C5D0FF] mb-4" />
          <h3 className="text-md font-semibold text-[#111827] mb-2">No goals yet</h3>
          <p className="text-xs text-[#6B7280] mb-4">Create your first savings goal</p>
          <Button onClick={() => setIsModalOpen(true)}><Plus size={14} /> New Goal</Button>
        </div>
      )}

      {/* Add Goal Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Goal">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#6B7280] mb-1.5 block">Goal Name</label>
            <input
              type="text"
              placeholder="e.g. iPad Pro"
              value={name}
              onChange={(e) => { setName(e.target.value); setEmoji(suggestEmoji(e.target.value)); }}
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[10px] focus:outline-none focus:border-[#3B5BDB]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B7280] mb-1.5 block">Emoji</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-[80px] px-3 py-2 text-xl border border-[#E2E8F0] rounded-[10px] focus:outline-none focus:border-[#3B5BDB] text-center"
              maxLength={2}
            />
            <p className="text-2xs text-[#9CA3AF] mt-1">Auto-suggested based on name</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B7280] mb-1.5 block">Target Amount (USD)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="1200"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[10px] focus:outline-none focus:border-[#3B5BDB]"
            />
          </div>
          <Button onClick={handleAdd} disabled={!name || !target} className="w-full">
            <Target size={14} /> Create Goal
          </Button>
        </div>
      </Modal>

      {/* Top Up Modal */}
      <Modal isOpen={!!topUpGoal} onClose={() => { setTopUpGoal(null); setTopUpAmount(''); }} title="Top Up">
        {topUpGoal && (
          <div className="space-y-5">
            {/* Goal info header */}
            <div className="flex items-center gap-3">
              <span className="text-3xl">{topUpGoal.emoji}</span>
              <div>
                <h3 className="text-base font-semibold text-[#111827]">{topUpGoal.name}</h3>
                <p className="text-xs text-[#6B7280]">{formatCurrency(topUpGoal.savedAmount)} of {formatCurrency(topUpGoal.targetAmount)}</p>
              </div>
            </div>

            {/* Animated progress bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-[#6B7280]">Progress</span>
                <span className="text-xs font-semibold text-[#3B5BDB]">
                  {topUpGoal.targetAmount > 0
                    ? Math.min((topUpGoal.savedAmount / topUpGoal.targetAmount) * 100, 100).toFixed(0)
                    : 0}%
                </span>
              </div>
              <div className="h-4 rounded-full bg-[#EEF2FF] overflow-hidden">
                <div
                  className="h-4 rounded-full bg-gradient-to-r from-[#3B5BDB] to-[#4F6EF7] transition-all duration-700 ease-out"
                  style={{
                    width: `${
                      topUpGoal.targetAmount > 0
                        ? Math.min((topUpGoal.savedAmount / topUpGoal.targetAmount) * 100, 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Amount breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F9FAFB] border border-[#E2E8F0] rounded-[10px] p-3 text-center">
                <p className="text-2xs text-[#6B7280] mb-0.5">Saved</p>
                <p className="text-base font-bold text-[#111827]">{formatCurrency(topUpGoal.savedAmount)}</p>
              </div>
              <div className="bg-[#F9FAFB] border border-[#E2E8F0] rounded-[10px] p-3 text-center">
                <p className="text-2xs text-[#6B7280] mb-0.5">Target</p>
                <p className="text-base font-bold text-[#111827]">{formatCurrency(topUpGoal.targetAmount)}</p>
              </div>
            </div>

            {/* Remaining */}
            <div className="text-center">
              <p className="text-xs text-[#6B7280]">
                Remaining: <span className="font-semibold text-[#111827]">{formatCurrency(Math.max(0, topUpGoal.targetAmount - topUpGoal.savedAmount))}</span>
              </p>
            </div>

            {/* Amount input */}
            <div>
              <label className="text-xs font-medium text-[#6B7280] mb-1.5 block">Amount to Add (USD)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 50"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="w-full px-3 py-2.5 text-base border border-[#E2E8F0] rounded-[10px] focus:outline-none focus:border-[#3B5BDB]"
                autoFocus
              />
              {topUpAmount && parseFloat(topUpAmount) > 0 && (
                <p className="text-2xs text-[#6B7280] mt-1">
                  New total: <span className="font-medium text-[#111827]">{formatCurrency(topUpGoal.savedAmount + parseFloat(topUpAmount))}</span>
                  {topUpGoal.savedAmount + parseFloat(topUpAmount) >= topUpGoal.targetAmount && (
                    <span className="ml-1 text-[#15803D]">🎉 Goal complete!</span>
                  )}
                </p>
              )}
            </div>

            <Button
              onClick={handleConfirmTopUp}
              disabled={!topUpAmount || parseFloat(topUpAmount) <= 0}
              className="w-full"
            >
              <ArrowUpCircle size={14} /> Confirm Top Up
            </Button>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
