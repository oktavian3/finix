"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useFinixData } from "@/hooks/useFinixData";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/Button";
import { Wallet, Rocket, Flame, Medal, Target, Trophy, Gem, Shield, Banknote } from "lucide-react";

const badges = [
  { id: 'firstTransaction', name: 'First Step', icon: Rocket, desc: 'First transaction ever', hint: 'Add your first transaction' },
  { id: 'streak7', name: 'Week Warrior', icon: Flame, desc: '7 day streak', hint: 'Use the app daily for a week' },
  { id: 'streak30', name: 'Month Master', icon: Medal, desc: '30 day streak', hint: 'Use the app daily for a month' },
  { id: 'transactions100', name: 'Century Club', icon: Banknote, desc: '100 transactions total', hint: 'Add 100 transactions' },
  { id: 'firstGoal', name: 'First Goal', icon: Target, desc: 'Created first goal', hint: 'Create a savings goal' },
  { id: 'goalCompleted', name: 'Goal Crusher', icon: Trophy, desc: 'Completed a goal', hint: 'Complete a savings goal' },
  { id: 'savingRate50', name: 'Super Saver', icon: Gem, desc: '50%+ saving rate for 1 month', hint: 'Save at least 50% of income' },
  { id: 'antiBoros', name: 'Anti Boros', icon: Shield, desc: 'Expenses < 30% of income', hint: 'Keep expenses under 30%' },
];

export default function AchievementsPage() {
  const { data } = useFinixData();
  const { isConnected, connect, isConnecting, address } = useWallet();

  const earnedCount = Object.values(data.achievements).filter(Boolean).length;
  const totalBadges = badges.length;

  if (!isConnected) {
    return (
      <AppShell title="Achievements">
        <div className="flex flex-col items-center justify-center py-24">
          <Wallet size={48} className="text-[#1E293B] mb-4" />
          <Button size="lg" onClick={connect} loading={isConnecting}><Wallet size={15} /> CONNECT WALLET</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Achievements"
      subtitle={`${data.streaks.currentStreak}D_STREAK // ${earnedCount}/${totalBadges}_BADGES`}
      topbarExtra={
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#111827] border border-[#1E293B]">
          <span className="flex h-[5px] w-[5px] items-center justify-center rounded-full bg-[#15803D] animate-pulse" />
          <span className="text-[10px] font-mono text-[#9CA3AF]">NODE: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
      }
    >
      {/* Section /01 — Streak Stats */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono text-[#3B5BDB]">/01</span>
          <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">STREAKS</span>
          <div className="flex-1 h-px bg-[#1E293B]" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#111827] border border-[#1E293B] p-4 text-center relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#C2410C]" />
            <Flame size={18} className="mx-auto text-[#C2410C] mb-1" />
            <p className="text-[18px] font-mono font-bold text-white">{data.streaks.currentStreak}</p>
            <p className="text-[9px] font-mono text-[#6B7280] uppercase">CURRENT</p>
          </div>
          <div className="bg-[#111827] border border-[#1E293B] p-4 text-center relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#D97706]" />
            <Medal size={18} className="mx-auto text-[#D97706] mb-1" />
            <p className="text-[18px] font-mono font-bold text-white">{data.streaks.longestStreak}</p>
            <p className="text-[9px] font-mono text-[#6B7280] uppercase">LONGEST</p>
          </div>
          <div className="bg-[#111827] border border-[#1E293B] p-4 text-center relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#15803D]" />
            <Banknote size={18} className="mx-auto text-[#15803D] mb-1" />
            <p className="text-[18px] font-mono font-bold text-white">{data.transactions.length}</p>
            <p className="text-[9px] font-mono text-[#6B7280] uppercase">TRANSACTIONS</p>
          </div>
          <div className="bg-[#111827] border border-[#1E293B] p-4 text-center relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#3B5BDB]" />
            <Trophy size={18} className="mx-auto text-[#3B5BDB] mb-1" />
            <p className="text-[18px] font-mono font-bold text-white">{earnedCount}/{totalBadges}</p>
            <p className="text-[9px] font-mono text-[#6B7280] uppercase">BADGES</p>
          </div>
        </div>
      </div>

      {/* Section /02 — Badge Grid */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono text-[#3B5BDB]">/02</span>
          <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">BADGES</span>
          <div className="flex-1 h-px bg-[#1E293B]" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {badges.map(badge => {
            const isEarned = data.achievements[badge.id as keyof typeof data.achievements];
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`border p-4 transition-all duration-150 ${
                  isEarned
                    ? 'bg-[#111827] border-[#1E293B] hover:border-[#334155]'
                    : 'bg-[#0A0E1A]/50 border-[#1E293B]/50 opacity-50'
                }`}
              >
                <div className={`mb-2 ${isEarned ? 'text-[#3B5BDB]' : 'text-[#334155]'}`}>
                  <Icon size={28} className={isEarned ? '' : 'grayscale'} />
                </div>
                <h4 className={`text-[11px] font-mono font-semibold ${isEarned ? 'text-white' : 'text-[#6B7280]'}`}>
                  {badge.name.toUpperCase()}
                </h4>
                <p className={`text-[10px] font-mono mt-1 ${isEarned ? 'text-[#9CA3AF]' : 'text-[#334155]'}`}>
                  {isEarned ? badge.desc : badge.hint}
                </p>
                {isEarned && <span className="mt-1.5 inline-block text-[9px] font-mono text-[#15803D] font-medium">✓ EARNED</span>}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
