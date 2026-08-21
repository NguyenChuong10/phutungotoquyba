'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

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
    <div className="fixed top-6 right-6 z-[99999] max-w-md w-full animate-in slide-in-from-top-6 fade-in duration-300 pointer-events-auto">
      <div
        className={`relative overflow-hidden p-4 sm:p-4.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border backdrop-blur-xl transition-all ${
          isSuccess
            ? 'bg-slate-950/95 border-emerald-500/50 text-white ring-1 ring-emerald-500/30 shadow-emerald-950/40'
            : isError
            ? 'bg-slate-950/95 border-rose-500/50 text-white ring-1 ring-rose-500/30 shadow-rose-950/40'
            : 'bg-slate-950/95 border-sky-500/50 text-white ring-1 ring-sky-500/30 shadow-sky-950/40'
        }`}
      >
        {/* Glow ambient background highlight */}
        <div
          className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-40 ${
            isSuccess ? 'bg-emerald-500' : isError ? 'bg-rose-500' : 'bg-sky-500'
          }`}
        />

        <div className="relative z-10 flex items-start gap-3.5">
          {/* Icon Container with glowing ring */}
          <div
            className={`shrink-0 p-2.5 rounded-xl border flex items-center justify-center shadow-inner ${
              isSuccess
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 ring-4 ring-emerald-500/10'
                : isError
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 ring-4 ring-rose-500/10'
                : 'bg-sky-500/15 border-sky-500/30 text-sky-400 ring-4 ring-sky-500/10'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 animate-pulse" />}
            {isError && <AlertCircle className="w-5 h-5 animate-bounce" />}
            {!isSuccess && !isError && <Info className="w-5 h-5" />}
          </div>

          {/* Toast Text Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            {toast.title && (
              <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 mb-1">
                <span>{toast.title}</span>
                <Sparkles
                  className={`w-3 h-3 ${
                    isSuccess ? 'text-emerald-400' : isError ? 'text-rose-400' : 'text-sky-400'
                  }`}
                />
              </h4>
            )}
            <p className="text-xs font-medium text-slate-200 leading-relaxed break-words">
              {toast.message}
            </p>
          </div>

          {/* Close Action */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0 border border-white/10"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className={`h-full animate-toast-progress ${
              isSuccess
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300'
                : isError
                ? 'bg-gradient-to-r from-rose-600 via-red-500 to-rose-400'
                : 'bg-gradient-to-r from-sky-500 via-blue-400 to-cyan-300'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
