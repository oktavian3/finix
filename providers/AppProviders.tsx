"use client";

import { ReactNode } from 'react';
import { WalletProvider } from '@/hooks/useWallet';
import { FinixDataProvider } from '@/hooks/useFinixData';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <FinixDataProvider>
        {children}
      </FinixDataProvider>
    </WalletProvider>
  );
}
