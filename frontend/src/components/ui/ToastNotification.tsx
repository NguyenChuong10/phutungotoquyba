'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function ToastNotification({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${isSuccess
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50'
            : isError
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-950/50'
              : 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-slate-950/50'
          }`}
      >
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400" />}
        </div>

        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="text-xs font-black uppercase tracking-wider mb-0.5">
              {toast.title}
            </h4>
          )}
          <p className="text-xs font-medium leading-relaxed break-words">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 text-white/70 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
