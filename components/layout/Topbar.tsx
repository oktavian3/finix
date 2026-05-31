"use client";

import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/Button';
import { Wallet } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { address, isConnected, connect, isConnecting, disconnect } = useWallet();

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] px-[26px] py-3 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-[#111827]">{title}</h1>
        {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {isConnected ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[#EEF2FF] border border-[#C5D0FF]">
            <Wallet size={13} className="text-[#3B5BDB]" />
            <span className="text-xs font-medium text-[#374151]">
              {address!.slice(0, 6)}...{address!.slice(-4)}
            </span>
            <button onClick={disconnect} className="text-2xs text-[#6B7280] hover:text-[#B91C1C] ml-1">
              ✕
            </button>
          </div>
        ) : (
          <Button size="sm" onClick={connect} loading={isConnecting}>
            <Wallet size={13} /> Connect
          </Button>
        )}
      </div>
    </div>
  );
}
