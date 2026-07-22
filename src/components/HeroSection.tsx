"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";


// 1 & 3 & 4. Dùng ảnh local cho production thay vì Unsplash, thêm ID để làm key
const slides = [
  { 
    id: "slide-1", 
    bgImage: "/images/hero-section/phutungxedaukeo.png", 
    alt: "Phụ tùng xe đầu kéo",
    blackText: "PHỤ TÙNG",
    redText: "XE ĐẦU KÉO"
  },
  { 
    id: "slide-2", 
    bgImage: "/images/hero-section/phutungxeben.png", 
    alt: "Phụ tùng xe ben",
    blackText: "PHỤ TÙNG",
    redText: "XE BEN"
  },
  { 
    id: "slide-3", 
    bgImage: "/images/hero-section/phutungromooc.png", 
    alt: "Phụ tùng rơ moóc",
    blackText: "PHỤ TÙNG",
    redText: "RƠ-MOÓC"
  },
  { 
    id: "slide-4", 
    bgImage: "/images/hero-section/phutunghopso.png", 
    alt: "Phụ tùng hộp số",
    blackText: "PHỤ TÙNG",
    redText: "HỘP SỐ"
  },
  { 
    id: "slide-5", 
    bgImage: "/images/hero-section/phutunggam.png", 
    alt: "Phụ tùng gầm",
    blackText: "PHỤ TÙNG",
    redText: "GẦM"
  },
  { 
    id: "slide-6", 
    bgImage: "/images/hero-section/phutungdongcomayphat.png", 
    alt: "Phụ tùng động cơ máy phát",
    blackText: "PHỤ TÙNG",
    redText: "ĐỘNG CƠ MÁY PHÁT"
  },
  { 
    id: "slide-7", 
    bgImage: "/images/hero-section/phutungdongcomaycongtrinh.png", 
    alt: "Phụ tùng động cơ máy công trình",
    blackText: "PHỤ TÙNG",
    redText: "ĐỘNG CƠ MÁY CÔNG TRÌNH"
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // 8. Tối ưu performance: Chỉ chạy animation khi tab đang active
      if (document.visibilityState === 'visible') {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[95vh] min-h-[700px] max-h-[1000px] flex items-center justify-center overflow-hidden bg-white">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 motion-reduce:transition-none ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* Full size object-cover image stretching top to bottom under transparent navbar */}
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

      {/* Slide Text Captions - Under the slide image */}
      {slides.map((slide, index) => (
        <div
          key={`caption-${slide.id}`}
          className={`absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 z-10 text-center transition-all duration-700 ease-out transform px-4 w-full flex justify-center ${
            index === currentSlide
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
              : "opacity-0 translate-y-6 scale-95 pointer-events-none"
          }`}
        >
          <div className="inline-flex items-center justify-center bg-white/95 backdrop-blur-md px-6 py-2.5 md:px-10 md:py-3.5 rounded-2xl shadow-xl border border-slate-200/80 max-w-[92vw]">
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold uppercase tracking-wider font-heading leading-tight text-center">
              <span className="text-black">{slide.blackText} </span>
              <span className="text-[#FF0000]">{slide.redText}</span>
            </h2>
          </div>
        </div>
      ))}

      {/* Left Navigation Arrow */}
      <button 
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 hover:bg-brand text-slate-800 hover:text-white backdrop-blur-sm transition-all duration-300 border border-slate-200 hover:border-brand shadow-sm hover:scale-110"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Right Navigation Arrow */}
      <button 
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 hover:bg-brand text-slate-800 hover:text-white backdrop-blur-sm transition-all duration-300 border border-slate-200 hover:border-brand shadow-sm hover:scale-110"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Content */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((slide, index) => (
          <button
            key={`dot-${slide.id}`}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 motion-reduce:transition-none cursor-pointer ${
              index === currentSlide ? "bg-brand scale-125 shadow-sm" : "bg-slate-300 hover:bg-brand/50"
            }`}
            aria-label={`Chuyển đến slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
