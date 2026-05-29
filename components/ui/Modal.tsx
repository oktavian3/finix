"use client";

import { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-[400px]',
    md: 'max-w-[500px]',
    lg: 'max-w-[640px]',
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={`${sizes[size]} w-full mx-4 bg-[#111827] rounded-none shadow-[0_0_40px_rgba(59,91,219,0.15)] border border-[#1E293B]`}>
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E293B] border-t-2 border-t-[#3B5BDB]">
            <h2 className="text-[13px] font-semibold text-white font-mono tracking-wide uppercase">{title}</h2>
            <button onClick={onClose} className="text-[#6B7280] hover:text-white transition-colors">
              <X size={15} />
            </button>
          </div>
        )}
        <div className="px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
