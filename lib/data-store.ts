import type { FinixUserData, Transaction, Achievements, MonthlySummary, ExpenseCategory, IncomeSource } from '@/types/finix';

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// MOCK DATA — used for demo / development before real Walrus integration
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

export function generateMockData(): FinixUserData {
  const today = new Date();
  const data = createEmptyUserData('0xmock');
  
  data.profile.displayName = 'Satya';
  data.profile.monthlyTargetSavingRate = 30;
  
  // Generate transactions for last 6 months
  const categories: Array<{ cat: string; type: 'expense' | 'income' }> = [
    { cat: 'food', type: 'expense' },
    { cat: 'transport', type: 'expense' },
    { cat: 'bills', type: 'expense' },
    { cat: 'entertainment', type: 'expense' },
    { cat: 'fashion', type: 'expense' },
    { cat: 'health', type: 'expense' },
    { cat: 'salary', type: 'income' },
    { cat: 'freelance', type: 'income' },
  ];

  const descriptions: Record<string, string[]> = {
    food: ['Nasi Padang', 'Sushi', 'Coffee', 'Bakso', 'Mie Ayam', 'Burger', 'Pizza'],
    transport: ['Gojek', 'Grab', 'Bensin', 'Tol', 'Parkir', 'Taxi'],
    bills: ['Listrik', 'Internet', 'Air', 'Telpon', 'Netflix', 'Spotify'],
    entertainment: ['Movie', 'Concert', 'Game', 'Streaming', 'Books'],
    fashion: ['Kaos', 'Sepatu', 'Jaket', 'Celana', 'Tas'],
    health: ['Vitamins', 'Dokter', 'Gym', 'Obat'],
    salary: ['Monthly Salary', 'Bonus'],
    freelance: ['Design Project', 'Coding Gig', 'Consultation', 'Writing'],
  };

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const numTransactions = Math.floor(Math.random() * 15) + 10;

    for (let i = 0; i < numTransactions; i++) {
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const dateStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const catName = cat.cat;
      
      if (cat.type === 'expense') {
        const descs = descriptions[catName] || ['Item'];
        const t: Transaction = {
          id: generateId(),
          type: 'expense' as const,
          category: catName as ExpenseCategory,
          amount: Number((Math.random() * 150 + 5).toFixed(2)),
          currency: 'USD',
          description: descs[Math.floor(Math.random() * descs.length)],
          date: dateStr,
          createdAt: new Date(dateStr).toISOString(),
        };
        data.transactions.push(t);
      } else {
        const descs = descriptions[catName] || ['Income'];
        const t: Transaction = {
          id: generateId(),
          type: 'income' as const,
          source: catName as IncomeSource,
          amount: Number((Math.random() * 3000 + 500).toFixed(2)),
          currency: 'USD',
          description: descs[Math.floor(Math.random() * descs.length)],
          date: dateStr,
          createdAt: new Date(dateStr).toISOString(),
        };
        data.transactions.push(t);
      }
    }
  }

  // Sort by date descending
  data.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Add goals
  data.goals = [
    { id: generateId(), name: 'iPad Pro', emoji: '💻', targetAmount: 1200, savedAmount: 450, currency: 'USD', createdAt: '2026-04-01T00:00:00Z', completedAt: undefined },
    { id: generateId(), name: 'Vacation to Bali', emoji: '✈️', targetAmount: 2000, savedAmount: 800, currency: 'USD', createdAt: '2026-03-15T00:00:00Z', completedAt: undefined },
    { id: generateId(), name: 'Emergency Fund', emoji: '🎯', targetAmount: 5000, savedAmount: 1500, currency: 'USD', createdAt: '2026-01-01T00:00:00Z', completedAt: undefined },
  ];

  data.streaks = { currentStreak: 12, longestStreak: 28, lastActiveDate: today.toISOString().split('T')[0] };
  data.achievements.firstTransaction = true;
  data.achievements.firstGoal = true;
  data.achievements.streak7 = true;
  data.lastUpdated = today.toISOString();

  return data;
}

// Analytics helpers
export function computeMonthlySummary(data: FinixUserData, month: string): MonthlySummary {
  const prefix = month; // "YYYY-MM"
  const txs = data.transactions.filter(t => t.date.startsWith(prefix));
  
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
  return getLast6Months().map(m => computeMonthlySummary(data, m));
}

export function updateStreak(data: FinixUserData): FinixUserData {
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  const streaks = { ...data.streaks };
  const lastActive = streaks.lastActiveDate;

  // Check if user added a transaction TODAY
  const hasActivityToday = data.transactions.some(t => t.date === today);

  if (!hasActivityToday) {
    // No activity today — no change to streak
    return { ...data, streaks };
  }

  if (lastActive === today) {
    // Already counted today — no change
    return { ...data, streaks };
  }

  // New activity today
  if (lastActive === yesterday || lastActive === '') {
    // Consecutive day — increment
    streaks.currentStreak += 1;
  } else if (lastActive !== today) {
    // Gap — reset to 1
    streaks.currentStreak = 1;
  }

  streaks.longestStreak = Math.max(streaks.longestStreak, streaks.currentStreak);
  streaks.lastActiveDate = today;

  const updated = { ...data, streaks };

  // Re-check achievements after streak update
  updated.achievements = checkAchievements(updated);

  return updated;
}

export function checkAchievements(data: FinixUserData): Achievements {
  const achievements = { ...data.achievements };
  
  achievements.firstTransaction = data.transactions.length > 0;
  achievements.firstGoal = data.goals.length > 0;
  achievements.goalCompleted = data.goals.some(g => g.completedAt);
  achievements.transactions100 = data.transactions.length >= 100;
  achievements.streak7 = data.streaks.currentStreak >= 7;
  achievements.streak30 = data.streaks.currentStreak >= 30;
  
  // Check saving rate for current month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthSummary = computeMonthlySummary(data, currentMonth);
  achievements.savingRate50 = monthSummary.savingRate >= 50;
  achievements.antiBoros = monthSummary.totalExpense < monthSummary.totalIncome * 0.3;
  
  return achievements;
}
