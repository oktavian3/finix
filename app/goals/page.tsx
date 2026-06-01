"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinixData } from "@/hooks/useFinixData";
import { useWallet } from "@/hooks/useWallet";
import { formatCurrency } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { showToast } from "@/components/ui/Toast";
import { ArrowUpCircle, CheckCircle2, Plus, Target, Trash2, Wallet } from "lucide-react";
import type { Goal } from "@/types/finix";

export default function GoalsPage() {
  const { data, updateData, currentSummary } = useFinixData();
  const { isConnected, connect, isConnecting, address } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [topUpGoal, setTopUpGoal] = useState<Goal | null>(null);
  const [topUpAmount, setTopUpAmount] = useState("");

  const activeGoals = data.goals.filter((g) => !g.completedAt);
  const completedGoals = data.goals.filter((g) => g.completedAt);
  const totalSaved = data.goals.reduce((sum, goal) => sum + goal.savedAmount, 0);

  const handleAdd = () => {
    const targetAmount = parseFloat(target);
    if (!name.trim() || Number.isNaN(targetAmount) || targetAmount <= 0) {
      showToast("error", "Invalid goal", "Enter a goal name and a positive target amount");
      return;
    }

    const newGoal: Goal = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      name: name.trim(),
      emoji: "target",
      targetAmount,
      savedAmount: 0,
      currency: "USD",
      createdAt: new Date().toISOString(),
    };

    updateData({ ...data, goals: [...data.goals, newGoal] });
    showToast("success", "Goal created", newGoal.name);
    setIsModalOpen(false);
    setName("");
    setTarget("");
  };

  const handleDelete = (id: string) => {
    updateData({ ...data, goals: data.goals.filter((g) => g.id !== id) });
    showToast("success", "Goal deleted");
  };

  const handleConfirmTopUp = () => {
    if (!topUpGoal) return;
    const amount = parseFloat(topUpAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      showToast("error", "Invalid amount", "Please enter a valid positive number");
      return;
    }

    const updatedGoals = data.goals.map((goal) => {
      if (goal.id !== topUpGoal.id) return goal;
      const savedAmount = goal.savedAmount + amount;
      return {
        ...goal,
        savedAmount,
        ...(savedAmount >= goal.targetAmount ? { completedAt: new Date().toISOString() } : {}),
      };
    });

    updateData({ ...data, goals: updatedGoals });
    showToast("success", "Goal updated", `${formatCurrency(amount)} added to ${topUpGoal.name}`);
    setTopUpGoal(null);
    setTopUpAmount("");
  };

  if (!isConnected) {
    return (
      <AppShell title="Goals">
        <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-[#0B1020] p-8 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.85)]">
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-[#4F6EF7]/30 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
              <Target size={14} />
              Goals workspace
            </div>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">Plan targets from real records.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">Connect your wallet to create savings goals and track progress from your Finix data.</p>
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
      title="Goals"
      subtitle={`${activeGoals.length} active - ${completedGoals.length} completed - ${formatCurrency(totalSaved)} saved`}
      topbarExtra={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-[#C5D0FF] bg-[#EEF2FF] px-3 py-2">
            <Wallet size={14} className="text-[#3B5BDB]" />
            <span className="text-xs font-bold text-[#374151]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
          <Button size="sm" onClick={() => setIsModalOpen(true)}><Plus size={13} /> New Goal</Button>
        </div>
      }
    >
      <section className="mb-5 overflow-hidden rounded-[28px] border border-white/70 bg-[#0B1020] p-6 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.85)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">Savings system</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">{formatCurrency(totalSaved)}</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">Set concrete targets, top them up manually, and let achievements unlock from your real progress.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#111827] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F8FAFC]"
          >
            <Plus size={16} /> Create Goal
          </button>
        </div>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {activeGoals.map((goal) => {
          const progress = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0;
          const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
          const monthlySavings = currentSummary.totalIncome * (currentSummary.savingRate / 100);
          const eta = monthlySavings > 0 ? `${Math.ceil(remaining / monthlySavings)} months` : "Add savings data";

          return (
            <div key={goal.id} className="group rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_18px_55px_-48px_rgba(15,23,42,0.75)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C7D2FE]">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#3B5BDB]">
                    <Target size={22} />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-[#111827]">{goal.name}</h3>
                    <p className="text-xs leading-5 text-[#64748B]">Saved {formatCurrency(goal.savedAmount)} of {formatCurrency(goal.targetAmount)}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(goal.id)} className="rounded-xl p-2 text-[#94A3B8] opacity-0 transition-all duration-200 hover:bg-[#FEF2F2] hover:text-[#B91C1C] group-hover:opacity-100">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="mb-2 h-3 overflow-hidden rounded-full bg-[#EEF2FF]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#3B5BDB] to-[#8FE5C0] transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
              <div className="mb-4 flex items-center justify-between text-xs font-bold">
                <span className="text-[#3B5BDB]">{progress.toFixed(0)}%</span>
                <span className="text-[#94A3B8]">ETA: {eta}</span>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setTopUpGoal(goal)} className="w-full">
                <ArrowUpCircle size={12} /> Top Up
              </Button>
            </div>
          );
        })}
      </div>

      {completedGoals.length > 0 && (
        <div className="mb-6 rounded-[24px] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_55px_-48px_rgba(15,23,42,0.75)]">
          <h3 className="mb-3 text-base font-black text-[#111827]">Completed Goals</h3>
          <div className="divide-y divide-[#E2E8F0]">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-3 py-3">
                <CheckCircle2 size={18} className="text-[#15803D]" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#111827]">{goal.name}</p>
                  <p className="text-xs text-[#94A3B8]">Completed {goal.completedAt ? new Date(goal.completedAt).toLocaleDateString() : ""}</p>
                </div>
                <span className="text-sm font-black text-[#15803D]">{formatCurrency(goal.targetAmount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeGoals.length === 0 && completedGoals.length === 0 && (
        <div className="rounded-[28px] border border-dashed border-[#C7D2FE] bg-white px-6 py-16 text-center shadow-[0_18px_55px_-48px_rgba(15,23,42,0.75)]">
          <Target size={42} className="mx-auto mb-4 text-[#3B5BDB]" />
          <h3 className="text-lg font-black text-[#111827]">No goals yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#64748B]">Create your first target and track progress from your own financial records.</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-5"><Plus size={14} /> New Goal</Button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Goal">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#64748B]">Goal Name</label>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Emergency fund" className="w-full rounded-[12px] border border-[#E2E8F0] px-3 py-2 text-sm focus:border-[#3B5BDB] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#64748B]">Target Amount (USD)</label>
            <input type="number" min="0" step="0.01" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="1200" className="w-full rounded-[12px] border border-[#E2E8F0] px-3 py-2 text-sm focus:border-[#3B5BDB] focus:outline-none" />
          </div>
          <Button onClick={handleAdd} disabled={!name || !target} className="w-full"><Target size={14} /> Create Goal</Button>
        </div>
      </Modal>

      <Modal isOpen={!!topUpGoal} onClose={() => { setTopUpGoal(null); setTopUpAmount(""); }} title="Top Up" size="sm">
        {topUpGoal && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <h3 className="text-base font-black text-[#111827]">{topUpGoal.name}</h3>
              <p className="mt-1 text-xs text-[#64748B]">{formatCurrency(topUpGoal.savedAmount)} of {formatCurrency(topUpGoal.targetAmount)}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#64748B]">Amount to Add (USD)</label>
              <input type="number" min="0.01" step="0.01" value={topUpAmount} onChange={(event) => setTopUpAmount(event.target.value)} placeholder="50" className="w-full rounded-[12px] border border-[#E2E8F0] px-3 py-2.5 text-base focus:border-[#3B5BDB] focus:outline-none" autoFocus />
            </div>
            <Button onClick={handleConfirmTopUp} disabled={!topUpAmount || parseFloat(topUpAmount) <= 0} className="w-full">
              <ArrowUpCircle size={14} /> Confirm Top Up
            </Button>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
