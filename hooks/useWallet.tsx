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

// Wallet Standard API — detects any wallet extension (Sui Wallet, Suiet, etc.)
// https://github.com/wallet-standard/wallet-standard

interface WalletAccount {
  address: string;
  publicKey?: Uint8Array;
  chains?: string[];
  features?: string[];
  label?: string;
  icon?: string;
}

interface WalletFeature {
  version: string;
  accounts: readonly WalletAccount[];
  // EIP-1193 style connect
  connect?: () => Promise<WalletAccount[]>;
  // Some wallets use 'standard:connect' feature
  'standard:connect'?: {
    connect: () => Promise<WalletAccount[]>;
  };
  // Some wallets expose direct features
  [key: string]: unknown;
}

interface Wallet {
  name: string;
  icon: string;
  version: string;
  features: WalletFeature;
  accounts: readonly WalletAccount[];
}

interface WalletWindow extends Window {
  suiWallet?: Wallet;
  // Sui Wallet Standard v2
  walletStandard?: {
    getWallets: () => {
      on: (event: string, cb: (wallets: Wallet[]) => void) => void;
      get: () => Wallet[];
    };
  };
}

/** Aggressively detect any Sui wallet — tries every known API surface */
function findWallet(): Wallet | null {
  const w = window as unknown as WalletWindow;

  // 1. Direct suiWallet injection (Sui Wallet extension)
  if (w.suiWallet) return w.suiWallet;

  // 2. Wallet Standard API (navigator.wallet)
  if ('wallet' in navigator) {
    try {
      const std = (navigator as any).wallet;
      const wallets = std?.getWallets?.()?.get?.() || [];
      const suiWallet = wallets.find((x: Wallet) =>
        x.name?.toLowerCase().includes('sui')
      );
      if (suiWallet) return suiWallet;
    } catch { /* ignore */ }
  }

  // 3. walletStandard global
  if (w.walletStandard) {
    try {
      const wallets = w.walletStandard.getWallets().get();
      const suiWallet = wallets.find((x: Wallet) =>
        x.name?.toLowerCase().includes('sui')
      );
      if (suiWallet) return suiWallet;
    } catch { /* ignore */ }
  }

  return null;
}

function isWalletInstalled(): boolean {
  try {
    return findWallet() !== null;
  } catch {
    return false;
  }
}

async function requestConnection(): Promise<string> {
  const wallet = findWallet();
  if (!wallet) throw new Error('Sui Wallet not detected. Please install the Sui Wallet browser extension.');

  // Log available features for debugging
  console.log('[Finix] Wallet found:', wallet.name, 'Features:', Object.keys(wallet.features || {}));

  let connected = false;

  // Strategy 1: Try 'standard:connect' feature (Wallet Standard v2)
  const standardConnect = wallet.features?.['standard:connect'];
  if (standardConnect && typeof standardConnect.connect === 'function') {
    await standardConnect.connect();
    connected = true;
  }

  // Strategy 2: Try direct connect function on features
  if (!connected && typeof wallet.features?.connect === 'function') {
    await wallet.features.connect();
    connected = true;
  }

  // Strategy 3: Try 'sui:signPersonalMessage' or similar — sometimes you need
  // to trigger any action to prompt the user
  if (!connected) {
    // For some wallets, just reading accounts triggers the popup
    // or we can try requesting via window.postMessage
    // Sui Wallet listens for 'wallet-standard:connect' events
    window.dispatchEvent(new CustomEvent('wallet-standard:connect', {
      detail: { wallet: wallet.name }
    }));
    connected = true;
  }

  // Wait for wallet to process and return accounts
  await new Promise(r => setTimeout(r, 800));

  // Re-read wallet state
  const updated = findWallet();
  const account = updated?.accounts?.[0];
  if (account?.address) {
    console.log('[Finix] Connected:', account.address);
    return account.address;
  }

  // Last resort: try reading from features accounts
  if (standardConnect && Array.isArray(standardConnect.accounts)) {
    const addr = standardConnect.accounts[0]?.address;
    if (addr) return addr;
  }

  throw new Error('Connection cancelled or no accounts found. Please make sure Sui Wallet is unlocked.');
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
        throw new Error('Sui Wallet not detected.\n\nPlease install the Sui Wallet browser extension:\nhttps://chromewebstore.google.com/detail/sui-wallet/bhjddfmbceejlnhkmfnfdojkdfpenjhi');
      }

      const addr = await requestConnection();
      setAddress(addr);
      setIsConnected(true);
    } catch (err) {
      console.error('[Finix] Wallet connection failed:', err);
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
