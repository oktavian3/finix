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
    <div className="min-h-screen bg-[#EEF2FF]">
      <Sidebar />
      <div className="ml-[210px]">
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] px-[26px] py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#111827]">{title}</h1>
            {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            {topbarExtra}
          </div>
        </div>
        <div className="p-[18px_26px] animate-fade-in">
          {children}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
