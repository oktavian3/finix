"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  isInstalled: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

// Sui Wallet Standard — detects wallet extension and requests connection
interface SuiWalletAccount {
  address: string;
  chains: string[];
  features: string[];
}

interface SuiWallet {
  name: string;
  icon: string;
  accounts: readonly SuiWalletAccount[];
  features: Record<string, unknown>;
}

function getSuiWallet(): SuiWallet | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = (window as any).suiWallet;
    if (w) {
      return {
        name: w.name || 'Sui Wallet',
        icon: w.icon || '',
        accounts: w.accounts || [],
        features: w.features || {},
      };
    }
    return null;
  } catch {
    return null;
  }
}

function isWalletInstalled(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !!(window as any).suiWallet;
  } catch {
    return false;
  }
}

async function requestConnection(): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = (window as any).suiWallet;
  if (!w) throw new Error('Sui Wallet not installed');

  // Sui Wallet Standard: call connect() on the wallet's features
  // The standard feature is 'standard:connect'
  const connectFeature = w.features?.['standard:connect'];
  if (connectFeature) {
    // Some wallets expose connect as a function
    if (typeof connectFeature === 'function') {
      await connectFeature();
    } else if (typeof connectFeature.connect === 'function') {
      await connectFeature.connect();
    }
  }

  // After connection request, wait a short tick then read accounts
  await new Promise(r => setTimeout(r, 500));

  const updated = getSuiWallet();
  const account = updated?.accounts?.[0];
  if (!account?.address) {
    throw new Error('User rejected connection or no accounts found');
  }
  return account.address;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isWalletInstalled());
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      if (!isWalletInstalled()) {
        throw new Error('Sui Wallet not detected. Install Sui Wallet browser extension.');
      }

      const addr = await requestConnection();
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
  }, []);

  return (
    <WalletContext.Provider value={{ isConnected, address, isConnecting, isInstalled, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
