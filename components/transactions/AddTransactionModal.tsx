"use client";

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';
import { useFinixData } from '@/hooks/useFinixData';
import { updateStreak } from '@/lib/data-store';
import { Utensils, Car, ShoppingBag, Zap, Film, Heart, BookOpen, MoreHorizontal, Briefcase, Code, TrendingUp, Plane, Repeat, ArrowUpRight, DollarSign, ShoppingCart, CreditCard, CheckCircle2, ExternalLink } from 'lucide-react';
import { walrusStore } from '@/lib/walrus-client';
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
  const [successBlobId, setSuccessBlobId] = useState<string | null>(null);

  const reset = () => {
    setStep(1);
    setType(null);
    setSelectedCategory(null);
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsSaving(false);
    setSuccessBlobId(null);
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

    const updated = { ...data, transactions: [newTransaction, ...data.transactions] };
    const updatedWithStreak = updateStreak(updated);
    localStorage.setItem(`finix_blob_${data.profile.displayName}`, JSON.stringify(updatedWithStreak));
    updateData(updatedWithStreak);

    try {
      const { blobId, objectId } = await walrusStore(updatedWithStreak);
      setSuccessBlobId(objectId || blobId);
      showToast('success', 'Transaction saved to Walrus');
    } catch (err) {
      console.error('Walrus storage failed:', err);
      showToast('error', 'Failed to save to Walrus', 'Data saved locally only');
      handleClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessBlobId(null);
    handleClose();
  };

  return (
    <>
      <Modal isOpen={isOpen && !successBlobId} onClose={handleClose} title="Add Transaction" size="md">
        {step === 1 && (
          <div className="animate-fade-in">
            <p className="text-xs text-[#6B7280] mb-4">Select transaction type</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setType('income'); setStep(2); }}
                className="flex flex-col items-center gap-2 p-6 rounded-[12px] border border-[#E2E8F0] bg-white hover:bg-[#F0FDF4] hover:border-[#BBF7D0] hover:shadow-md hover:shadow-[#15803D]/10 transition-all duration-200 btn-press group"
              >
                <span className="flex items-center gap-1.5 text-2xl transition-transform duration-200 group-hover:scale-110">
                  <TrendingUp size={22} className="text-[#15803D]" />
                  <DollarSign size={22} className="text-[#15803D]" />
                </span>
                <span className="text-sm font-semibold text-[#15803D]">Income</span>
                <span className="text-xs text-[#6B7280]">Money coming in</span>
              </button>
              <button
                onClick={() => { setType('expense'); setStep(2); }}
                className="flex flex-col items-center gap-2 p-6 rounded-[12px] border border-[#E2E8F0] bg-white hover:bg-[#FFF5F5] hover:border-[#FECACA] hover:shadow-md hover:shadow-[#B91C1C]/10 transition-all duration-200 btn-press group"
              >
                <span className="flex items-center gap-1.5 text-2xl transition-transform duration-200 group-hover:scale-110">
                  <ShoppingCart size={22} className="text-[#B91C1C]" />
                  <CreditCard size={22} className="text-[#B91C1C]" />
                </span>
                <span className="text-sm font-semibold text-[#B91C1C]">Expense</span>
                <span className="text-xs text-[#6B7280]">Money going out</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && type === 'expense' && (
          <div className="animate-fade-in">
            <p className="text-xs text-[#6B7280] mb-4">Select category</p>
            <div className="grid grid-cols-4 gap-2">
              {expenseCategories.map((cat, i) => (
                <button
                  key={cat.key}
                  onClick={() => { setSelectedCategory(cat.key); setStep(3); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-[10px] border border-[#E2E8F0] hover:bg-[#EEF2FF] hover:border-[#C5D0FF] hover:shadow-md hover:shadow-[#3B5BDB]/10 transition-all duration-200 btn-press group"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <cat.icon size={18} className="text-[#3B5BDB] transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-2xs text-[#374151] text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && type === 'income' && (
          <div className="animate-fade-in">
            <p className="text-xs text-[#6B7280] mb-4">Select source</p>
            <div className="grid grid-cols-3 gap-2">
              {incomeSources.map((src, i) => (
                <button
                  key={src.key}
                  onClick={() => { setSelectedCategory(src.key); setStep(3); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-[10px] border border-[#E2E8F0] hover:bg-[#F0FDF4] hover:border-[#BBF7D0] hover:shadow-md hover:shadow-[#15803D]/10 transition-all duration-200 btn-press group"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <src.icon size={18} className="text-[#15803D] transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-2xs text-[#374151] text-center">{src.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="text-xs font-medium text-[#6B7280] mb-1.5 block">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-md font-semibold text-[#374151]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 text-lg font-semibold border border-[#E2E8F0] rounded-[10px] focus:outline-none focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/20 transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#6B7280] mb-1.5 block">Description (optional)</label>
              <input
                type="text"
                placeholder={type === 'income' ? 'e.g. Salary, Trading, Yield' : 'e.g. Food, Transport, Health, Beauty'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[10px] focus:outline-none focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/20 transition-all duration-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#6B7280] mb-1.5 block">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[10px] focus:outline-none focus:border-[#3B5BDB] focus:ring-2 focus:ring-[#3B5BDB]/20 transition-all duration-200"
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

      {/* Success modal with real blob explorer link */}
      {successBlobId && (
        <Modal isOpen={true} onClose={handleCloseSuccess} size="sm">
          <div className="flex flex-col items-center text-center py-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-[#15803D]" />
            </div>
            <h3 className="text-lg font-semibold text-[#111827] mb-1">Transaction Saved!</h3>
            <p className="text-xs text-[#6B7280] mb-6">
              Your data has been stored permanently on Walrus on Sui.
            </p>
            <div className="w-full bg-[#F9FAFB] rounded-[10px] px-4 py-2.5 mb-5 border border-[#E2E8F0]">
              <p className="text-2xs text-[#6B7280] mb-0.5">Blob ID</p>
              <p className="text-xs text-[#374151] font-mono break-all">{successBlobId}</p>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="secondary"
                onClick={handleCloseSuccess}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  const network = process.env.NEXT_PUBLIC_WALRUS_NETWORK || 'mainnet';
                  const base = network === 'testnet' ? 'testnet' : 'mainnet';
                  window.open(`https://suiscan.xyz/${base}/object/${successBlobId}`, '_blank', 'noopener,noreferrer');
                }}
                className="flex-1"
              >
                <ExternalLink size={14} />
                View on Sui Explorer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
