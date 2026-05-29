"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/Button';
import { Wallet } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { address, isConnected, connect, disconnect } = useWallet();
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const tick = () => setUtcTime(new Date().toISOString().slice(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sticky top-0 z-30 bg-[#0A0E1A]/90 backdrop-blur-sm border-b border-[#1E293B] px-[26px] py-3 flex items-center justify-between">
      <div>
        <h1 className="text-[16px] font-semibold text-white font-mono tracking-wide">{title}</h1>
        {subtitle && <p className="text-[10px] font-mono text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-[10px] font-mono text-[#6B7280] px-2 py-1 bg-[#111827] border border-[#1E293B]">
          <span className="text-[#3B5BDB]">UTC</span> {utcTime}
        </div>
        {isConnected ? (
          <div className="flex items-center gap-2 px-2 py-1.5 bg-[#111827] border border-[#1E293B] rounded-none">
            <span className="flex h-[6px] w-[6px] items-center justify-center rounded-full bg-[#15803D] animate-pulse" />
            <span className="text-[10px] font-mono text-[#9CA3AF]">
              NODE: {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <button onClick={disconnect} className="text-[10px] text-[#6B7280] hover:text-[#B91C1C] ml-1 transition-colors">
              ✕
            </button>
          </div>
        ) : (
          <Button size="sm" onClick={connect}>
            <Wallet size={12} />
            CONNECT WALLET
          </Button>
        )}
      </div>
    </div>
  );
}
