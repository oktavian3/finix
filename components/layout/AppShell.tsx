"use client";

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '@/components/ui/Toast';

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  topbarExtra?: ReactNode;
}

export function AppShell({ title, subtitle, children, topbarExtra }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#0A0E1A] cyber-grid-bg">
      {/* Scanline overlay */}
      <div className="scanline-overlay" />
      
      <Sidebar />
      <div className="ml-[210px]">
        {/* Topbar */}
        <div className="sticky top-0 z-30 bg-[#0A0E1A]/90 backdrop-blur-sm border-b border-[#1E293B] px-[26px] py-3 flex items-center justify-between">
          <div>
            <h1 className="text-[16px] font-semibold text-white font-mono tracking-wide">{title}</h1>
            {subtitle && <p className="text-[10px] font-mono text-[#6B7280] mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <SystemClock />
            {topbarExtra}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-[18px_26px]">
          {children}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

function SystemClock() {
  return (
    <div className="text-[10px] font-mono text-[#6B7280] px-2 py-1 bg-[#111827] border border-[#1E293B] rounded-none">
      <span className="text-[#3B5BDB]">SYS</span> {new Date().toISOString().slice(0, 19).replace('T', ' ')}
    </div>
  );
}
