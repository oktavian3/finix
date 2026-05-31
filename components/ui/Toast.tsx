"use client";

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  subtext?: string;
}

let toastListeners: Array<(toast: Toast) => void> = [];

export function showToast(type: ToastType, message: string, subtext?: string) {
  const toast: Toast = { id: Date.now().toString(), type, message, subtext };
  toastListeners.forEach(fn => fn(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 4000);
    };
    toastListeners.push(listener);
    return () => { toastListeners = toastListeners.filter(l => l !== listener); };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const icons = {
    success: <CheckCircle size={16} className="text-[#15803D]" />,
    error: <XCircle size={16} className="text-[#B91C1C]" />,
    info: <AlertCircle size={16} className="text-[#3B5BDB]" />,
  };

  const bgColors = {
    success: 'bg-[#F0FDF4] border-[#BBF7D0]',
    error: 'bg-[#FEF2F2] border-[#FECACA]',
    info: 'bg-[#EFF6FF] border-[#BFDBFE]',
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${bgColors[toast.type]} border rounded-[12px] px-4 py-3 shadow-lg flex items-start gap-3 min-w-[300px] max-w-[400px] animate-slide-up hover-lift`}
        >
          <div className="mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#111827]">{toast.message}</p>
            {toast.subtext && <p className="text-xs text-[#6B7280] mt-0.5">{toast.subtext}</p>}
          </div>
          <button 
            onClick={() => removeToast(toast.id)} 
            className="w-6 h-6 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-black/5 transition-all duration-200"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
