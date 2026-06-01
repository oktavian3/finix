"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Award,
  BarChart3,
  Bot,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Target,
  User,
  WalletCards,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Goals", path: "/goals", icon: Target },
  { label: "Achievements", path: "/achievements", icon: Award },
  { label: "AI Advisor", path: "/ai-advisor", icon: Bot },
  { label: "Profile", path: "/profile", icon: User },
];

function BrandLogo() {
  return (
    <Link href="/dashboard" className="group flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-[#E2E8F0] bg-white shadow-sm">
        <img src="/logo/finix-logo.svg" alt="Finix" className="h-7 w-7 object-contain transition-transform duration-200 group-hover:scale-105" />
      </span>
      <span>
        <span className="block text-lg font-black tracking-tight text-[#111827] transition-colors duration-200 group-hover:text-[#3B5BDB]">Finix</span>
        <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">Command center</span>
      </span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isConnected, disconnect } = useWallet();

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[248px] flex-col border-r border-white/70 bg-white/86 shadow-[20px_0_70px_-62px_rgba(15,23,42,0.85)] backdrop-blur-xl lg:flex">
        <div className="px-5 pb-4 pt-6">
          <BrandLogo />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-[#111827] text-white shadow-[0_14px_35px_-24px_rgba(17,24,39,0.9)]"
                    : "text-[#475569] hover:-translate-y-0.5 hover:bg-[#F8FAFC] hover:text-[#111827]"
                }`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${isActive ? "bg-white/12 text-white" : "bg-[#F1F5F9] text-[#64748B] group-hover:bg-[#EEF2FF] group-hover:text-[#3B5BDB]"}`}>
                  <Icon size={17} strokeWidth={1.9} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-5">
          <div className="overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-gradient-to-br from-[#F8FAFC] via-white to-[#EEF2FF] p-4 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.65)]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#111827] text-white">
                <WalletCards size={18} />
              </div>
              <Sparkles size={17} className="text-[#3B5BDB]" />
            </div>
            <p className="text-sm font-black text-[#111827]">Financial Command Center</p>
            <p className="mt-2 text-xs leading-5 text-[#64748B]">Portfolio overview, spending context, and wallet-protected records in one workspace.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#94A3B8]">Mode</p>
                <p className="mt-1 text-xs font-black text-[#111827]">{isConnected ? "Wallet" : "Demo"}</p>
              </div>
              <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#94A3B8]">Records</p>
                <p className="mt-1 text-xs font-black text-[#111827]">Protected</p>
              </div>
            </div>
          </div>

          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="mt-3 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-[#B91C1C] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FEF2F2]"
            >
              <LogOut size={16} strokeWidth={1.9} />
              <span>Disconnect Wallet</span>
            </button>
          )}
        </div>
      </aside>

      <nav className="fixed bottom-3 left-3 right-3 z-50 grid grid-cols-5 gap-1 rounded-[24px] border border-white/70 bg-white/92 p-2 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.85)] backdrop-blur-xl lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-bold transition-all duration-200 ${
                isActive ? "bg-[#111827] text-white" : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#111827]"
              }`}
            >
              <Icon size={17} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
