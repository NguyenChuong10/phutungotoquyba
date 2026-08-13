"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SearchModal from "@/components/public/SearchModal";
import { useQuotation } from "@/context/QuotationContext";
import { FileText } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useQuotation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hotkey Cmd+K / Ctrl+K cho SearchModal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isHomePage = pathname === "/";
  const isTransparent = isHomePage && !isScrolled;

  return (
    <>
      <header 
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-40 transition-all duration-500 rounded-full border ${
          isTransparent 
            ? "bg-transparent border-transparent shadow-none backdrop-blur-none py-1"
            : "bg-white/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-slate-200/60 py-0"
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
                  width={450} 
                  height={160} 
                  className={`w-auto h-14 md:h-16 lg:h-18 object-contain transition-all duration-500 ${isTransparent ? "brightness-0 invert drop-shadow-md" : ""}`}
                  priority
                />
              </Link>
            </div>

            {/* Center Menu */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              <Link 
                href="/" 
                className={`${
                  pathname === "/" 
                    ? (isTransparent ? "text-white border-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-b-2 pb-1" : "text-[#FF0000] border-[#FF0000] border-b-2 pb-1") 
                    : (isTransparent ? "text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:text-white" : "text-slate-800 hover:text-[#FF0000]")
                } font-bold font-heading text-sm uppercase tracking-wider transition-colors`}
              >
                Trang chủ
              </Link>

              <Link 
                href="/about" 
                className={`${
                  pathname === "/about" 
                    ? (isTransparent ? "text-white border-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-b-2 pb-1" : "text-[#FF0000] border-[#FF0000] border-b-2 pb-1") 
                    : (isTransparent ? "text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:text-white" : "text-slate-800 hover:text-[#FF0000]")
                } font-bold font-heading text-sm uppercase tracking-wider flex items-center gap-1 transition-colors`}
              >
                Giới thiệu
              </Link>

              <Link 
                href="/products" 
                className={`${
                  pathname.startsWith("/products") 
                    ? (isTransparent ? "text-white border-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-b-2 pb-1" : "text-[#FF0000] border-[#FF0000] border-b-2 pb-1") 
                    : (isTransparent ? "text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:text-white" : "text-slate-800 hover:text-[#FF0000]")
                } font-bold font-heading text-sm uppercase tracking-wider transition-colors`}
              >
                Sản phẩm
              </Link>

              <Link 
                href="/news" 
                className={`${
                  pathname.startsWith("/news") 
                    ? (isTransparent ? "text-white border-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-b-2 pb-1" : "text-[#FF0000] border-[#FF0000] border-b-2 pb-1") 
                    : (isTransparent ? "text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:text-white" : "text-slate-800 hover:text-[#FF0000]")
                } font-bold font-heading text-sm uppercase tracking-wider transition-colors`}
              >
                Tin tức
              </Link>

              <Link 
                href="/careers" 
                className={`${
                  pathname === "/careers" 
                    ? (isTransparent ? "text-white border-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-b-2 pb-1" : "text-[#FF0000] border-[#FF0000] border-b-2 pb-1") 
                    : (isTransparent ? "text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:text-white" : "text-slate-800 hover:text-[#FF0000]")
                } font-bold font-heading text-sm uppercase tracking-wider transition-colors`}
              >
                Tuyển dụng
              </Link>

              <Link 
                href="/contact" 
                className={`${
                  pathname === "/contact" 
                    ? (isTransparent ? "text-white border-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-b-2 pb-1" : "text-[#FF0000] border-[#FF0000] border-b-2 pb-1") 
                    : (isTransparent ? "text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:text-white" : "text-slate-800 hover:text-[#FF0000]")
                } font-bold font-heading text-sm uppercase tracking-wider transition-colors`}
              >
                Liên hệ
              </Link>
            </nav>

            {/* Right Area (Quotations, Search, Language) */}
            <div className="flex items-center gap-3">
              <div className={`hidden sm:flex items-center gap-2 text-sm font-bold cursor-pointer transition-colors ${
                isTransparent ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:text-[#FF0000]" : "text-[#FF0000] hover:text-[#111317]"
              }`}>
                Tiếng Việt ▾
              </div>

              {/* Quotation Cart Button */}
              <Link
                href="/quotation"
                className={`relative p-2.5 rounded-full transition-all cursor-pointer shadow-lg flex items-center justify-center ${
                  isTransparent 
                    ? "bg-white/10 hover:bg-white text-white hover:text-black border border-white/20" 
                    : "bg-slate-100 hover:bg-[#FF0000] text-slate-800 hover:text-white border border-slate-200"
                }`}
                title="Danh sách yêu cầu báo giá"
              >
                <FileText className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF0000] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Search Trigger Button */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className={`${
                  isTransparent 
                    ? "bg-white text-black hover:bg-[#FF0000] hover:text-white" 
                    : "bg-[#FF0000] text-white hover:bg-[#111317]"
                } p-2.5 rounded-full transition-colors cursor-pointer shadow-lg flex items-center justify-center`} 
                aria-label="Tìm kiếm phụ tùng"
                title="Tìm kiếm phụ tùng (Cmd+K)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>

              {/* Mobile Menu Toggle */}
              <button className={`lg:hidden p-2 cursor-pointer ${
                isTransparent ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" : "text-[#FF0000]"
              }`} aria-label="Mở menu">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}
