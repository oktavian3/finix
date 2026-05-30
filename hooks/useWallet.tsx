"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { SuiSignAndExecuteTransactionOutput } from '@mysten/wallet-standard';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  isInstalled: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signAndExecuteTransaction: (tx: Uint8Array) => Promise<SuiSignAndExecuteTransactionOutput>;
}

const WalletContext = createContext<WalletContextType | null>(null);

interface SuiWallet {
  name: string;
  icon: string;
  accounts: ReadonlyArray<{
    address: string;
    chains: string[];
    features: string[];
  }>;
  features: Record<string, unknown>;
}

function getSuiWalletFromWindow(): SuiWallet | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = (window as any).suiWallet;
    if (w?.accounts?.length > 0) {
      return {
        name: w.name || 'Sui Wallet',
        icon: w.icon || '',
        accounts: w.accounts,
        features: w.features || {},
      };
    }
    return null;
  } catch {
    return null;
  }
}

function isSuiWalletInstalled(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !!(window as any).suiWallet;
  } catch {
    return false;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wallet, setWallet] = useState<SuiWallet | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isSuiWalletInstalled());
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Check for Sui Wallet in the window object
      // Sui Wallet extension injects window.suiWallet
      const w = getSuiWalletFromWindow();
      if (!w || !w.accounts?.[0]?.address) {
        throw new Error('Sui Wallet not detected. Please install the Sui Wallet browser extension.');
      }
      setWallet(w);
      const addr = w.accounts[0].address;
      setAddress(addr);
      setIsConnected(true);
    } catch (err) {
      console.error('Wallet connection failed:', err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setWallet(null);
  }, []);

  const signAndExecuteTransaction = useCallback(async (
    tx: Uint8Array,
  ): Promise<SuiSignAndExecuteTransactionOutput> => {
    if (!wallet || !address) throw new Error('Wallet not connected');

    const feature = wallet.features?.['sui:signAndExecuteTransaction'];
    if (!feature || typeof feature !== 'function') {
      throw new Error('Wallet does not support signAndExecuteTransaction');
    }

    return await (feature as (input: { transaction: Uint8Array; chain: string }) => Promise<SuiSignAndExecuteTransactionOutput>)({
      transaction: tx,
      chain: `sui:${process.env.NEXT_PUBLIC_SUI_NETWORK || 'mainnet'}`,
    });
  }, [wallet, address]);

  return (
    <WalletContext.Provider value={{
      isConnected, address, isConnecting, isInstalled,
      connect, disconnect, signAndExecuteTransaction,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
