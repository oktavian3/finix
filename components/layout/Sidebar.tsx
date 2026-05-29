"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ArrowLeftRight, BarChart3, Target, 
  Award, Bot, User
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, num: '/01' },
  { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight, num: '/02' },
  { label: 'Analytics', path: '/analytics', icon: BarChart3, num: '/03' },
  { label: 'Goals', path: '/goals', icon: Target, num: '/04' },
  { label: 'Achievements', path: '/achievements', icon: Award, num: '/05' },
  { label: 'AI Advisor', path: '/ai-advisor', icon: Bot, num: '/06' },
  { label: 'Profile', path: '/profile', icon: User, num: '/07' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[210px] bg-[#0A0E1A] border-r border-[#1E293B] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-[#1E293B]">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <span className="fx-logo-mark flex items-center justify-center w-7 h-7 rounded-none bg-[#3B5BDB] text-white text-xs font-bold border border-[#4F6EF7]">
            F
          </span>
          <span className="text-[16px] font-bold text-white font-mono tracking-wider group-hover:animate-glitch-text transition-all">
            FINIX
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3">
        {navItems.map(item => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center gap-2.5 px-3 py-2 rounded-none text-[12px] font-medium transition-all duration-150 mb-0.5 border-l-2
                ${isActive 
                  ? 'text-[#3B5BDB] bg-[#3B5BDB]/10 border-l-[#3B5BDB] shadow-[inset_0_0_15px_rgba(59,91,219,0.1)]' 
                  : 'text-[#9CA3AF] border-l-transparent hover:text-white hover:bg-[#1E293B]/50 hover:border-l-[#334155]'
                }
              `}
            >
              <span className="text-[9px] font-mono text-[#6B7280] w-[24px]">{item.num}</span>
              <Icon size={14} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="px-4 pb-5 border-t border-[#1E293B] pt-4">
        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#6B7280] mb-3">System Status</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-none bg-[#111827] border border-[#1E293B]">
            <span className="flex h-[6px] w-[6px] items-center justify-center rounded-full bg-[#15803D] animate-pulse" />
            <span className="text-[10px] font-mono text-[#9CA3AF]">SUI_MAINNET</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-none bg-[#111827] border border-[#1E293B]">
            <span className="flex h-[6px] w-[6px] items-center justify-center rounded-full bg-[#15803D] animate-pulse" />
            <span className="text-[10px] font-mono text-[#9CA3AF]">WALRUS_OK</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
