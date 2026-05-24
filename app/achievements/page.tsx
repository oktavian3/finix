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
          <Wallet size={48} className="text-[#C5D0FF] mb-4" />
          <Button size="lg" onClick={connect} loading={isConnecting}><Wallet size={16} /> Connect Wallet</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Achievements"
      subtitle={`${data.streaks.currentStreak} day streak · ${earnedCount}/${totalBadges} badges earned`}
      topbarExtra={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-[#EEF2FF] border border-[#C5D0FF]">
            <Wallet size={12} className="text-[#3B5BDB]" />
            <span className="text-[11px] font-medium text-[#374151]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
        </div>
      }
    >
      {/* Stat Streaks */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 text-center">
          <Flame size={20} className="mx-auto text-[#C2410C] mb-1" />
          <p className="text-[20px] font-bold text-[#111827]">{data.streaks.currentStreak}</p>
          <p className="text-[10px] text-[#6B7280]">Current streak</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 text-center">
          <Medal size={20} className="mx-auto text-[#D97706] mb-1" />
          <p className="text-[20px] font-bold text-[#111827]">{data.streaks.longestStreak}</p>
          <p className="text-[10px] text-[#6B7280]">Longest streak</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 text-center">
          <Banknote size={20} className="mx-auto text-[#15803D] mb-1" />
          <p className="text-[20px] font-bold text-[#111827]">{data.transactions.length}</p>
          <p className="text-[10px] text-[#6B7280]">Transactions</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 text-center">
          <Trophy size={20} className="mx-auto text-[#3B5BDB] mb-1" />
          <p className="text-[20px] font-bold text-[#111827]">{earnedCount}/{totalBadges}</p>
          <p className="text-[10px] text-[#6B7280]">Badges earned</p>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-4 gap-4">
        {badges.map(badge => {
          const isEarned = data.achievements[badge.id as keyof typeof data.achievements];
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className={`border rounded-[12px] p-5 transition-all ${
                isEarned
                  ? 'bg-white border-[#E2E8F0]'
                  : 'bg-[#F9FAFB] border-[#E2E8F0] opacity-60'
              }`}
            >
              <div className={`mb-3 ${isEarned ? 'text-[#3B5BDB]' : 'text-[#D1D5DB]'}`}>
                <Icon size={32} className={isEarned ? '' : 'grayscale'} />
              </div>
              <h4 className={`text-[13px] font-semibold ${isEarned ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>
                {badge.name}
              </h4>
              <p className={`text-[11px] mt-1 ${isEarned ? 'text-[#6B7280]' : 'text-[#D1D5DB]'}`}>
                {isEarned ? badge.desc : badge.hint}
              </p>
              {isEarned && <span className="mt-2 text-[11px] text-[#15803D] font-medium">✓ Earned</span>}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
