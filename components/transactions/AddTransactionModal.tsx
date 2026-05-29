"use client";

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import { useFinixData } from '@/hooks/useFinixData';
import { Utensils, Car, ShoppingBag, Zap, Film, Heart, BookOpen, MoreHorizontal, Briefcase, Code, TrendingUp, Plane, Repeat, ArrowUpRight } from 'lucide-react';
import type { Transaction, ExpenseCategory, IncomeSource } from '@/types/finix';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import { LucideIcon } from 'lucide-react';

const expenseCategories: Array<{ key: ExpenseCategory; label: string; icon: LucideIcon }> = [
  { key: 'food', label: 'Food & Drinks', icon: Utensils },
  { key: 'transport', label: 'Transport', icon: Car },
  { key: 'fashion', label: 'Fashion', icon: ShoppingBag },
  { key: 'bills', label: 'Bills & Utilities', icon: Zap },
  { key: 'entertainment', label: 'Entertainment', icon: Film },
  { key: 'health', label: 'Health', icon: Heart },
  { key: 'education', label: 'Education', icon: BookOpen },
  { key: 'other', label: 'Other', icon: MoreHorizontal },
];

const incomeSources: Array<{ key: IncomeSource; label: string; icon: LucideIcon }> = [
  { key: 'salary', label: 'Salary', icon: Briefcase },
  { key: 'freelance', label: 'Freelance', icon: Code },
  { key: 'yield', label: 'Yield', icon: TrendingUp },
  { key: 'airdrop', label: 'Airdrop', icon: Plane },
  { key: 'transfer', label: 'Transfer', icon: Repeat },
  { key: 'other', label: 'Other', icon: MoreHorizontal },
];

export function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const { data, updateData } = useFinixData();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'expense' | 'income' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  const reset = () => {
    setStep(1);
    setType(null);
    setSelectedCategory(null);
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsSaving(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!type || !amount) return;
    setIsSaving(true);

    const newTransaction: Transaction = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      category: type === 'expense' ? (selectedCategory as ExpenseCategory) : undefined,
      source: type === 'income' ? (selectedCategory as IncomeSource) : undefined,
      amount: parseFloat(amount),
      currency: 'USD',
      description: description || undefined,
      date,
      createdAt: new Date().toISOString(),
    };

    // Simulate saving
    await new Promise(r => setTimeout(r, 500));

    const updated = { ...data, transactions: [newTransaction, ...data.transactions] };
    localStorage.setItem(`finix_blob_${data.profile.displayName}`, JSON.stringify(updated));
    updateData(updated);
    showToast('success', 'Transaction added', 'Saved to Walrus ✓');
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Transaction" size="md">
      {step === 1 && (
        <div>
          <p className="text-[12px] text-[#6B7280] mb-4">Select transaction type</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setType('expense'); setStep(2); }}
              className="flex flex-col items-center gap-2 p-6 rounded-[12px] border border-[#E2E8F0] bg-white hover:bg-[#FFF5F5] hover:border-[#FECACA] transition-all"
            >
              <span className="text-[24px]">💳</span>
              <span className="text-[13px] font-semibold text-[#B91C1C]">Expense</span>
              <span className="text-[11px] text-[#6B7280]">Money going out</span>
            </button>
            <button
              onClick={() => { setType('income'); setStep(2); }}
              className="flex flex-col items-center gap-2 p-6 rounded-[12px] border border-[#E2E8F0] bg-white hover:bg-[#F0FDF4] hover:border-[#BBF7D0] transition-all"
            >
              <span className="text-[24px]">💰</span>
              <span className="text-[13px] font-semibold text-[#15803D]">Income</span>
              <span className="text-[11px] text-[#6B7280]">Money coming in</span>
            </button>
          </div>
        </div>
      )}

      {step === 2 && type === 'expense' && (
        <div>
          <p className="text-[12px] text-[#6B7280] mb-4">Select category</p>
          <div className="grid grid-cols-4 gap-2">
            {expenseCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => { setSelectedCategory(cat.key); setStep(3); }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-[10px] border border-[#E2E8F0] hover:bg-[#EEF2FF] hover:border-[#C5D0FF] transition-all"
              >
                <cat.icon size={18} className="text-[#3B5BDB]" />
                <span className="text-[10px] text-[#374151] text-center">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && type === 'income' && (
        <div>
          <p className="text-[12px] text-[#6B7280] mb-4">Select source</p>
          <div className="grid grid-cols-3 gap-2">
            {incomeSources.map(src => (
              <button
                key={src.key}
                onClick={() => { setSelectedCategory(src.key); setStep(3); }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-[10px] border border-[#E2E8F0] hover:bg-[#F0FDF4] hover:border-[#BBF7D0] transition-all"
              >
                <src.icon size={18} className="text-[#15803D]" />
                <span className="text-[10px] text-[#374151] text-center">{src.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-medium text-[#6B7280] mb-1.5 block">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-[#374151]">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 text-[18px] font-semibold border border-[#E2E8F0] rounded-[10px] focus:outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB]/20"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-[#6B7280] mb-1.5 block">Description (optional)</label>
            <input
              type="text"
              placeholder="e.g. Nasi Padang"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[10px] focus:outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB]/20"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-[#6B7280] mb-1.5 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-[13px] border border-[#E2E8F0] rounded-[10px] focus:outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB]/20"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
            <Button
              onClick={handleSave}
              loading={isSaving}
              disabled={!amount || parseFloat(amount) <= 0}
              className="flex-1"
            >
              <ArrowUpRight size={14} />
              Save to Walrus
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
