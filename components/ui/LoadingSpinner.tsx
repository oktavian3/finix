"use client";

import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 20, text }: { size?: number; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 size={size} className="animate-spin text-[#3B5BDB]" />
      {text && <p className="text-xs text-[#6B7280]">{text}</p>}
    </div>
  );
}
