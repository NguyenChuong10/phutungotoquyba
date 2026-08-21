'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

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
  title = 'Xác Nhận Xóa',
  message,
  itemName,
  confirmText = 'Xóa Vĩnh Viễn',
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 z-[101] p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          disabled={isLoading}
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Clean Icon Badge */}
        <div className="flex flex-col items-center text-center space-y-2 pt-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
            isDanger ? 'bg-red-50 border-red-100 text-red-600' : 'bg-amber-50 border-amber-100 text-amber-600'
          }`}>
            {isDanger ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>

          <h3 className="text-base font-extrabold text-slate-900 pt-1">
            {title}
          </h3>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {message} {itemName && <strong className="text-slate-900 font-bold">&ldquo;{itemName}&rdquo;</strong>}?
          </p>
        </div>

        {/* Highlighted Safety Note */}
        <div className={`p-3 rounded-xl border text-[11px] font-bold text-center flex items-center justify-center gap-1.5 shadow-2xs ${
          isDanger
            ? 'bg-red-50 border-red-200/90 text-red-700'
            : 'bg-amber-50 border-amber-200/90 text-amber-800'
        }`}>
          <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isDanger ? 'text-red-600' : 'text-amber-600'}`} />
          <span>Hành động này sẽ xóa dữ liệu vĩnh viễn và không thể khôi phục.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
