"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { formatImageUrl } from "@/utils/imageHelper";
import ImagePreviewModal from "@/components/ui/ImagePreviewModal";

interface ProductImageGalleryProps {
  productName: string;
  qualityStandard: string;
  brandName: string;
  images: string[];
}

export default function ProductImageGallery({
  productName,
  qualityStandard,
  brandName,
  images,
}: ProductImageGalleryProps) {
  const safeImages = images && images.length > 0 ? images : ["/images/vehicle-category/dongco.png"];
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const activeImage = safeImages[selectedIdx] || safeImages[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIdx((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIdx((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3">
      {/* Main Image Container */}
      <div 
        onClick={() => setIsPreviewOpen(true)}
        className="relative w-full h-[360px] sm:h-[440px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs group cursor-zoom-in"
      >
        <Image
          key={`active-img-${selectedIdx}`}
          src={formatImageUrl(activeImage)}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Quality Standard Badge */}
        {qualityStandard && qualityStandard.trim() && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-brand text-white text-[11px] font-black uppercase shadow-xs z-10">
            {qualityStandard}
          </div>
        )}

        {/* Brand Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-slate-900/90 text-white text-[11px] font-bold uppercase backdrop-blur-xs z-10">
          {brandName}
        </div>

        {/* Image Zoom Hint Pill */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-slate-900/80 text-white text-xs font-bold backdrop-blur-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <ZoomIn className="w-4 h-4 text-brand" />
          <span>Click để phóng to ảnh sắc nét</span>
        </div>

        {/* Image Counter Pill */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-slate-900/70 text-white text-[10px] font-mono font-bold backdrop-blur-xs z-10">
            {selectedIdx + 1} / {safeImages.length}
          </div>
        )}

        {/* Prev / Next Navigation Arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Ảnh trước"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer z-20 border border-slate-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Ảnh tiếp theo"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer z-20 border border-slate-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Gallery Thumbnails List */}
      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 pt-1">
          {safeImages.map((img: string, idx: number) => {
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={`gallery-thumb-${idx}`}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`relative h-20 rounded-xl bg-slate-100 overflow-hidden border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-brand ring-2 ring-brand/20 opacity-100"
                    : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={formatImageUrl(img)}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Zoom Modal for High-Res Original Image Inspection */}
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        imageUrl={formatImageUrl(activeImage)}
        title={productName}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
