"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import type { FinixUserData } from '@/types/finix';
import { createEmptyUserData, computeMonthlySummary, computeAllSummaries, checkAchievements } from '@/lib/data-store';
import type { MonthlySummary } from '@/types/finix';
import { useCurrentAccount } from '@mysten/dapp-kit';

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
  objectId: string | null;
  walrusNetwork: 'mainnet' | 'testnet' | null;
  registerWalrusSnapshot: (snapshot: { blobId: string; objectId?: string | null; network?: 'mainnet' | 'testnet' }) => void;
}

const FinixDataContext = createContext<FinixDataContextType | null>(null);

// Key for storing blobId reference in localStorage per wallet
function blobIdKey(address: string): string {
  return `finix_blobid_${address}`;
}

function objectIdKey(address: string): string {
  return `finix_objectid_${address}`;
}

function walrusNetworkKey(address: string): string {
  return `finix_walrus_network_${address}`;
}

export function FinixDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FinixUserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [blobId, setBlobId] = useState<string | null>(null);
  const [objectId, setObjectId] = useState<string | null>(null);
  const [walrusNetwork, setWalrusNetwork] = useState<'mainnet' | 'testnet' | null>(null);
  const currentAccount = useCurrentAccount();
  const initializedRef = useRef<Record<string, boolean>>({});
  const prevAddrRef = useRef<string | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentSummary = data ? computeMonthlySummary(data, currentMonth) : emptySummary();
  const allSummaries = data ? computeAllSummaries(data) : [];

  // --- Wallet auto-detect + data loading (runs when wallet changes) ---
  useEffect(() => {
    const addr = currentAccount?.address ?? null;
    const prev = prevAddrRef.current;
    prevAddrRef.current = addr;

    if (addr === null) {
      // Wallet disconnected or not yet loaded — don't wipe data if we just had it
      // Only wipe if this is a genuine disconnect (not initial load)
      if (prev !== null) {
        setWalletAddress(null);
        setIsConnected(false);
        setData(null);
        setBlobId(null);
        setObjectId(null);
        setWalrusNetwork(null);
      }
      return;
    }

    // If same address already loaded, skip
    if (initializedRef.current[addr]) return;

    initializedRef.current[addr] = true;
    setWalletAddress(addr);
    setIsConnected(true);
    setIsLoading(true);

    const loadData = async () => {
      try {
        // Try Walrus blob first (for persisting across devices)
        const savedBlobId = localStorage.getItem(blobIdKey(addr));
        if (savedBlobId) {
          setBlobId(savedBlobId);
          setObjectId(localStorage.getItem(objectIdKey(addr)));
          const savedNetwork = localStorage.getItem(walrusNetworkKey(addr));
          const networkIsMainnet = savedNetwork === 'mainnet';
          setWalrusNetwork(networkIsMainnet ? 'mainnet' : null);
          try {
            const res = await fetch(`/api/walrus?blobId=${encodeURIComponent(savedBlobId)}`);
            if (res.ok) {
              const result = await res.json();
              if (result.success && result.data) {
                const withAchievements = {
                  ...result.data,
                  achievements: checkAchievements(result.data),
                };
                setData(withAchievements);
                localStorage.setItem(`finix_cache_${addr}`, JSON.stringify(withAchievements));
                setIsLoading(false);
                return;
              }
            } else if (res.status === 400 || res.status === 404) {
              // Blob not found (testnet blob deleted or mainnet never existed) — clear stale keys
              localStorage.removeItem(blobIdKey(addr));
              localStorage.removeItem(objectIdKey(addr));
              localStorage.removeItem(walrusNetworkKey(addr));
              setBlobId(null);
              setObjectId(null);
              setWalrusNetwork(null);
            }
          } catch { /* fall through to local cache */ }
        }

        // Fallback: local cache
        const cached = localStorage.getItem(`finix_cache_${addr}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as FinixUserData;
            if (parsed && parsed.transactions) {
              setData(parsed);
              setIsLoading(false);
              return;
            }
          } catch { /* ignore */ }
        }

        // New user — empty state
        setData(createEmptyUserData(addr));
      } catch {
        setData(createEmptyUserData(addr));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentAccount?.address]);

  // --- Streak check ---
  useEffect(() => {
    if (!data || !walletAddress) return;
    const lastActive = data.streaks.lastActiveDate;
    if (!lastActive || data.streaks.currentStreak === 0) return;

    const now = new Date();
    const lastDate = new Date(lastActive);
    const diffMs = now.getTime() - lastDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 36) {
      const updated = {
        ...data,
        streaks: {
          ...data.streaks,
          currentStreak: 0,
        },
      };
      setData(updated);
      localStorage.setItem(`finix_cache_${walletAddress}`, JSON.stringify(updated));
    }
  }, [walletAddress]);

  const disconnectWallet = useCallback(() => {
    if (walletAddress) {
      delete initializedRef.current[walletAddress];
    }
    setWalletAddress(null);
    setIsConnected(false);
    setData(null);
    setBlobId(null);
    setObjectId(null);
    setWalrusNetwork(null);
  }, [walletAddress]);

  const registerWalrusSnapshot = useCallback((snapshot: { blobId: string; objectId?: string | null; network?: 'mainnet' | 'testnet' }) => {
    if (!walletAddress) return;
    setBlobId(snapshot.blobId);
    setObjectId(snapshot.objectId || null);
    setWalrusNetwork(snapshot.network || 'mainnet');
    localStorage.setItem(blobIdKey(walletAddress), snapshot.blobId);
    if (snapshot.objectId) {
      localStorage.setItem(objectIdKey(walletAddress), snapshot.objectId);
    } else {
      localStorage.removeItem(objectIdKey(walletAddress));
    }
    localStorage.setItem(walrusNetworkKey(walletAddress), snapshot.network || 'mainnet');
  }, [walletAddress]);

  const updateData = useCallback((newData: FinixUserData) => {
    const withAchievements = {
      ...newData,
      achievements: checkAchievements(newData),
    };
    setData(withAchievements);
    if (walletAddress) {
      localStorage.setItem(`finix_cache_${walletAddress}`, JSON.stringify(withAchievements));
    }
  }, [walletAddress]);

  const refreshData = useCallback(async () => {
    if (!walletAddress) return;
    const savedBlobId = localStorage.getItem(blobIdKey(walletAddress));
    if (savedBlobId) {
      try {
        const res = await fetch(`/api/walrus?blobId=${encodeURIComponent(savedBlobId)}`);
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            setData(result.data as FinixUserData);
          }
        }
      } catch { /* ignore */ }
    }
  }, [walletAddress]);

  const saveToWalrus = useCallback(async () => {
    if (!data || !walletAddress) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/walrus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, walletAddress }),
      });
      const result = await res.json();
      if (result.success) {
        const newBlobId = result.blobId;
        registerWalrusSnapshot({
          blobId: newBlobId,
          objectId: result.objectId || null,
          network: 'mainnet',
        });
        localStorage.setItem(`finix_cache_${walletAddress}`, JSON.stringify(data));
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (err) {
      console.error('Walrus save error:', err);
      localStorage.setItem(`finix_cache_${walletAddress}`, JSON.stringify(data));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [data, registerWalrusSnapshot, walletAddress]);

  // Debounced auto-save to local cache
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
      connectWallet: async (_addr: string) => {
        // dapp-kit auto-connect handles this
      }, disconnectWallet, updateData, refreshData,
      currentSummary, allSummaries, currentMonth,
      saveToWalrus, isSaving, blobId, objectId, walrusNetwork, registerWalrusSnapshot,
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
