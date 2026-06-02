"use client";

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import {
  SuiClientProvider,
  WalletProvider as DappKitWalletProvider,
  useCurrentAccount,
  useConnectWallet,
  useDisconnectWallet,
  useCurrentWallet,
  useWallets,
  createNetworkConfig,
} from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

// Testnet-first wallet config. This matches the previously working hackathon flow.
const TATUM_RPC_URL = process.env.NEXT_PUBLIC_TATUM_RPC_URL || 'https://sui-testnet.gateway.tatum.io';
const TATUM_API_KEY = process.env.NEXT_PUBLIC_TATUM_API_KEY || '';
const SUI_NETWORK = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';

const { networkConfig } = createNetworkConfig({
  mainnet: { url: process.env.NEXT_PUBLIC_TATUM_MAINNET_RPC_URL || 'https://sui-mainnet.gateway.tatum.io', network: 'mainnet' },
  testnet: { url: TATUM_RPC_URL || getJsonRpcFullnodeUrl('testnet'), network: 'testnet' },
  devnet: { url: getJsonRpcFullnodeUrl('devnet'), network: 'devnet' },
});

const queryClient = new QueryClient();

function createTatumSuiClient(_name: string, config: any) {
  return new SuiJsonRpcClient({
    ...config,
    fetch: (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
      fetch(input, {
        ...init,
        headers: {
          ...init?.headers,
          ...(TATUM_API_KEY ? { 'x-api-key': TATUM_API_KEY } : {}),
        },
      }),
  });
}

// ─── Context untuk backward compat ────────────────────────────
interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  isInstalled: boolean;
  walletName: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signAndExecuteTransaction: ((input: {
    transaction: Uint8Array;
    chain: string;
    requestType?: string;
    options?: { showEffects?: boolean; showEvents?: boolean; showObjectChanges?: boolean };
  }) => Promise<unknown>) | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

// ─── Inner component yang pake hooks dari dapp-kit ────────────
function WalletInner({ children }: { children: ReactNode }) {
  const { mutateAsync: doConnect } = useConnectWallet();
  const { mutateAsync: doDisconnect } = useDisconnectWallet();
  const currentAccount = useCurrentAccount();
  const { currentWallet, connectionStatus } = useCurrentWallet();
  const wallets = useWallets();
  const [isInstalled, setIsInstalled] = useState(false);
  const [signAndExecuteTransaction, setSignAndExecute] = useState<WalletContextType['signAndExecuteTransaction']>(null);

  // Detect if any Sui wallet is installed
  useEffect(() => {
    setIsInstalled(wallets.length > 0);
  }, [wallets]);

  // Setup signAndExecuteTransaction from wallet features
  useEffect(() => {
    if (!currentWallet) { setSignAndExecute(null); return; }
    const feature = (currentWallet as any).features?.['sui:signAndExecuteTransaction'] as any;
    if (feature?.signAndExecuteTransaction) {
      setSignAndExecute(() => (input: any) => feature.signAndExecuteTransaction(input));
    } else {
      setSignAndExecute(null);
    }
  }, [currentWallet]);

  const connect = useCallback(async () => {
    if (wallets.length === 0) {
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

    // Prefer Slush
    const target = wallets.find(w => w.name.toLowerCase().includes('slush')) || wallets[0];
    await doConnect({ wallet: target as any });
  }, [wallets, doConnect]);

  const disconnect = useCallback(() => {
    doDisconnect();
  }, [doDisconnect]);

  return (
    <WalletContext.Provider
      value={{
        isConnected: !!currentAccount,
        address: currentAccount?.address ?? null,
        isConnecting: connectionStatus === 'connecting',
        isInstalled,
        walletName: currentWallet?.name ?? null,
        connect,
        disconnect,
        signAndExecuteTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ─── Public exports ───────────────────────────────────────────
export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        defaultNetwork={SUI_NETWORK as keyof typeof networkConfig & string}
        createClient={createTatumSuiClient}
      >
        <DappKitWalletProvider
          autoConnect={true}
          slushWallet={{ name: 'Slush' }}
        >
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
