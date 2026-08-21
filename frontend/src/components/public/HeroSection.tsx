"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const slides = [
  { 
    id: "slide-1", 
    bgImage: "/images/hero-section/phutungxedaukeo.png", 
    alt: "Phụ tùng xe đầu kéo",
    redText: "XE ĐẦU KÉO"
  },
  { 
    id: "slide-2", 
    bgImage: "/images/hero-section/phutungxeben.png", 
    alt: "Phụ tùng xe ben",
    redText: "XE BEN"
  },
  { 
    id: "slide-3", 
    bgImage: "/images/hero-section/phutungromooc.png", 
    alt: "Phụ tùng rơ moóc",
    redText: "RƠ-MOÓC"
  },
  { 
    id: "slide-4", 
    bgImage: "/images/hero-section/phutunghopso.png", 
    alt: "Phụ tùng hộp số",
    redText: "HỘP SỐ"
  },
  { 
    id: "slide-5", 
    bgImage: "/images/hero-section/phutunggam.png", 
    alt: "Phụ tùng gầm",
    redText: "GẦM"
  },
  { 
    id: "slide-6", 
    bgImage: "/images/hero-section/phutungdongcomayphat.png", 
    alt: "Phụ tùng động cơ máy phát",
    redText: "ĐỘNG CƠ MÁY PHÁT"
  },
  { 
    id: "slide-7", 
    bgImage: "/images/hero-section/phutungdongcomaycongtrinh.png", 
    alt: "Phụ tùng động cơ máy công trình",
    redText: "ĐỘNG CƠ MÁY CÔNG TRÌNH"
  }
];

export default function HeroSection() {
  const { settings } = useSiteSettings();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[95vh] min-h-[700px] max-h-[1000px] flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 motion-reduce:transition-none ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={slide.bgImage}
              alt={slide.alt}
              fill
              priority={index === 0}
              className="object-cover transition-transform duration-[20s] ease-linear scale-100 hover:scale-[1.03]"
              sizes="100vw"
              unoptimized={true}
            />
          </div>
        </div>
      ))}

      {/* Hero Title & Sub-slogan Tagline */}
      <div className="absolute bottom-16 md:bottom-20 left-6 sm:left-12 md:left-16 lg:left-24 z-10 max-w-4xl space-y-3">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-wider font-heading leading-tight flex flex-wrap items-center gap-x-3 gap-y-1">
          {/* Static "PHỤ TÙNG |" Text */}
          <span className="text-black drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)] flex items-center gap-3">
            <span>PHỤ TÙNG</span>
            <span className="text-black font-light not-italic">|</span>
          </span>

          {/* Dynamic Category Text - Switches per slide in Red Italic Font */}
          <span className="relative inline-block min-w-[200px] sm:min-w-[260px] md:min-w-[360px] h-[1.3em]">
            {slides.map((slide, index) => (
              <span
                key={`cat-${slide.id}`}
                className={`absolute left-0 top-0 text-[#FF0000] drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)] whitespace-nowrap transition-all duration-700 ease-out ${
                  index === currentSlide
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
              >
                {slide.redText}
              </span>
            ))}
          </span>
        </h2>

        {/* Industrial Red Bar Sub-slogan Tagline */}
        {settings.homeHeroSlogan && (
          <div className="flex items-center gap-3 pt-1">
            <div className="h-5 w-1 bg-red-600 rounded-full shrink-0 shadow-sm"></div>
            <p className="text-gray-200 text-xs sm:text-sm md:text-base font-bold tracking-widest uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] font-heading">
              {settings.homeHeroSlogan}
            </p>
          </div>
        )}
      </div>

      {/* Centered Slide Pagination Dots - Positioned centered at bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {slides.map((slide, index) => (
          <button
            key={`dot-${slide.id}`}
            onClick={() => setCurrentSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentSlide
                ? 'w-8 bg-[#FF0000] shadow-md shadow-red-900/50'
                : 'w-2.5 bg-white/60 hover:bg-white'
            }`}
            aria-label={`Chuyển đến slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Left Navigation Arrow */}
      <button 
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-900/60 hover:bg-red-600 text-white backdrop-blur-md transition-all duration-300 border border-white/20 hover:border-red-600 shadow-lg hover:scale-110 cursor-pointer"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Right Navigation Arrow */}
      <button 
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-900/60 hover:bg-red-600 text-white backdrop-blur-md transition-all duration-300 border border-white/20 hover:border-red-600 shadow-lg hover:scale-110 cursor-pointer"
        aria-label="Next slide"
      >

        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </section>
  );
}
