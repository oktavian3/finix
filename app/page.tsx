"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useFinixData } from "@/hooks/useFinixData";
import { ArrowRight, Shield, Wallet, Waves, Database, Loader2, TrendingUp, Target, Lock, type LucideIcon } from "lucide-react";

export default function Home() {
  const { isConnected, connect, isConnecting, address } = useWallet();
  const { connectWallet } = useFinixData();
  const router = useRouter();

  useEffect(() => {
    if (isConnected && address) {
      connectWallet(address);
      router.replace("/dashboard");
    }
  }, [isConnected, address, connectWallet, router]);

  return (
    <main className="min-h-screen bg-[#0A0E1A] cyber-grid-bg relative overflow-hidden">
      {/* Scanline overlay */}
      <div className="scanline-overlay" />
      
      {/* Corner coordinates */}
      <div className="absolute top-4 left-4 text-[9px] font-mono text-[#334155] z-10">
        X:0 Y:0 // FINIX_SYS
      </div>
      <div className="absolute top-4 right-4 text-[9px] font-mono text-[#334155] z-10">
        v2.0.1 // {new Date().toISOString().slice(0,10)}
      </div>
      <div className="absolute bottom-4 left-4 text-[9px] font-mono text-[#334155] z-10">
        NETWORK: SUI_MAINNET
      </div>
      <div className="absolute bottom-4 right-4 text-[9px] font-mono text-[#334155] z-10">
        STATUS: OPERATIONAL
      </div>

      <section className="mx-auto flex min-h-screen max-w-[1200px] items-center px-8 relative z-10">
        <div className="grid w-full grid-cols-[1fr_1fr] gap-0 border border-[#1E293B]">
          {/* Left - Hero */}
          <div className="flex min-h-[620px] flex-col p-10 border-r border-[#1E293B]">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-2">
              <span className="fx-logo-mark flex items-center justify-center w-8 h-8 rounded-none bg-[#3B5BDB] text-white text-sm font-bold border border-[#4F6EF7]">
                F
              </span>
              <span className="text-[18px] font-bold text-white font-mono tracking-wider">FINIX</span>
            </div>
            <div className="text-[9px] font-mono text-[#6B7280] tracking-widest uppercase">Personal Finance Terminal</div>

            {/* Hero Content */}
            <div className="mt-16 max-w-[480px]">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#3B5BDB] mb-4">
                {"// PERSONAL.FINANCE // SUI_NETWORK"}
              </p>
              <h1 className="text-[48px] font-bold leading-[1.02] text-white tracking-tight uppercase">
                Track your money, on-chain.
              </h1>
              <p className="mt-6 text-[13px] leading-6 text-[#9CA3AF] font-mono">
                Connect your Sui wallet to manage income, expenses, goals, and AI summaries with your financial data stored as Walrus blobs.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={connect}
                  disabled={isConnecting}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B5BDB] text-white rounded-none text-[12px] font-bold font-mono uppercase tracking-wider hover:bg-[#4F6EF7] hover:shadow-[0_0_30px_rgba(59,91,219,0.5)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-150 disabled:opacity-50 border border-[#4F6EF7] animate-glitch-text"
                >
                  {isConnecting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Wallet size={15} />
                  )}
                  {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
                </button>
                <span className="inline-flex h-[42px] w-[42px] items-center justify-center border border-[#1E293B] text-[#3B5BDB] bg-[#111827]">
                  <ArrowRight size={16} />
                </span>
              </div>
            </div>

            {/* Bottom status */}
            <div className="mt-auto">
              <p className="mb-3 text-[9px] font-mono uppercase tracking-[0.2em] text-[#334155]">
                {"// POWERED_BY"}
              </p>
              <div className="flex gap-2">
                <div className="flex h-[38px] items-center gap-2 border border-[#1E293B] bg-[#111827] px-3">
                  <span className="flex h-[18px] w-[18px] items-center justify-center bg-[#3B5BDB] text-white">
                    <Waves size={10} />
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#9CA3AF]">SUI_NETWORK</span>
                </div>
                <div className="flex h-[38px] items-center gap-2 border border-[#1E293B] bg-[#111827] px-3">
                  <span className="flex h-[18px] w-[18px] items-center justify-center bg-[#334155] text-white">
                    <Database size={10} />
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#9CA3AF]">WALRUS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Dashboard Preview */}
          <div className="relative overflow-hidden bg-[#111827] p-8">
            {/* Moving scanline */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute w-full h-[2px] bg-[#3B5BDB]/20 animate-scanline-move" />
            </div>

            <div className="relative flex h-full flex-col gap-4">
              {/* Status badge */}
              <div className="ml-auto flex items-center gap-2 bg-[#0A0E1A] border border-[#1E293B] px-3 py-2">
                <Shield size={13} className="text-[#15803D]" />
                <span className="text-[10px] font-mono text-[#9CA3AF]">MAINNET_READY</span>
              </div>

              {/* Balance Card */}
              <div className="mt-6 border border-[#1E293B] bg-[#0A0E1A] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">Monthly Balance</p>
                    <p className="mt-2 text-[32px] font-bold text-white font-mono">$4,792</p>
                  </div>
                  <div className="flex h-[40px] w-[40px] items-center justify-center border border-[#1E293B] bg-[#111827] text-[#3B5BDB]">
                    <Wallet size={16} />
                  </div>
                </div>
                {/* Bar chart preview */}
                <div className="mt-6 grid grid-cols-6 items-end gap-2">
                  {[64, 46, 82, 38, 96, 72].map((height, i) => (
                    <div
                      key={height}
                      className="bg-[#3B5BDB]"
                      style={{ height, opacity: 0.3 + i * 0.12 }}
                    />
                  ))}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[#1E293B] bg-[#0A0E1A] p-4">
                  <p className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">Saving Rate</p>
                  <p className="mt-1 text-[24px] font-bold text-[#3B5BDB] font-mono">76%</p>
                  <div className="mt-3 h-1 bg-[#1E293B]">
                    <div className="h-1 bg-[#3B5BDB]" style={{ width: '76%' }} />
                  </div>
                </div>
                <div className="border border-[#1E293B] bg-[#0A0E1A] p-4">
                  <p className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">Walrus Blob</p>
                  <p className="mt-1 text-[13px] font-semibold text-white font-mono">READY_TO_WRITE</p>
                  <p className="mt-3 text-[10px] font-mono text-[#6B7280] leading-4">
                    Each confirmed update creates a fresh decentralized data blob.
                  </p>
                </div>
              </div>

              {/* Info card */}
              <div className="mt-auto border border-[#1E293B] bg-[#0A0E1A] p-4">
                <p className="text-[12px] font-semibold text-white font-mono">Your wallet is your account</p>
                <p className="mt-2 text-[11px] font-mono leading-5 text-[#6B7280]">
                  No email login, no centralized database. Finix uses your Sui address as identity and Walrus as the storage layer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards at bottom */}
      <div className="max-w-[1200px] mx-auto px-8 pb-12 relative z-10">
        <div className="grid grid-cols-3 gap-0 border border-[#1E293B]">
          <FeatureCard icon={Lock} title="WALRUS_STORAGE" desc="Decentralized data blobs on Sui mainnet" num="/01" />
          <FeatureCard icon={TrendingUp} title="AI_INSIGHTS" desc="Claude-powered financial analysis" num="/02" />
          <FeatureCard icon={Target} title="GOAL_TRACKING" desc="Set targets, track progress on-chain" num="/03" />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon: Icon, title, desc, num }: { icon: LucideIcon; title: string; desc: string; num: string }) {
  return (
    <div className="p-6 border-r border-[#1E293B] last:border-r-0 bg-[#111827]/50 hover:bg-[#111827] transition-colors duration-150">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-mono text-[#3B5BDB]">{num}</span>
        <Icon size={14} className="text-[#3B5BDB]" />
      </div>
      <h3 className="text-[12px] font-bold text-white font-mono tracking-wide uppercase">{title}</h3>
      <p className="text-[11px] font-mono text-[#6B7280] mt-1 leading-4">{desc}</p>
    </div>
  );
}
