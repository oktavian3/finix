"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { ToastContainer } from "@/components/ui/Toast";

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  topbarExtra?: ReactNode;
}

export function AppShell({ title, subtitle, children, topbarExtra }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#EAF0FF] text-[#111827]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.92),rgba(255,255,255,0)_35%),radial-gradient(circle_at_85%_10%,rgba(199,210,254,0.65),rgba(199,210,254,0)_32%)]" />
      <Sidebar />
      <div className="relative pb-24 lg:ml-[248px] lg:pb-0">
        <header className="sticky top-0 z-30 border-b border-white/70 bg-white/76 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black tracking-tight text-[#111827]">{title}</h1>
              {subtitle && <p className="mt-1 text-sm font-medium text-[#64748B]">{subtitle}</p>}
            </div>
            <div className="flex min-w-0 items-center gap-3">
              {topbarExtra}
            </div>
          </div>
        </header>
        <main className="p-4 animate-fade-in sm:p-6 xl:p-8">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
