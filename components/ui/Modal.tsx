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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={`${sizes[size]} w-full mx-4 bg-white rounded-[16px] shadow-xl border border-[#E2E8F0]`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
            <h2 className="text-[14px] font-semibold text-[#111827]">{title}</h2>
            <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#374151] transition-colors">
              <X size={16} />
            </button>
          </div>
        )}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
