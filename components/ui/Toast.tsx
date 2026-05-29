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
    success: <CheckCircle size={15} className="text-[#15803D]" />,
    error: <XCircle size={15} className="text-[#B91C1C]" />,
    info: <AlertCircle size={15} className="text-[#3B5BDB]" />,
  };

  const accentColors = {
    success: 'border-l-[#15803D]',
    error: 'border-l-[#B91C1C]',
    info: 'border-l-[#3B5BDB]',
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`bg-[#111827] border border-[#1E293B] ${accentColors[toast.type]} border-l-2 rounded-none px-4 py-3 shadow-lg flex items-start gap-3 min-w-[300px] max-w-[400px] animate-slide-up`}
        >
          <div className="mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-white">{toast.message}</p>
            {toast.subtext && <p className="text-[10px] font-mono text-[#6B7280] mt-0.5">{toast.subtext}</p>}
          </div>
          <button onClick={() => removeToast(toast.id)} className="text-[#6B7280] hover:text-white transition-colors">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
