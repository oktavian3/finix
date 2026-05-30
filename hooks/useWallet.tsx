"use client";

import { createContext, useContext, useCallback, ReactNode } from 'react';
import type { SuiSignAndExecuteTransactionOutput } from '@mysten/wallet-standard';
import { SuiClientProvider, WalletProvider as DappKitWalletProvider, useCurrentAccount, useDisconnectWallet, useConnectWallet, useWallets } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  isInstalled: boolean;
  connect: () => void;
  disconnect: () => void;
  signAndExecuteTransaction: (tx: Uint8Array) => Promise<SuiSignAndExecuteTransactionOutput>;
}

const WalletContext = createContext<WalletContextType | null>(null);

function WalletInner({ children }: { children: ReactNode }) {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const { mutate: connectWallet, isPending } = useConnectWallet();
  const wallets = useWallets();

  const address = currentAccount?.address ?? null;
  const isConnected = !!currentAccount;

  const connect = useCallback(() => {
    // Try to connect with the first available Sui wallet
    const suiWallet = wallets.find(w => w.name === 'Sui Wallet' || w.name === 'Sui' || w.name === 'Suiet');
    if (suiWallet) {
      connectWallet({ wallet: suiWallet });
    } else if (wallets.length > 0) {
      connectWallet({ wallet: wallets[0] });
    } else {
      // Fallback: open Sui Wallet download page
      window.open('https://suiwallet.com', '_blank');
    }
  }, [wallets, connectWallet]);

  const disconnect = useCallback(() => {
    disconnectWallet();
  }, [disconnectWallet]);

  const signAndExecuteTransaction = useCallback(async (
    _tx: Uint8Array,
  ): Promise<SuiSignAndExecuteTransactionOutput> => {
    throw new Error('Use Transaction builders from @mysten/sui/transactions.');
  }, []);

  return (
    <WalletContext.Provider value={{
      isConnected, address, isConnecting: false, isInstalled: true,
      connect, disconnect, signAndExecuteTransaction,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

const queryClient = new QueryClient();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const networkConfig: any = {
  mainnet: {
    url: process.env.NEXT_PUBLIC_TATUM_RPC_URL || 'https://sui-mainnet.gateway.tatum.io',
  },
  testnet: {
    url: 'https://fullnode.testnet.sui.io:443',
  },
};

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        defaultNetwork={(process.env.NEXT_PUBLIC_SUI_NETWORK || 'mainnet') as 'mainnet' | 'testnet'}
      >
        <DappKitWalletProvider autoConnect>
          <WalletInner>
            {children}
          </WalletInner>
        </DappKitWalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
