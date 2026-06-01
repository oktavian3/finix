"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useFinixData } from "@/hooks/useFinixData";
import { useWallet } from "@/hooks/useWallet";
import { Award, Banknote, Flame, Medal, Rocket, Shield, Target, Trophy, Wallet, Gem } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const badges: Array<{ id: keyof ReturnType<typeof useFinixData>["data"]["achievements"]; name: string; icon: LucideIcon; desc: string; hint: string }> = [
  { id: "firstTransaction", name: "First Step", icon: Rocket, desc: "First transaction recorded", hint: "Add your first transaction" },
  { id: "streak7", name: "Weekly Rhythm", icon: Flame, desc: "7 day activity streak", hint: "Use Finix daily for a week" },
  { id: "streak30", name: "Monthly Rhythm", icon: Medal, desc: "30 day activity streak", hint: "Use Finix daily for a month" },
  { id: "transactions100", name: "Record Builder", icon: Banknote, desc: "100 transactions recorded", hint: "Add 100 transactions" },
  { id: "firstGoal", name: "Goal Setter", icon: Target, desc: "First goal created", hint: "Create a savings goal" },
  { id: "goalCompleted", name: "Goal Completed", icon: Trophy, desc: "Completed a savings goal", hint: "Complete a savings goal" },
  { id: "savingRate50", name: "High Saving Rate", icon: Gem, desc: "50%+ saving rate for a month", hint: "Reach a 50% saving rate" },
  { id: "antiBoros", name: "Lean Month", icon: Shield, desc: "Expenses below 30% of income", hint: "Keep expenses below 30% of income" },
];

export default function AchievementsPage() {
  const { data } = useFinixData();
  const { isConnected, connect, isConnecting, address } = useWallet();

  const earnedCount = Object.values(data.achievements).filter(Boolean).length;
  const totalBadges = badges.length;
  const progress = totalBadges > 0 ? Math.round((earnedCount / totalBadges) * 100) : 0;

  if (!isConnected) {
    return (
      <AppShell title="Achievements">
        <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-[#0B1020] p-8 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.85)]">
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-[#4F6EF7]/30 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
              <Award size={14} />
              Milestone workspace
            </div>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">Milestones unlock from real activity.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">Connect your wallet to view streaks, badges, and progress from your own transaction history.</p>
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
      title="Achievements"
      subtitle={`${data.streaks.currentStreak} day streak - ${earnedCount}/${totalBadges} milestones earned`}
      topbarExtra={
        <div className="flex items-center gap-1.5 rounded-full border border-[#C5D0FF] bg-[#EEF2FF] px-3 py-2">
          <Wallet size={14} className="text-[#3B5BDB]" />
          <span className="text-xs font-bold text-[#374151]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
      }
    >
      <section className="mb-5 overflow-hidden rounded-[28px] border border-white/70 bg-[#0B1020] p-6 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.85)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">Milestone progress</p>
            <h2 className="mt-2 text-4xl font-black">{progress}%</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">Finix only unlocks achievements from real wallet-linked app activity. New users start with a clean state.</p>
          </div>
          <div className="w-full max-w-sm rounded-[22px] border border-white/10 bg-white/10 p-4">
            <div className="mb-3 flex items-center justify-between text-sm font-bold">
              <span>{earnedCount} earned</span>
              <span>{totalBadges} total</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-gradient-to-r from-[#4F6EF7] to-[#8FE5C0]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Current streak", value: data.streaks.currentStreak, icon: Flame, tone: "from-[#FFF7ED] to-white" },
          { label: "Longest streak", value: data.streaks.longestStreak, icon: Medal, tone: "from-[#FEF3C7] to-white" },
          { label: "Transactions", value: data.transactions.length, icon: Banknote, tone: "from-[#ECFDF5] to-white" },
          { label: "Milestones", value: `${earnedCount}/${totalBadges}`, icon: Trophy, tone: "from-[#EEF2FF] to-white" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`rounded-[22px] border border-white/70 bg-gradient-to-br ${stat.tone} p-5 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.65)]`}>
              <Icon size={19} className="mb-3 text-[#3B5BDB]" />
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94A3B8]">{stat.label}</p>
              <p className="mt-2 text-2xl font-black text-[#111827]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {badges.map((badge) => {
          const isEarned = data.achievements[badge.id];
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className={`rounded-[22px] border p-5 shadow-[0_18px_55px_-48px_rgba(15,23,42,0.75)] transition-all duration-200 hover:-translate-y-0.5 ${
                isEarned ? "border-[#C7D2FE] bg-white" : "border-[#E2E8F0] bg-[#F8FAFC]"
              }`}
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${isEarned ? "bg-[#EEF2FF] text-[#3B5BDB]" : "bg-white text-[#CBD5E1]"}`}>
                <Icon size={22} />
              </div>
              <h4 className={`text-sm font-black ${isEarned ? "text-[#111827]" : "text-[#94A3B8]"}`}>{badge.name}</h4>
              <p className={`mt-2 text-xs leading-5 ${isEarned ? "text-[#64748B]" : "text-[#94A3B8]"}`}>{isEarned ? badge.desc : badge.hint}</p>
              <span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${isEarned ? "bg-[#ECFDF5] text-[#15803D]" : "bg-white text-[#94A3B8]"}`}>
                {isEarned ? "Earned" : "Locked"}
              </span>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
