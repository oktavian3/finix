"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface WalletAccount {
  address: string;
  publicKey?: Uint8Array;
  chains?: string[];
  label?: string;
  icon?: string;
}

interface StandardConnectFeature {
  version: string;
  connect: () => Promise<{ accounts: WalletAccount[] }>;
}

interface StandardDisconnectFeature {
  version: string;
  disconnect: () => Promise<void>;
}

interface StandardEventsFeature {
  version: string;
  on: (event: string, cb: (args: { accounts?: WalletAccount[] }) => void) => () => void;
}

interface SuiSignPersonalMessageFeature {
  version: string;
  signPersonalMessage: (input: { message: Uint8Array }) => Promise<{ bytes: string; signature: string }>;
}

interface SuiSignAndExecuteTransactionFeature {
  version: string;
  signAndExecuteTransaction: (input: {
    transaction: Uint8Array;
    chain: string;
    requestType?: string;
    options?: { showEffects?: boolean; showEvents?: boolean; showObjectChanges?: boolean };
  }) => Promise<unknown>;
}

interface SuiWallet {
  name: string;
  icon: string;
  version: string;
  accounts: readonly WalletAccount[];
  chains: string[];
  features: Record<string, unknown>;
}

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  isInstalled: boolean;
  walletName: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signAndExecuteTransaction: ((input: { transaction: Uint8Array; chain: string; requestType?: string; options?: { showEffects?: boolean; showEvents?: boolean; showObjectChanges?: boolean } }) => Promise<unknown>) | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

function isSuiWallet(w: any): boolean {
  if (!w) return false;
  // Primary: check chains for sui: prefix
  if (w.chains?.some((c: string) => c.startsWith('sui:'))) return true;
  // Secondary: check for Sui-specific features (works even when wallet is locked)
  const suiFeatures = [
    'standard:connect',
    'sui:signAndExecuteTransaction',
    'sui:signAndExecuteTransactionBlock',
    'sui:signPersonalMessage',
  ];
  if (w.features && suiFeatures.some((f) => w.features[f])) return true;
  // Tertiary: check if name looks like a Sui wallet
  if (w.name && typeof w.name === 'string' && /sui|slush/i.test(w.name)) return true;
  return false;
}

function detectWallets(): SuiWallet[] {
  const wallets: SuiWallet[] = [];
  const seen = new Set<string>();

  function pushWallet(w: any) {
    if (!w) return;
    const name = w.name || 'Unknown';
    if (seen.has(name)) return;
    seen.add(name);
    wallets.push({
      name,
      icon: w.icon || '',
      version: w.version || '1',
      accounts: w.accounts || [],
      chains: w.chains || [],
      features: w.features || {},
    });
  }

  // Check for Wallet Standard wallets (modern Sui wallets like Slush)
  try {
    const walletStdNS = (navigator as any).wallets;
    const rawWallets: any[] = [];

    // wallet-standard API: get() may be sync or return an iterator
    if (walletStdNS && typeof walletStdNS.get === 'function') {
      const result = walletStdNS.get();
      if (Array.isArray(result)) {
        rawWallets.push(...result);
      } else if (result && typeof result[Symbol.iterator] === 'function') {
        rawWallets.push(...Array.from(result));
      }
    }

    // Internal wallets map (used by some wallet-standard implementations)
    if (walletStdNS?._wallets) {
      rawWallets.push(...Array.from(walletStdNS._wallets.values()));
    }

    rawWallets.filter(isSuiWallet).forEach(pushWallet);
  } catch { /* ignore */ }

  // Legacy: check window.suiWallet (older wallets)
  try {
    const legacy = (window as any).suiWallet as SuiWallet | undefined;
    if (legacy && isSuiWallet(legacy)) pushWallet(legacy);
  } catch { /* ignore */ }

  // Fallback: scan window for known Sui wallet injection keys
  try {
    const knownSuiKeys = ['suiWallet', 'slushWallet', 'suiet', 'martianwallet'];
    knownSuiKeys.forEach((key) => {
      const maybeWallet = (window as any)[key] as SuiWallet | undefined;
      if (maybeWallet && isSuiWallet(maybeWallet)) pushWallet(maybeWallet);
    });
  } catch { /* ignore */ }

  return wallets;
}

function findSuiWallet(): SuiWallet | null {
  const wallets = detectWallets();

  if (wallets.length === 0) return null;

  // Prefer Slush if available
  const slush = wallets.find(w => w.name.toLowerCase().includes('slush'));
  if (slush) return slush;

  // Otherwise first Sui wallet
  return wallets[0];
}

function isWalletInstalled(): boolean {
  return findSuiWallet() !== null;
}

let walletListenersAttached = false;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [wallet, setWallet] = useState<SuiWallet | null>(null);
  const [signAndExecuteTransaction, setSignAndExecuteTransaction] = useState<WalletContextType['signAndExecuteTransaction']>(null);

  // Poll for wallet installation (Brave may delay injection)
  useEffect(() => {
    let attempts = 0;
    const poll = setInterval(() => {
      const w = findSuiWallet();
      if (w) {
        setWallet(w);
        setWalletName(w.name);
        setIsInstalled(true);
        clearInterval(poll);
      }
      attempts++;
      if (attempts > 50) clearInterval(poll); // ~5s max
    }, 100);

    return () => clearInterval(poll);
  }, []);

  // Listen for wallet-standard register events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.name) {
        setWalletName(detail.name);
        setIsInstalled(true);
        // Try to get accounts
        if (detail.accounts?.length > 0) {
          setAddress(detail.accounts[0].address);
          setIsConnected(true);
        }
      }
      // Also re-detect wallets — the event may contain wallets that were injected late
      const wallets = detectWallets();
      if (wallets.length > 0) {
        const found = wallets.find(w => w.name.toLowerCase().includes('slush')) || wallets[0];
        setWallet(found);
        setWalletName(found.name);
        setIsInstalled(true);
      }
    };

    window.addEventListener('wallet-standard:register', handler);
    return () => window.removeEventListener('wallet-standard:register', handler);
  }, []);

  // Try to restore previous session (wallet already authorized)
  useEffect(() => {
    if (wallet && wallet.accounts?.length > 0) {
      const addr = wallet.accounts[0].address;
      if (addr) {
        setAddress(addr);
        setIsConnected(true);
      }
    }
  }, [wallet]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const w = findSuiWallet();
      if (!w) {
        throw new Error(
          'Sui Wallet not detected.\n\n' +
          'If you have Slush Wallet installed:\n' +
          '1. Make sure Slush is unlocked\n' +
          '2. In Brave, click the Shields icon and turn Shields OFF for this site\n' +
          '3. Refresh the page\n\n' +
          'If you don\'t have a Sui wallet, install Slush Wallet:\n' +
          'https://chromewebstore.google.com/detail/slush-sui-wallet/ahankfimgcojpdlbephobhdmhpgcghme'
        );
      }

      // Try standard:connect feature (Wallet Standard proper)
      const connectFeature = w.features?.['standard:connect'] as any;
      if (connectFeature?.connect) {
        const result = await connectFeature.connect();
        const accounts = (result as any)?.accounts || result || [];
        if (Array.isArray(accounts) && accounts.length > 0) {
          const addr = accounts[0]?.address || accounts[0];
          if (addr) {
            setAddress(String(addr));
            setIsConnected(true);
            return;
          }
        }
      }

      // If wallet already has accounts (previously authorized), use those
      if (w.accounts?.length > 0 && w.accounts[0].address) {
        setAddress(w.accounts[0].address);
        setIsConnected(true);
        return;
      }

      throw new Error('Connection failed. Please unlock Slush Wallet and try again.');
    } catch (err) {
      console.error('[Finix] Wallet connection failed:', err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      const w = findSuiWallet();
      const disconnectFeature = w?.features?.['standard:disconnect'] as StandardDisconnectFeature | undefined;
      if (disconnectFeature?.disconnect) {
        await disconnectFeature.disconnect();
      }
    } catch { /* ignore */ }
    setAddress(null);
    setIsConnected(false);
  }, []);

  // Set up signAndExecuteTransaction from wallet features
  useEffect(() => {
    if (!wallet) return;
    const suiFeature = wallet.features?.['sui:signAndExecuteTransaction'] as any;
    if (suiFeature?.signAndExecuteTransaction) {
      setSignAndExecuteTransaction(() => (input: any) => suiFeature.signAndExecuteTransaction(input));
    }
  }, [wallet]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        isConnecting,
        isInstalled,
        walletName,
        connect,
        disconnect,
        signAndExecuteTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
