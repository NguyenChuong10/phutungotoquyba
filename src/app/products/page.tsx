"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Filter, CheckCircle2, ChevronRight, RefreshCw, Tag, ShoppingCart } from "lucide-react";

import { productsData, categoriesList, brandsList, Product } from "@/data/productsData";
import QuotationModal from "@/components/QuotationModal";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("Tất cả thương hiệu");
  
  // Quotation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  const handleOpenQuoteModal = (product?: Product) => {
    setModalProduct(product || null);
    setIsModalOpen(true);
  };

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return productsData.filter((p) => {
      // Category Filter
      const matchCat = selectedCategory === "all" || p.categorySlug === selectedCategory;
      // Brand Filter
      const matchBrand = selectedBrand === "Tất cả thương hiệu" || p.brand === selectedBrand;
      // Search Query Filter (Search in name, partNumber, internalCode, internalName)
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q) ||
        p.internalCode.toLowerCase().includes(q) ||
        p.internalName.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);

      return matchCat && matchBrand && matchSearch;
    });
  }, [searchQuery, selectedCategory, selectedBrand]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedBrand("Tất cả thương hiệu");
  };

  return (
    <div>

      {/* 1. Header Banner */}
      <section className="bg-[#111317] text-white pt-32 md:pt-40 pb-16 md:pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-black tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
            E-Catalogue Phụ Tùng Xe Tải Nặng Q.BA
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black font-heading uppercase tracking-wide leading-tight mb-6">
            TRA CỨU & BÁO GIÁ <span className="text-brand">PHỤ TÙNG CHÍNH HÃNG</span>
          </h1>

          <p className="text-gray-300 text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            Tra cứu theo Mã nhà máy (Part No.), Mã quản lý nội bộ và Chủng loại xe. Cam kết 80% hàng OEM cao cấp sẵn kho Đà Nẵng.
          </p>
        </div>
      </section>

      {/* 2. Main E-Catalogue Section (2 Columns) */}
      <section className="py-16 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl space-y-8">

          {/* Top Search Input Bar */}
          <div className="p-4 md:p-6 rounded-3xl bg-white border border-slate-200 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-2/3">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Nhập Mã Phụ Tùng (vd: VG1560080012, JS160T...), Mã Nội Bộ (QB-DC...) hoặc Tên phụ tùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-brand focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tìm thấy: <strong className="text-brand text-base font-black">{filteredProducts.length}</strong> sản phẩm
              </span>
              {(searchQuery || selectedCategory !== "all" || selectedBrand !== "Tất cả thương hiệu") && (
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={14} />
                  Xóa Lọc
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sidebar Filter (Col 3) */}
            <aside className="lg:col-span-3 space-y-6">
              {/* Category Filter Box */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-4">
                <h3 className="text-sm font-black font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Filter size={18} className="text-brand" />
                  DANH MỤC PHỤ TÙNG
                </h3>

                <div className="space-y-1">
                  {categoriesList.map((cat) => {
                    const isActive = selectedCategory === cat.slug;
                    return (
                      <button
                        key={`cat-filter-${cat.slug}`}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between ${
                          isActive 
                            ? "bg-brand text-white shadow-md shadow-brand/30" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-brand"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isActive && <ChevronRight size={16} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand Filter Box */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-4">
                <h3 className="text-sm font-black font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Tag size={18} className="text-brand" />
                  THƯƠNG HIỆU SẢN XUẤT
                </h3>

                <div className="space-y-1">
                  {brandsList.map((brand, bIdx) => {
                    const isActive = selectedBrand === brand;
                    return (
                      <button
                        key={`brand-filter-${bIdx}`}
                        onClick={() => setSelectedBrand(brand)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between ${
                          isActive 
                            ? "bg-slate-900 text-white shadow-md" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-brand"
                        }`}
                      >
                        <span>{brand}</span>
                        {isActive && <CheckCircle2 size={16} className="text-brand" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Zalo Direct Support Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-brand to-red-700 text-white shadow-xl space-y-3">
                <h4 className="font-black text-base uppercase">BÁO GIÁ PHỤ TÙNG HỎA TỐC</h4>
                <p className="text-xs text-red-100 leading-relaxed">
                  Bạn có sẵn hình ảnh phụ tùng hỏng? Gửi Zalo 0903.588.167 để kỹ thuật Q.BA soi mã báo giá trong 5 phút.
                </p>
                <a 
                  href="https://zalo.me/0903588167" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-white text-brand font-black rounded-xl text-xs uppercase tracking-wider block text-center shadow-lg hover:bg-red-50 transition-colors"
                >
                  CHAT ZALO BÁO GIÁ
                </a>
              </div>
            </aside>

            {/* Right Product Grid (Col 9) */}
            <main className="lg:col-span-9 space-y-6">
              {filteredProducts.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-gray-400 flex items-center justify-center mx-auto">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase">Không tìm thấy mã phụ tùng phù hợp</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Vui lòng thử tìm kiếm theo từ khóa ngắn hơn, hoặc liên hệ trực tiếp Hotline/Zalo 0903.588.167 để tra catalog kho Q.BA.
                  </p>
                  <button 
                    onClick={resetFilters}
                    className="px-6 py-3 rounded-xl bg-brand text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg"
                  >
                    <RefreshCw size={14} /> Xem tất cả phụ tùng
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div 
                      key={`prod-card-${product.id}`}
                      className="rounded-3xl bg-white border border-slate-200/90 hover:border-brand/40 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image Box */}
                        <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                          <Image 
                            src={product.imageSrc}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-brand text-white text-[10px] font-black tracking-widest uppercase shadow-md">
                            {product.qualityStandard}
                          </div>
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase">
                            {product.brand}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 space-y-3">
                          {/* Part Number & Internal Code */}
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                              Part: {product.partNumber}
                            </span>
                            <span className="text-[11px] font-bold text-gray-500 uppercase">
                              {product.internalCode}
                            </span>
                          </div>

                          {/* Product Title */}
                          <h3 className="text-base font-black font-heading text-slate-900 leading-snug group-hover:text-brand transition-colors line-clamp-2">
                            <Link href={`/products/${product.id}`}>
                              {product.name}
                            </Link>
                          </h3>

                          {/* Compatibility Tags */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {product.compatibility.slice(0, 3).map((comp, cIdx) => (
                              <span 
                                key={`comp-badge-${product.id}-${cIdx}`}
                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-6 pt-0 space-y-2">
                        <button 
                          onClick={() => handleOpenQuoteModal(product)}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand to-red-700 hover:from-red-600 hover:to-brand text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                        >
                          <ShoppingCart size={15} />
                          BÁO GIÁ NHANH
                        </button>

                        <Link 
                          href={`/products/${product.id}`}
                          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                        >
                          Xem chi tiết & bảng số →
                        </Link>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </main>

          </div>
        </div>
      </section>

      {/* Global Quotation Modal */}
      <QuotationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={modalProduct}
      />

    </div>
  );
}
