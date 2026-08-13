"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight, Package, Tag, CheckCircle2 } from "lucide-react";
import { formatImageUrl } from "@/utils/imageHelper";
import { productService } from "@/services/productService";
import { Product } from "@/types/product";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_TAGS = [
  "VG1500060050",
  "YUCHAI 6L",
  "Máy nén khí",
  "Mâm phanh Mooc",
  "Hộp số Fast",
  "Bạc đạn Moay ơ",
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input khi mở Modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Phím tắt Esc để đóng
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lọc sản phẩm thời gian thực khi gõ
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const filtered = productService.filterProducts({ searchQuery: query });
    setResults(filtered);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 sm:px-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-[#111317] border border-slate-700/80 rounded-2xl shadow-[0_0_50px_rgba(217,4,41,0.25)] overflow-hidden z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Search Header Input */}
        <div className="relative flex items-center px-6 py-4 border-b border-slate-800 bg-slate-900/90 gap-3">
          <Search className="w-6 h-6 text-[#FF0000] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập mã Part No., tên phụ tùng, thương hiệu xe (HOWO, YUCHAI, WEICHAI...)..."
            className="w-full bg-transparent text-white placeholder-slate-400 font-medium text-lg focus:outline-none pr-2"
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="p-1.5 text-slate-400 hover:text-white transition-colors shrink-0"
              aria-label="Xóa nội dung"
              title="Xóa nội dung tìm kiếm"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 bg-slate-800/80 hover:bg-[#FF0000] text-slate-300 hover:text-white rounded-full transition-all shrink-0 ml-2 shadow-md cursor-pointer"
            aria-label="Đóng cửa sổ tìm kiếm"
            title="Đóng cửa sổ (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popular Tags (khi chưa gõ từ khóa) */}
        {!query.trim() && (
          <div className="p-6 overflow-y-auto">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Tag className="w-4 h-4 text-[#FF0000]" />
              Gợi ý tìm kiếm phổ biến
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-4 py-2 bg-slate-800/80 hover:bg-[#FF0000] text-slate-200 hover:text-white text-sm font-semibold rounded-full border border-slate-700 transition-all cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FF0000]/10 border border-[#FF0000]/30 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-[#FF0000]" />
              </div>
              <div className="text-sm">
                <div className="text-white font-bold mb-0.5">Kho Phụ Tùng Q.BA Đà Nẵng</div>
                <div className="text-slate-400 text-xs">
                  Tra cứu hơn 10,000+ mã SKU phụ tùng xe tải nặng, xe đầu kéo & máy công trình chính hãng.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        {query.trim() !== "" && (
          <div className="p-6 overflow-y-auto divide-y divide-slate-800">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider pb-3 flex justify-between items-center">
              <span>Kết quả tìm kiếm ({results.length})</span>
              <span className="text-slate-500">Từ khóa: &quot;{query}&quot;</span>
            </div>

            {results.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-bounce" />
                <p className="text-slate-300 font-bold mb-1">Không tìm thấy mã phụ tùng phù hợp</p>
                <p className="text-slate-400 text-xs mb-6">Vui lòng kiểm tra lại mã Part No. hoặc liên hệ Hotline Zalo để kỹ thuật viên tra cứu giúp bạn.</p>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 bg-[#FF0000] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-white hover:text-[#FF0000] transition-colors"
                >
                  Gửi yêu cầu tra cứu Zalo hỏa tốc
                </Link>
              </div>
            ) : (
              <div className="space-y-3 pt-3">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={onClose}
                    className="group flex items-center gap-4 p-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/80 border border-transparent hover:border-[#FF0000]/40 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-lg bg-black shrink-0 overflow-hidden border border-slate-800">
                      <Image
                        src={formatImageUrl(product.imageSrc)}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="64px"
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-[#FF0000]/10 border border-[#FF0000]/30 text-[#FF0000] text-[10px] font-extrabold uppercase rounded">
                          {product.brand}
                        </span>
                        <span className="text-slate-400 text-xs font-mono">Part No: <span className="text-white font-bold">{product.partNumber}</span></span>
                      </div>
                      <h4 className="text-white font-bold text-sm truncate group-hover:text-[#FF0000] transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-slate-400 text-xs truncate mt-0.5">
                        Tương thích: {product.compatibility.join(", ")}
                      </p>
                    </div>

                    {/* Stock Status & Arrow */}
                    <div className="shrink-0 flex items-center gap-3">
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold px-2.5 py-1 bg-emerald-950/50 border border-emerald-800/50 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Sẵn Kho ĐN
                      </span>
                      <div className="p-2 rounded-full bg-slate-800 group-hover:bg-[#FF0000] text-slate-300 group-hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Q.BA Auto Parts</span>
            <span>- Phụ tùng xe tải nặng chính hãng Đà Nẵng</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span>Bấm <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">ESC</kbd> để đóng</span>
          </div>
        </div>

      </div>
    </div>
  );
}
