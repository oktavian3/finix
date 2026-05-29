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
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none rounded-none';
  const variants = {
    primary: 'bg-[#3B5BDB] text-white hover:bg-[#4F6EF7] hover:shadow-[0_0_20px_rgba(59,91,219,0.4)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] border border-[#4F6EF7]',
    secondary: 'bg-transparent text-[#3B5BDB] hover:bg-[#3B5BDB]/10 hover:shadow-[0_0_15px_rgba(59,91,219,0.2)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] border border-[#3B5BDB]',
    ghost: 'bg-transparent text-[#9CA3AF] hover:text-white hover:bg-[#1E293B] active:bg-[#334155]',
    danger: 'bg-[#B91C1C] text-white hover:bg-[#DC2626] hover:shadow-[0_0_15px_rgba(185,28,28,0.4)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] border border-[#DC2626]',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-[11px] gap-1.5',
    md: 'px-4 py-2 text-[12px] gap-2',
    lg: 'px-5 py-2.5 text-[13px] gap-2',
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
