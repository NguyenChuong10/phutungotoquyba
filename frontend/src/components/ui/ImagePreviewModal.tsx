'use client';

import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export default function ImagePreviewModal({
  isOpen,
  imageUrl,
  title,
  onClose,
}: ImagePreviewModalProps) {
  const [zoomLevel, setZoomLevel] = useState(1);

  // Reset zoom on open or change image
  useEffect(() => {
    setZoomLevel(1);
  }, [imageUrl, isOpen]);

  // Handle ESC key press to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.3, 2.5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.max(prev - 0.3, 0.7));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(1);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none cursor-pointer"
      onClick={onClose}
    >
      {/* Top Header Bar with Title & Close Button */}
      <div
        className="w-full max-w-5xl flex items-center justify-between z-10 py-2 px-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-white shadow-xl backdrop-blur-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0">
          <ZoomIn className="w-5 h-5 text-red-500 shrink-0" />
          <span className="font-extrabold text-sm text-slate-100 truncate">
            {title || 'Xem Ảnh Phóng To Sản Phẩm Q.BA'}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            title="Thu nhỏ (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-extrabold text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
            title="Đặt lại kích thước chuẩn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{Math.round(zoomLevel * 100)}%</span>
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            title="Phóng to (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-700 mx-1"></div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold transition-colors cursor-pointer shadow-md"
            title="Đóng (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-hidden my-auto py-4 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-h-[80vh] max-w-full flex items-center justify-center overflow-auto rounded-3xl bg-black/40 border border-slate-800/80 p-2 shadow-2xl custom-scrollbar">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title || 'Phụ tùng Q.BA'}
            style={{ transform: `scale(${zoomLevel})` }}
            className="max-h-[75vh] max-w-full object-contain rounded-2xl transition-transform duration-200 ease-out shadow-2xl"
          />
        </div>
      </div>

      {/* Footer Info Prompt */}
      <div
        className="px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 text-[11px] font-medium text-center z-10"
        onClick={(e) => e.stopPropagation()}
      >
        Mẹo: Bấm phím <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">ESC</kbd> hoặc click bất kỳ vị trí bên ngoài để đóng ảnh
      </div>
    </div>
  );
}
