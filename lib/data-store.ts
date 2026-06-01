import type { Achievements, FinixUserData, MonthlySummary } from '@/types/finix';

export function createEmptyUserData(walletAddress: string): FinixUserData {
  return {
    version: 1,
    profile: {
      displayName: walletAddress.slice(0, 6).toUpperCase(),
      createdAt: new Date().toISOString(),
      currency: 'USD',
      monthlyTargetSavingRate: 30,
    },
    transactions: [],
    goals: [],
    achievements: {
      firstTransaction: false,
      streak7: false,
      streak30: false,
      firstGoal: false,
      goalCompleted: false,
      savingRate50: false,
      transactions100: false,
      antiBoros: false,
    },
    streaks: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
    },
    lastUpdated: new Date().toISOString(),
  };
}

export function computeMonthlySummary(data: FinixUserData, month: string): MonthlySummary {
  const txs = data.transactions.filter((t) => t.date.startsWith(month));

  let totalIncome = 0;
  let totalExpense = 0;
  const byCategory: Record<string, number> = {};
  const bySource: Record<string, number> = {};

  for (const t of txs) {
    if (t.type === 'income') {
      totalIncome += t.amount;
      const src = t.source || 'other';
      bySource[src] = (bySource[src] || 0) + t.amount;
    } else {
      totalExpense += t.amount;
      const cat = t.category || 'other';
      byCategory[cat] = (byCategory[cat] || 0) + t.amount;
    }
  }

  const netBalance = totalIncome - totalExpense;
  const savingRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  return { month, totalIncome, totalExpense, netBalance, savingRate, byCategory, bySource };
}

export function getLast6Months(): string[] {
  const months: string[] = [];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export function computeAllSummaries(data: FinixUserData): MonthlySummary[] {
  return getLast6Months().map((m) => computeMonthlySummary(data, m));
}

export function updateStreak(data: FinixUserData): FinixUserData {
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  const streaks = { ...data.streaks };
  const lastActive = streaks.lastActiveDate;
  const hasActivityToday = data.transactions.some((t) => t.date === today);

  if (!hasActivityToday) {
    return { ...data, streaks };
  }

  if (lastActive === today) {
    return { ...data, streaks };
  }

  if (lastActive === yesterday || lastActive === '') {
    streaks.currentStreak += 1;
  } else if (lastActive !== today) {
    streaks.currentStreak = 1;
  }

  streaks.longestStreak = Math.max(streaks.longestStreak, streaks.currentStreak);
  streaks.lastActiveDate = today;

  const updated = { ...data, streaks };
  updated.achievements = checkAchievements(updated);

  return updated;
}

export function checkAchievements(data: FinixUserData): Achievements {
  const achievements = { ...data.achievements };

  achievements.firstTransaction = data.transactions.length > 0;
  achievements.firstGoal = data.goals.length > 0;
  achievements.goalCompleted = data.goals.some((g) => g.completedAt);
  achievements.transactions100 = data.transactions.length >= 100;
  achievements.streak7 = data.streaks.currentStreak >= 7;
  achievements.streak30 = data.streaks.currentStreak >= 30;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthSummary = computeMonthlySummary(data, currentMonth);
  achievements.savingRate50 = monthSummary.savingRate >= 50;
  achievements.antiBoros = monthSummary.totalExpense < monthSummary.totalIncome * 0.3;

  return achievements;
}
