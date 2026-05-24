export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'food' | 'transport' | 'fashion' | 'bills'
  | 'entertainment' | 'health' | 'education' | 'other';

export type IncomeSource =
  | 'salary' | 'freelance' | 'yield' | 'airdrop' | 'transfer' | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  category?: ExpenseCategory;
  source?: IncomeSource;
  amount: number;
  currency: 'USD';
  description?: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO
}

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  currency: 'USD';
  createdAt: string;
  completedAt?: string;
}

export interface UserProfile {
  displayName: string;
  createdAt: string;
  currency: 'USD';
  monthlyTargetSavingRate: number;
}

export interface Achievements {
  firstTransaction: boolean;
  streak7: boolean;
  streak30: boolean;
  firstGoal: boolean;
  goalCompleted: boolean;
  savingRate50: boolean;
  transactions100: boolean;
  antiBoros: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

export interface FinixUserData {
  version: number;
  profile: UserProfile;
  transactions: Transaction[];
  goals: Goal[];
  achievements: Achievements;
  streaks: StreakData;
  lastUpdated: string;
}

export interface MonthlySummary {
  month: string; // "YYYY-MM"
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingRate: number;
  byCategory: Record<string, number>;
  bySource: Record<string, number>;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}
