'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader2, ShieldAlert } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = 'Xác Nhận Xóa Dữ Liệu',
  message,
  itemName,
  confirmText = 'Xác Nhận Xóa',
  cancelText = 'Hủy Bỏ',
  type = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const isDanger = type === 'danger';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-200 z-[101]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Beam */}
        <div className={`h-2 w-full ${isDanger ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-700' : 'bg-gradient-to-r from-amber-500 to-orange-600'}`} />

        {/* Close Button */}
        <button
          disabled={isLoading}
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
          aria-label="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7 text-center space-y-4">
          {/* Animated Icon Container with Glowing Aura */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full blur-xl opacity-60 animate-pulse ${isDanger ? 'bg-red-400' : 'bg-amber-400'}`} />
            <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner ${
              isDanger 
                ? 'bg-gradient-to-br from-red-50 to-rose-100/90 border-red-200 text-red-600 ring-4 ring-red-500/10' 
                : 'bg-gradient-to-br from-amber-50 to-orange-100/90 border-amber-200 text-amber-600 ring-4 ring-amber-500/10'
            }`}>
              {isDanger ? (
                <Trash2 className="w-8 h-8 text-red-600 drop-shadow-xs" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-600 drop-shadow-xs" />
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100/80 text-red-700 text-[11px] font-extrabold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Cảnh Báo Cảnh Báo</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h3>
          </div>

          {/* Message & Highlight Item Name */}
          <div className="space-y-2.5">
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {message}
            </p>

            {itemName && (
              <div className="p-3 rounded-2xl bg-slate-900 text-white font-extrabold text-xs sm:text-sm font-mono break-all inline-flex items-center justify-center gap-2 max-w-full shadow-md border border-slate-800">
                <span className="text-red-400">🗑️</span>
                <span>&ldquo;{itemName}&rdquo;</span>
              </div>
            )}

            {isDanger && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-semibold flex items-center justify-center gap-1.5">
                <span>⚠️ Thao tác này sẽ xóa dữ liệu vĩnh viễn và không thể khôi phục.</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="w-1/2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {cancelText}
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`w-1/2 py-3 px-4 rounded-xl text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50 ${
                isDanger
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 shadow-red-900/30'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-900/30'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xóa...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

