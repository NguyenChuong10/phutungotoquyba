"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatImageUrl } from "@/utils/imageHelper";

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

  const activeImage = safeImages[selectedIdx] || safeImages[0];

  return (
    <div className="space-y-4">
      {/* Main Hero Image Box */}
      <div className="relative w-full h-[380px] sm:h-[480px] bg-slate-100 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-2xl group">
        <Image
          src={formatImageUrl(activeImage)}
          alt={productName}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-[#FF0000] text-white text-xs font-black tracking-widest uppercase shadow-lg">
          {qualityStandard}
        </div>
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900/90 text-white text-xs font-bold uppercase backdrop-blur-md">
          {brandName}
        </div>
      </div>

      {/* Gallery Thumbnails List */}
      {safeImages.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {safeImages.map((img: string, idx: number) => {
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={`gallery-thumb-${idx}`}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`relative h-24 rounded-2xl bg-slate-100 overflow-hidden border-2 transition-all cursor-pointer shadow-md ${
                  isSelected
                    ? "border-red-600 ring-4 ring-red-500/20 scale-105 opacity-100"
                    : "border-slate-200 hover:border-red-300 opacity-70 hover:opacity-100"
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
    </div>
  );
}
