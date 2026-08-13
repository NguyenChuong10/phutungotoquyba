"use client";

import React, { useState, useEffect } from "react";
import { fetchApi } from "@/config/api";

interface BrandItem {
  id: string | number;
  name: string;
  logoUrl: string;
}

export default function BrandSlider() {
  const [brands, setBrands] = useState<BrandItem[]>([]);

  useEffect(() => {
    async function loadPartnerBrands() {
      try {
        const res = await fetchApi("/partner-brands");
        if (res.ok && Array.isArray(res.data)) {
          setBrands(res.data);
        }
      } catch (err) {
        console.error("Failed to load partner brands from database:", err);
      }
    }
    loadPartnerBrands();
  }, []);

  if (brands.length === 0) {
    return null;
  }

  // Duplicate array to create a seamless infinite loop
  const slideItems = [...brands, ...brands, ...brands];

  return (
    <section className="py-20 bg-[#111317] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>
        <div className="absolute top-48 -right-24 w-96 h-96 bg-brand rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10 mb-12 text-center">
        <div className="inline-block px-4 py-1 rounded-sm border border-brand/50 bg-brand/10 text-brand font-bold text-xs mb-6 uppercase tracking-widest font-heading">
          Khát vọng vươn xa
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white font-heading uppercase tracking-wider mb-2">
          ĐỐI TÁC <span className="text-brand">THƯƠNG HIỆU</span>
        </h2>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
          Tự hào là đơn vị phân phối chính hãng các sản phẩm phụ tùng ô tô từ các thương hiệu hàng đầu trên thế giới.
        </p>
      </div>

      {/* Single Marquee Slider */}
      <div className="relative w-full overflow-hidden flex z-10 py-10">
        <div className="flex w-max animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
          {slideItems.map((brand, index) => (
            <div
              key={`brand-${brand.id}-${index}`}
              className="group relative h-[120px] w-[240px] md:w-[280px] rounded-xl overflow-hidden cursor-pointer transition-all duration-500 border border-transparent hover:border-brand/50 flex-shrink-0 mx-4 flex items-center justify-center hover:scale-105 hover:shadow-[0_0_25px_rgba(217,4,41,0.2)] bg-white"
            >
              {/* Clear background image/logo */}
              <div className="absolute inset-0 p-4 flex items-center justify-center">
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-full h-full object-contain p-2 transition-all duration-500 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Dark Overlay only on hover for text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111317]/90 via-[#111317]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

              {/* Content (Brand Name) appears on hover */}
              <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <h3 className="text-xl font-black font-heading text-white uppercase tracking-wider drop-shadow-md">
                  {brand.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
