"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ArrowLeftRight, BarChart3, Target, 
  Award, Bot, User, Waves, Database
} from 'lucide-react';

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

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[210px] bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="fx-logo-mark flex items-center justify-center w-7 h-7 rounded-lg bg-[#3B5BDB] text-white text-xs font-bold">
            F
          </span>
          <span className="text-[16px] font-semibold text-[#111827]">Finix</span>
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
                flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[12px] font-medium transition-all mb-0.5
                ${isActive 
                  ? 'text-[#3B5BDB] !important bg-[#EEF2FF] !important border-r-[3px] border-[#3B5BDB]' 
                  : 'text-[#374151] hover:!text-[#111827] hover:!bg-[#F5F7FF]'
                }
              `}
              style={isActive ? { color: '#3B5BDB', backgroundColor: '#EEF2FF', borderRight: '3px solid #3B5BDB' } : {}}
            >
              <Icon size={15} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Powered by */}
      <div className="px-5 pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF] mb-3">Powered by</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3B5BDB] text-white">
              <Waves size={11} />
            </span>
            <span className="text-[11px] font-semibold text-[#111827]">Sui Network</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111827] text-white">
              <Database size={11} />
            </span>
            <span className="text-[11px] font-semibold text-[#111827]">Walrus</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
