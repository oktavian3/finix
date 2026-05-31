"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ArrowLeftRight, BarChart3, Target, 
  Award, Bot, User, LogOut, Waves, Database
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Goals', path: '/goals', icon: Target },
  { label: 'Achievements', path: '/achievements', icon: Award },
  { label: 'AI Advisor', path: '/ai-advisor', icon: Bot },
  { label: 'Profile', path: '/profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isConnected, disconnect } = useWallet();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[210px] bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <img src="/finix-logo.png" alt="Finix" className="w-7 h-7 rounded-lg object-cover transition-transform duration-200 group-hover:scale-110" />
          <span className="text-md font-semibold text-[#111827] transition-colors duration-200 group-hover:text-[#3B5BDB]">Finix</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2">
        {navItems.map(item => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 mb-0.5
                ${isActive 
                  ? 'text-[#3B5BDB] bg-[#EEF2FF] shadow-sm' 
                  : 'text-[#374151] hover:text-[#111827] hover:bg-[#F5F7FF] hover:shadow-sm'
                }
              `}
              style={isActive ? { borderLeft: '3px solid #3B5BDB', paddingLeft: '9px' } : { paddingLeft: '12px' }}
            >
              <Icon size={16} strokeWidth={1.8} className={`transition-transform duration-200 ${isActive ? 'text-[#3B5BDB]' : ''}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Powered by */}
      <div className="px-5 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9CA3AF] mb-2">Powered by</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] transition-all duration-200 hover:bg-[#EEF2FF] hover:border-[#C5D0FF] hover-lift cursor-default">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3B5BDB] text-white">
              <Waves size={11} />
            </span>
            <span className="text-sm font-semibold text-[#111827]">Sui Network</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] transition-all duration-200 hover:bg-[#EEF2FF] hover:border-[#C5D0FF] hover-lift cursor-default">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111827] text-white">
              <Database size={11} />
            </span>
            <span className="text-sm font-semibold text-[#111827]">Walrus</span>
          </div>
        </div>

        {/* Disconnect button */}
        {isConnected && (
          <button
            onClick={() => {
              disconnect();
              // Clear local data cache on disconnect
              if (typeof window !== 'undefined') {
                localStorage.removeItem('finix_blob_mock');
              }
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium text-[#B91C1C] hover:bg-[#FEF2F2] w-full mt-3 transition-all duration-200"
          >
            <LogOut size={16} strokeWidth={1.8} />
            <span>Disconnect Wallet</span>
          </button>
        )}
      </div>
    </aside>
  );
}
