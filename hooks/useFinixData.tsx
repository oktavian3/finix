"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { FinixUserData } from '@/types/finix';
import { generateMockData, createEmptyUserData, computeMonthlySummary, computeAllSummaries } from '@/lib/data-store';
import type { MonthlySummary } from '@/types/finix';

interface FinixDataContextType {
  data: FinixUserData;
  isLoading: boolean;
  isConnected: boolean;
  walletAddress: string;
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  updateData: (newData: FinixUserData) => void;
  refreshData: () => void;
  currentSummary: MonthlySummary;
  allSummaries: MonthlySummary[];
  currentMonth: string;
  saveToWalrus: () => Promise<void>;
  isSaving: boolean;
}

const FinixDataContext = createContext<FinixDataContextType | null>(null);

export function FinixDataProvider({ children }: { children: ReactNode }) {
  const [mockData] = useState<FinixUserData>(() => generateMockData());
  const [data, setData] = useState<FinixUserData>(mockData);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentSummary = computeMonthlySummary(data, currentMonth);
  const allSummaries = computeAllSummaries(data);

  const connectWallet = useCallback((address: string) => {
    setWalletAddress(address);
    setIsConnected(true);
    setIsLoading(true);
    // In real app, fetch from Walrus here
    setTimeout(() => {
      const existing = localStorage.getItem(`finix_blob_${address}`);
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          setData(parsed);
        } catch {
          setData(createEmptyUserData(address));
        }
      } else {
        setData(createEmptyUserData(address));
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletAddress('');
    setIsConnected(false);
    setData(mockData);
  }, [mockData]);

  const updateData = useCallback((newData: FinixUserData) => {
    setData(newData);
  }, []);

  const refreshData = useCallback(() => {
    // Re-read from localStorage
    if (walletAddress) {
      const existing = localStorage.getItem(`finix_blob_${walletAddress}`);
      if (existing) {
        try {
          setData(JSON.parse(existing));
        } catch { /* ignore */ }
      }
    }
  }, [walletAddress]);

  const saveToWalrus = useCallback(async () => {
    if (!walletAddress) return;
    setIsSaving(true);
    try {
      // In real app: sign + write to Walrus
      await new Promise(r => setTimeout(r, 1500));
      localStorage.setItem(`finix_blob_${walletAddress}`, JSON.stringify(data));
    } finally {
      setIsSaving(false);
    }
  }, [data, walletAddress]);

  return (
    <FinixDataContext.Provider value={{
      data, isLoading, isConnected, walletAddress,
      connectWallet, disconnectWallet, updateData, refreshData,
      currentSummary, allSummaries, currentMonth, saveToWalrus, isSaving,
    }}>
      {children}
    </FinixDataContext.Provider>
  );
}

export function useFinixData(): FinixDataContextType {
  const ctx = useContext(FinixDataContext);
  if (!ctx) throw new Error('useFinixData must be used within FinixDataProvider');
  return ctx;
}
