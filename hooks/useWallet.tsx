"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface WalletContextType {
  isConnected: boolean;
  address: string;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(() => {
    setIsConnecting(true);
    // Simulate wallet connection for now
    setTimeout(() => {
      const mockAddress = '0x' + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setAddress(mockAddress);
      setIsConnected(true);
      setIsConnecting(false);
    }, 800);
  }, []);

  const disconnect = useCallback(() => {
    setAddress('');
    setIsConnected(false);
  }, []);

  return (
    <WalletContext.Provider value={{ isConnected, address, isConnecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
