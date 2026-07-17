"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-500 rounded-full border ${
        isScrolled 
          ? "bg-white/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-white/50 py-0" 
          : "bg-black/20 backdrop-blur-md shadow-2xl border-white/10 py-1"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/images/logo/logonen.png" 
                alt="Q.BA Auto Parts Logo" 
                width={400} 
                height={150} 
                className={`w-auto h-12 md:h-14 object-contain transition-all duration-500 ${!isScrolled ? "brightness-0 invert drop-shadow-md" : ""}`}
                priority
              />
            </Link>
          </div>

          {/* Center Menu */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className={`${isScrolled ? "text-brand border-brand" : "text-white border-white drop-shadow-md"} font-bold font-heading border-b-2 pb-1 text-xs uppercase tracking-widest transition-colors`}>Trang chủ</Link>
            <Link href="#about" className={`${isScrolled ? "text-[#111317]/80 hover:text-brand" : "text-white/80 hover:text-white drop-shadow-md"} font-bold font-heading transition-colors text-xs uppercase tracking-widest flex items-center gap-1`}>Giới thiệu ▾</Link>
            <Link href="#products" className={`${isScrolled ? "text-[#111317]/80 hover:text-brand" : "text-white/80 hover:text-white drop-shadow-md"} font-bold font-heading transition-colors text-xs uppercase tracking-widest flex items-center gap-1`}>Sản phẩm ▾</Link>
            <Link href="#news" className={`${isScrolled ? "text-[#111317]/80 hover:text-brand" : "text-white/80 hover:text-white drop-shadow-md"} font-bold font-heading transition-colors text-xs uppercase tracking-widest flex items-center gap-1`}>Tin tức ▾</Link>
            <Link href="#recruit" className={`${isScrolled ? "text-[#111317]/80 hover:text-brand" : "text-white/80 hover:text-white drop-shadow-md"} font-bold font-heading transition-colors text-xs uppercase tracking-widest flex items-center gap-1`}>Tuyển dụng ▾</Link>
            <Link href="#contact" className={`${isScrolled ? "text-[#111317]/80 hover:text-brand" : "text-white/80 hover:text-white drop-shadow-md"} font-bold font-heading transition-colors text-xs uppercase tracking-widest`}>Liên hệ</Link>
          </nav>

          {/* Right Area (Lang & Search) */}
          <div className="flex items-center gap-4">
            <div className={`hidden sm:flex items-center gap-2 text-sm font-semibold cursor-pointer transition-colors ${isScrolled ? "text-gray-700 hover:text-brand" : "text-white hover:text-brand"}`}>
              Tiếng Việt ▾
            </div>
            <button className={`${isScrolled ? "bg-brand text-white hover:bg-brand-hover" : "bg-white text-black hover:bg-brand hover:text-white"} p-2 rounded-full transition-colors cursor-pointer shadow-lg`} aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            {/* Mobile Menu Toggle */}
            <button className={`lg:hidden p-2 cursor-pointer ${isScrolled ? "text-gray-700" : "text-white"}`} aria-label="Mở menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
