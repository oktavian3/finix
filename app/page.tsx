"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useFinixData } from "@/hooks/useFinixData";
import { ArrowRight, Shield, Wallet, Waves, Database, Loader2, AlertTriangle, X } from "lucide-react";

export default function Home() {
  const { isConnected, connect, isConnecting, address } = useWallet();
  const { connectWallet, isLoading } = useFinixData();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isConnected && address && !isLoading) {
      connectWallet(address).then(() => {
        router.replace("/dashboard");
      });
    }
  }, [isConnected, address, isLoading, connectWallet, router]);

  const handleConnect = async () => {
    setError(null);
    try {
      await connect();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  return (
    <main className="min-h-screen bg-[#EEF2FF] p-8">
      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1120px] items-center">
        <div className="grid w-full grid-cols-[0.95fr_1.05fr] overflow-hidden rounded-[26px] border border-[#E2E8F0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          {/* Left */}
          {error && (
            <div className="fixed top-4 right-4 z-50 flex items-start gap-3 rounded-[12px] border border-red-200 bg-red-50 p-4 shadow-lg max-w-sm">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-red-800">Connection Failed</p>
                <p className="mt-1 text-[12px] leading-5 text-red-700">{error}</p>
                <button
                  onClick={() => {
                    // Re-check if wallet is installed
                    window.location.reload();
                  }}
                  className="mt-2 text-[12px] font-medium text-red-600 underline hover:text-red-800"
                >
                  Reload page & try again
                </button>
              </div>
              <button onClick={() => setError(null)} className="shrink-0">
                <X size={16} className="text-red-400 hover:text-red-600" />
              </button>
            </div>
          )}
          <div className="flex min-h-[620px] flex-col p-10">
            <div className="flex items-center gap-2">
              <img src="/finix-logo.png" alt="Finix" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-[16px] font-semibold text-[#111827]">Finix</span>
            </div>

            <div className="mt-20 max-w-[440px]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3B5BDB]">
                Personal finance on Sui
              </p>
              <h1 className="mt-4 text-[44px] font-semibold leading-[1.02] text-[#111827]">
                Track your money, on-chain.
              </h1>
              <p className="mt-5 text-[14px] leading-6 text-[#6B7280]">
                Connect your Sui wallet to manage income, expenses, goals, and
                AI summaries with your financial data stored as Walrus blobs.
              </p>

              <div className="mt-8 flex items-center gap-3">
                {isLoading || isConnecting ? (
                  <button
                    disabled
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B5BDB] text-white rounded-[10px] text-[13px] font-semibold opacity-50"
                  >
                    <Loader2 size={16} className="animate-spin" />
                    Loading...
                  </button>
                ) : (
                  <button
                    onClick={handleConnect}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B5BDB] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#3451D0] active:bg-[#2E48BC] transition-colors duration-150 cursor-pointer z-10 relative"
                  >
                    <Wallet size={16} />
                    Connect Wallet
                  </button>
                )}
                <span className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#F8FAFC] text-[#3B5BDB]">
                  <ArrowRight size={18} />
                </span>
              </div>
            </div>

            <div className="mt-auto">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
                Powered by
              </p>
              <div className="flex gap-3">
                <div className="flex h-[46px] items-center gap-2 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] px-4">
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#3B5BDB] text-white">
                    <Waves size={14} />
                  </span>
                  <span className="text-[12px] font-semibold text-[#111827]">Sui Network</span>
                </div>
                <div className="flex h-[46px] items-center gap-2 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] px-4">
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#111827] text-white">
                    <Database size={14} />
                  </span>
                  <span className="text-[12px] font-semibold text-[#111827]">Walrus</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="relative overflow-hidden bg-[#F8FAFC] p-8">
            <div className="relative flex h-full flex-col gap-5">
              <div className="ml-auto flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
                <Shield size={15} className="text-[#15803D]" />
                <span className="text-[11px] font-medium text-[#374151]">Mainnet ready</span>
              </div>

              <div className="mt-10 rounded-[18px] border border-[#E2E8F0] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-[#6B7280]">Monthly balance</p>
                    <p className="mt-2 text-[32px] font-semibold text-[#111827]">$4,792</p>
                  </div>
                  <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#EEF2FF] text-[#3B5BDB]">
                    <Wallet size={18} />
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-6 items-end gap-3">
                  {[64, 46, 82, 38, 96, 72].map((height) => (
                    <div
                      key={height}
                      className="rounded-full bg-[#4F6EF7]"
                      style={{ height, opacity: 0.42 + [64, 46, 82, 38, 96, 72].indexOf(height) * 0.09 }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="rounded-[18px] border border-[#E2E8F0] bg-white p-5">
                  <p className="text-[11px] text-[#6B7280]">Saving rate</p>
                  <p className="mt-2 text-[28px] font-semibold text-[#3B5BDB]">76%</p>
                  <div className="mt-4 h-2 rounded-full bg-[#EEF2FF]">
                    <div className="h-2 w-[76%] rounded-full bg-[#3B5BDB]" />
                  </div>
                </div>
                <div className="rounded-[18px] bg-[#111827] p-5 text-white">
                  <p className="text-[11px] text-white/55">Walrus blob</p>
                  <p className="mt-2 text-[15px] font-semibold">Data on Walrus</p>
                  <p className="mt-4 text-[11px] leading-5 text-white/60">
                    Your financial data lives on Walrus — decentralized, permanent, and yours.
                  </p>
                </div>
              </div>

              <div className="mt-auto rounded-[18px] border border-[#E2E8F0] bg-white p-5">
                <p className="text-[13px] font-semibold text-[#111827]">Your wallet is your account</p>
                <p className="mt-2 text-[12px] leading-5 text-[#6B7280]">
                  No email login, no centralized finance database. Finix uses
                  your Sui address as identity and Walrus as the storage layer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
