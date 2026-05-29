"use client";

export function LoadingSpinner({ size = 20, text }: { size?: number; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div 
        className="border-2 border-[#1E293B] border-t-[#3B5BDB] animate-spin"
        style={{ width: size, height: size }}
      />
      {text && (
        <p className="text-[11px] font-mono text-[#6B7280] animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
