"use client";

import { Loader2 } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function Button({ 
  children, onClick, variant = 'primary', size = 'md', 
  disabled, loading, className = '', type = 'button' 
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none';
  const variants = {
    primary: 'bg-[#3B5BDB] text-white hover:bg-[#3451D0] active:bg-[#2E48BC]',
    secondary: 'bg-[#EEF2FF] text-[#3B5BDB] hover:bg-[#DBE4FF] active:bg-[#C5D0FF] border border-[#C5D0FF]',
    ghost: 'bg-transparent text-[#374151] hover:bg-[#F5F7FF] active:bg-[#EEF2FF]',
    danger: 'bg-[#B91C1C] text-white hover:bg-[#A01818] active:bg-[#8B1414]',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-[11px] rounded-[8px] gap-1.5',
    md: 'px-4 py-2 text-[12px] rounded-[10px] gap-2',
    lg: 'px-5 py-2.5 text-[13px] rounded-[12px] gap-2',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {loading && <Loader2 size={size === 'sm' ? 13 : 15} className="animate-spin" />}
      {children}
    </button>
  );
}
