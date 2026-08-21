"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SearchModal from "@/components/public/SearchModal";
import { useQuotation } from "@/context/QuotationContext";
import { Search, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useQuotation();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 15;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
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

  const NAV_LINKS = [
    { name: "Trang chủ", href: "/" },
    { name: "Giới thiệu", href: "/about" },
    { name: "Sản phẩm", href: "/products" },
    { name: "Tin tức", href: "/news" },
    { name: "Tuyển dụng", href: "/careers" },
    { name: "Liên hệ", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 w-full z-40 transition-colors duration-300 ease-in-out ${
          isTransparent
            ? "bg-transparent text-white border-b border-transparent shadow-none"
            : "bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200/80 shadow-md"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-18 md:h-20">
            {/* Left Area: Logo & Inline Search Input */}
            <div className="flex items-center gap-4 lg:gap-6">
              {/* Logo */}
              <Link href="/" className="flex items-center shrink-0">
                <Image
                  src="/images/logo/logonen.png"
                  alt="Logo Phụ Tùng Ô Tô Q.BA"
                  width={450}
                  height={160}
                  className={`w-auto h-11 md:h-13 object-contain transition-all duration-300 ease-in-out ${
                    isTransparent ? "brightness-0 invert drop-shadow-md" : "brightness-100"
                  }`}
                  priority
                />
              </Link>

              {/* Inline Search Bar (Chuyển sang nền sáng khi lăn xuống) */}
              <div
                onClick={() => setIsSearchOpen(true)}
                className={`hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-full border text-xs cursor-pointer transition-all duration-300 ease-in-out w-48 md:w-60 lg:w-72 shadow-inner group ${
                  isTransparent
                    ? "bg-slate-900/50 backdrop-blur-xs border-white/20 text-slate-200 hover:border-red-500/80 hover:bg-slate-900/70"
                    : "bg-slate-100 border-slate-200/90 text-slate-700 hover:border-red-500/60 hover:bg-slate-200/80"
                }`}
                title="Tra cứu phụ tùng"
              >
                <Search className={`w-3.5 h-3.5 transition-colors duration-300 shrink-0 ${
                  isTransparent ? "text-slate-300 group-hover:text-red-400" : "text-slate-500 group-hover:text-red-600"
                }`} />
                <span className={`transition-colors duration-300 truncate ${
                  isTransparent ? "text-slate-300 group-hover:text-white drop-shadow-xs" : "text-slate-600 group-hover:text-slate-900"
                }`}>
                  Tìm kiếm phụ tùng, mã part no...
                </span>
              </div>
            </div>

            {/* Center Area: Minimalist Modern Navigation Links */}
            <nav className="hidden xl:flex items-center gap-6">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-heading font-extrabold text-xs uppercase tracking-wider transition-colors duration-300 py-1 relative ${
                      isActive
                        ? isTransparent
                          ? "text-red-500 after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-red-500"
                          : "text-red-600 after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-red-600"
                        : isTransparent
                        ? "text-white/90 hover:text-red-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        : "text-slate-800 hover:text-red-600"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Area: High-Contrast Action Button & Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              {/* Search Icon button for Mobile */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`sm:hidden p-2 rounded-full border cursor-pointer transition-colors duration-300 ${
                  isTransparent
                    ? "bg-slate-900/60 border-white/20 text-white hover:text-red-400"
                    : "bg-slate-100 border-slate-200 text-slate-800 hover:text-red-600"
                }`}
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Quotation Cart Button */}
              <Link
                href="/quotation"
                className={`relative px-4 py-2 rounded-full font-extrabold text-xs transition-all duration-300 ease-in-out shadow-md flex items-center gap-2 border group cursor-pointer ${
                  isTransparent
                    ? "bg-white hover:bg-red-600 text-slate-950 hover:text-white border-white/40"
                    : "bg-red-600 hover:bg-slate-900 text-white border-red-500 hover:border-slate-900"
                }`}
                title="Danh sách yêu cầu báo giá"
              >
                <span className="hidden sm:inline">Danh Sách Báo Giá</span>
                {totalItems > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black transition-colors duration-300 ${
                    isTransparent
                      ? "bg-red-600 group-hover:bg-white text-white group-hover:text-red-600"
                      : "bg-white group-hover:bg-red-600 text-red-600 group-hover:text-white"
                  }`}>
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`xl:hidden p-2 rounded-lg cursor-pointer transition-colors duration-300 ${
                  isTransparent ? "text-white hover:bg-white/10" : "text-slate-800 hover:bg-slate-100"
                }`}
                aria-label="Mở Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className={`xl:hidden border-t px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200 ${
            isTransparent
              ? "bg-slate-950/95 backdrop-blur-md text-white border-white/10"
              : "bg-white text-slate-900 border-slate-200 shadow-xl"
          }`}>
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={`mobile-${link.href}`}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-xl font-heading font-extrabold text-xs uppercase tracking-wider ${
                    isActive
                      ? "bg-red-600 text-white"
                      : isTransparent
                      ? "text-slate-300 hover:bg-white/10"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
