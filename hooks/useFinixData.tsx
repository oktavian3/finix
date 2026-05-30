"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { FinixUserData } from '@/types/finix';
import { createEmptyUserData, computeMonthlySummary, computeAllSummaries } from '@/lib/data-store';
import type { MonthlySummary } from '@/types/finix';

interface FinixDataContextType {
  data: FinixUserData;
  isLoading: boolean;
  isConnected: boolean;
  walletAddress: string | null;
  connectWallet: (address: string) => Promise<void>;
  disconnectWallet: () => void;
  updateData: (newData: FinixUserData) => void;
  refreshData: () => void;
  currentSummary: MonthlySummary;
  allSummaries: MonthlySummary[];
  currentMonth: string;
  saveToWalrus: () => Promise<void>;
  isSaving: boolean;
  blobId: string | null;
}

const FinixDataContext = createContext<FinixDataContextType | null>(null);

// Key for storing blobId reference in localStorage per wallet
function blobIdKey(address: string): string {
  return `finix_blobid_${address}`;
}

export function FinixDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FinixUserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [blobId, setBlobId] = useState<string | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentSummary = data ? computeMonthlySummary(data, currentMonth) : emptySummary();
  const allSummaries = data ? computeAllSummaries(data) : [];

  const connectWallet = useCallback(async (address: string) => {
    setWalletAddress(address);
    setIsConnected(true);
    setIsLoading(true);

    try {
      // Try to load existing data from Walrus
      const savedBlobId = localStorage.getItem(blobIdKey(address));
      if (savedBlobId) {
        setBlobId(savedBlobId);
        const res = await fetch(`/api/walrus?blobId=${encodeURIComponent(savedBlobId)}`);
        const result = await res.json();
        if (result.success && result.data) {
          setData(result.data as FinixUserData);
          setIsLoading(false);
          return;
        }
      }

      // Fallback: check localStorage cache
      const cached = localStorage.getItem(`finix_cache_${address}`);
      if (cached) {
        try {
          setData(JSON.parse(cached));
          setIsLoading(false);
          return;
        } catch { /* ignore */ }
      }

      // New user — create empty data
      setData(createEmptyUserData(address));
    } catch {
      setData(createEmptyUserData(address));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setIsConnected(false);
    setData(null);
    setBlobId(null);
  }, []);

  const updateData = useCallback((newData: FinixUserData) => {
    setData(newData);
    // Cache locally for quick reload
    if (walletAddress) {
      localStorage.setItem(`finix_cache_${walletAddress}`, JSON.stringify(newData));
    }
  }, [walletAddress]);

  const refreshData = useCallback(async () => {
    if (!walletAddress) return;
    const savedBlobId = localStorage.getItem(blobIdKey(walletAddress));
    if (savedBlobId) {
      try {
        const res = await fetch(`/api/walrus?blobId=${encodeURIComponent(savedBlobId)}`);
        const result = await res.json();
        if (result.success && result.data) {
          setData(result.data as FinixUserData);
        }
      } catch { /* ignore */ }
    }
  }, [walletAddress]);

  const saveToWalrus = useCallback(async () => {
    if (!data || !walletAddress) return;
    setIsSaving(true);
    try {
      // Save to Walrus via API (server-side signing with Taotie/aggregator)
      const res = await fetch('/api/walrus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, walletAddress }),
      });
      const result = await res.json();
      if (result.success) {
        const newBlobId = result.blobId;
        setBlobId(newBlobId);
        localStorage.setItem(blobIdKey(walletAddress), newBlobId);
        // Update cached copy
        localStorage.setItem(`finix_cache_${walletAddress}`, JSON.stringify(data));
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (err) {
      console.error('Walrus save error:', err);
      // Fallback: save to localStorage at least
      localStorage.setItem(`finix_cache_${walletAddress}`, JSON.stringify(data));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [data, walletAddress]);

  // Auto-save on data changes (debounced)
  useEffect(() => {
    if (!isConnected || !data || !walletAddress) return;
    const timer = setTimeout(() => {
      localStorage.setItem(`finix_cache_${walletAddress}`, JSON.stringify(data));
    }, 2000);
    return () => clearTimeout(timer);
  }, [data, isConnected, walletAddress]);

  return (
    <FinixDataContext.Provider value={{
      data: data || createEmptyUserData(walletAddress || '0xunknown'),
      isLoading, isConnected, walletAddress,
      connectWallet, disconnectWallet, updateData, refreshData,
      currentSummary, allSummaries, currentMonth,
      saveToWalrus, isSaving, blobId,
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

function emptySummary(): MonthlySummary {
  return {
    month: new Date().toISOString().slice(0, 7),
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    savingRate: 0,
    byCategory: {},
    bySource: {},
  };
}
