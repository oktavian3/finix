export interface AnalyticsData {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingRate: number;
  byCategory: Record<string, number>;
  bySource: Record<string, number>;
}

export function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthLabel(month: string): string {
  const [y, m] = month.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

export function formatCurrency(amount: number): string {
  return `$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
