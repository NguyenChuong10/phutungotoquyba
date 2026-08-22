"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Tag,
  Package,
  X,
} from "lucide-react";

import { formatImageUrl } from "@/utils/imageHelper";
import { AdminApiService, CategoryTreeItem } from "@/services/adminApiService";
import { Product, CategoryData } from "@/data/productsData";
import QuotationModal from "@/components/public/QuotationModal";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(searchParams.get("subCategory") || null);
  const [selectedBrand, setSelectedBrand] = useState("Tất cả thương hiệu");

  // Items Per Page Settings
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Track expanded main category accordions in sidebar
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "dong-co-may-phat": true,
    "hop-so-bo-dong-toc": true,
  });

  // Dynamic Categories, Products & Brands List fetched from PostgreSQL DB
  const [categories, setCategories] = useState<CategoryData[]>([{ slug: "all", name: "Tất cả danh mục" }]);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>(["Tất cả thương hiệu"]);

  // Quotation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadRealtimeCategories() {
      try {
        const tree = await AdminApiService.getCategoriesTree();
        if (tree && tree.length > 0) {
          const mapped: CategoryData[] = [
            { slug: "all", name: "Tất cả danh mục" },
            ...tree.map((main: CategoryTreeItem) => ({
              slug: main.slug,
              name: main.name,
              subCategories: (main.children || []).map((sub: CategoryTreeItem) => ({
                slug: sub.slug,
                name: sub.name,
              })),
            })),
          ];
          setCategories(mapped);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }

    async function loadRealtimeProducts() {
      try {
        const res = await AdminApiService.getPublicProducts({ limit: 500 });
        if (res.ok && res.data) {
          const mapped: Product[] = res.data.map((p: any) => ({
            id: String(p.id),
            partNumber: p.partNumber || `PN-${p.id}`,
            name: p.name,
            categorySlug: p.category?.parent?.slug || p.category?.slug || '',
            subCategorySlug: p.category?.slug || '',
            brand: p.brand?.name || '',
            qualityStandard: p.qualityStandard || '',
            price: p.price && Number(p.price) > 0 ? `${Number(p.price).toLocaleString()} ₫` : 'Liên hệ Báo Giá',
            imageSrc: formatImageUrl(p.images?.[0]?.imageUrl || p.image || p.imageSrc),
            image: formatImageUrl(p.images?.[0]?.imageUrl || p.image || p.imageSrc),
            description: p.description || 'Phụ tùng chính hãng xe tải nặng Q.BA',
            specifications: p.specifications || {},
            compatibility: p.compatibility || [],
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    }

    async function loadRealtimeBrands() {
      try {
        const res = await AdminApiService.getBrands();
        if (res.ok && res.data && res.data.length > 0) {
          const brandNames = ["Tất cả thương hiệu", ...res.data.map((b: any) => b.name)];
          setBrands(brandNames);
        }
      } catch (err) {
        console.error("Failed to load brands:", err);
      }
    }

    loadRealtimeCategories();
    loadRealtimeProducts();
    loadRealtimeBrands();
  }, []);

  const toggleCategoryExpand = (slug: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const handleSelectMainCategory = (slug: string) => {
    if (slug === "all") {
      setSelectedCategory("all");
      setSelectedSubCategory(null);
      return;
    }
    setExpandedCategories((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
    setSelectedCategory(slug);
    setSelectedSubCategory(null);
  };

  const handleSelectSubCategory = (mainSlug: string, subSlug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategory(mainSlug);
    setSelectedSubCategory(subSlug);
  };

  const handleSelectBrand = (brand: string) => {
    setSelectedBrand(brand);
  };

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      let matchCat = true;
      if (selectedCategory !== "all") {
        if (selectedSubCategory) {
          matchCat = p.subCategorySlug === selectedSubCategory;
        } else {
          matchCat = p.categorySlug === selectedCategory;
        }
      }

      const matchBrand = selectedBrand === "Tất cả thương hiệu" || p.brand === selectedBrand;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);

      return matchCat && matchBrand && matchSearch;
    });
  }, [searchQuery, selectedCategory, selectedSubCategory, selectedBrand, products]);

  // Reset page to 1 on filter or limit changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedSubCategory, selectedBrand, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const catalogEl = document.getElementById("catalogue-section");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim() === "" && (searchParams.has("search") || searchParams.has("q"))) {
      router.replace("/products");
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSubCategory(null);
    setSelectedBrand("Tất cả thương hiệu");
    setCurrentPage(1);
    if (searchParams.has("search") || searchParams.has("q") || searchParams.has("category") || searchParams.has("subCategory")) {
      router.replace("/products");
    }
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
            Tra cứu theo Mã nhà máy (Part No.), Mã quản lý nội bộ và Chủng loại xe. Cam kết hàng chuẩn loại 1 cao cấp sẵn kho Đà Nẵng.
          </p>
        </div>
      </section>

      {/* 2. Main E-Catalogue Section */}
      <section id="catalogue-section" className="py-12 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Sidebar (Col 3) */}
            <aside className="lg:col-span-3 space-y-6">
              {/* Category Filter Box */}
              <div className="p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-4">
                <h3 className="text-xs font-black font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Filter size={16} className="text-brand" />
                  DANH MỤC PHỤ TÙNG
                </h3>

                <div className="space-y-1.5">
                  {categories.map((cat) => {
                    const isAll = cat.slug === "all";
                    const isMainActive = selectedCategory === cat.slug && !selectedSubCategory;
                    const isExpanded = !!expandedCategories[cat.slug];
                    const hasSub = cat.subCategories && cat.subCategories.length > 0;

                    if (isAll) {
                      return (
                        <button
                          key={`cat-filter-all`}
                          onClick={() => handleSelectMainCategory("all")}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                            selectedCategory === "all"
                              ? "bg-brand text-white shadow-md shadow-brand/30"
                              : "text-slate-700 hover:bg-slate-100 hover:text-brand"
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                        </button>
                      );
                    }

                    return (
                      <div key={`cat-group-${cat.slug}`} className="space-y-1">
                        {/* Main Category Row */}
                        <div
                          onClick={() => handleSelectMainCategory(cat.slug)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                            isMainActive
                              ? "bg-brand text-white shadow-md shadow-brand/30"
                              : selectedCategory === cat.slug
                              ? "bg-red-50 text-brand font-extrabold border border-brand/20"
                              : "text-slate-800 hover:bg-slate-100 hover:text-brand"
                          }`}
                        >
                          <span className="truncate pr-2">{cat.name}</span>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {hasSub && (
                              <button
                                onClick={(e) => toggleCategoryExpand(cat.slug, e)}
                                className="p-1 rounded-md hover:bg-black/10 transition-colors"
                                title="Mở danh mục phụ"
                              >
                                {isExpanded ? (
                                  <ChevronDown size={14} />
                                ) : (
                                  <ChevronRight size={14} />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Sub-Categories Accordion */}
                        {hasSub && isExpanded && (
                          <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-200 ml-3.5 animate-in fade-in duration-200">
                            {cat.subCategories!.map((sub) => {
                              const isSubActive = selectedSubCategory === sub.slug;
                              return (
                                <button
                                  key={`sub-filter-${sub.slug}`}
                                  onClick={(e) => handleSelectSubCategory(cat.slug, sub.slug, e)}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                                    isSubActive
                                      ? "bg-slate-900 text-white font-extrabold shadow-2xs"
                                      : "text-slate-600 hover:bg-slate-100 hover:text-brand"
                                  }`}
                                >
                                  <span className="truncate">{sub.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Brand Filter Dropdown */}
              <div className="p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-3">
                <h3 className="text-xs font-black font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Tag size={16} className="text-brand" />
                  THƯƠNG HIỆU NHÀ MÁY
                </h3>

                <div className="space-y-1">
                  {brands.map((b) => (
                    <button
                      key={`brand-opt-${b}`}
                      onClick={() => handleSelectBrand(b)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        selectedBrand === b
                          ? "bg-slate-900 text-white font-extrabold shadow-2xs"
                          : "text-slate-700 hover:bg-slate-100 hover:text-brand"
                      }`}
                    >
                      <span className="truncate">{b}</span>
                      {selectedBrand === b && <CheckCircle2 size={14} className="text-amber-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Right Product Catalogue Grid (Col 9) */}
            <main className="lg:col-span-9 space-y-6">
              
              {/* Search Bar & Toolbar Header */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-4">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nhập tên sản phẩm, Mã Part No hoặc Thương hiệu (Ví dụ: WP10, 12JS160T, Bosch)..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all bg-slate-50/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-900 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Controls Toolbar: Stats & Items Per Page */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-slate-100">
                  <div className="text-slate-500 font-semibold flex items-center gap-2">
                    <Package size={15} className="text-brand" />
                    <span>Tìm thấy <strong className="text-slate-900 font-black">{filteredProducts.length}</strong> mã phụ tùng</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Clear Filters Button */}
                    {(searchQuery || selectedCategory !== "all" || selectedBrand !== "Tất cả thương hiệu") && (
                      <button
                        onClick={resetFilters}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw size={13} />
                        <span>Xóa Lọc</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Display Area */}
              {filteredProducts.length === 0 ? (
                <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-xs">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-gray-400 flex items-center justify-center mx-auto">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                    Không tìm thấy phụ tùng phù hợp
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục phụ tùng khác.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-2.5 rounded-xl bg-brand text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-brand-hover transition-colors cursor-pointer"
                  >
                    Xem Tất Cả Sản Phẩm
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  
                  {/* ULTRA-PREMIUM PRODUCT GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProducts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.id}`}
                        className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-brand/40 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
                      >
                        {/* Image Frame with object-cover - NO BLANK WHITE BARS */}
                        <div className="relative h-52 sm:h-56 w-full bg-slate-100 overflow-hidden">
                          <Image
                            src={formatImageUrl(p.imageSrc || (p as any).image)}
                            alt={p.name}
                            fill
                            loading="lazy"
                            unoptimized
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Part Number Dark Badge */}
                          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-amber-400 font-mono font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-md shadow-md border border-slate-800 z-10">
                            {p.partNumber}
                          </div>

                          {/* Brand Red Badge */}
                          {p.brand && (
                            <div className="absolute top-3 right-3 bg-brand text-white font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-md shadow-md z-10">
                              {p.brand}
                            </div>
                          )}
                        </div>

                        {/* Card Content Body */}
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white">
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                              {p.name}
                            </h3>
                          </div>

                          {/* Card Footer Bar */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Kiểm tra kho Đà Nẵng
                            </span>
                            <span className="text-xs font-black text-brand group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                              Xem Chi Tiết <ChevronRight size={14} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination Control Bar */}
                  {totalPages > 1 && (
                    <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-xs font-semibold text-slate-500">
                        Hiển thị <span className="font-extrabold text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="font-extrabold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> trên tổng số <span className="font-black text-brand">{filteredProducts.length}</span> sản phẩm
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Prev Page Button */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={16} />
                          <span className="hidden sm:inline">Trang trước</span>
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            if (totalPages <= 7) return true;
                            return (
                              page === 1 ||
                              page === totalPages ||
                              Math.abs(page - currentPage) <= 1
                            );
                          })
                          .map((page, idx, arr) => {
                            const prevPage = arr[idx - 1];
                            const showEllipsis = prevPage && page - prevPage > 1;

                            return (
                              <React.Fragment key={`page-${page}`}>
                                {showEllipsis && (
                                  <span className="px-2 text-slate-400 font-bold text-xs">...</span>
                                )}
                                <button
                                  onClick={() => handlePageChange(page)}
                                  className={`w-9 h-9 rounded-xl font-black text-xs transition-all cursor-pointer ${
                                    currentPage === page
                                      ? "bg-brand text-white shadow-md shadow-brand/30"
                                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                                  }`}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            );
                          })}

                        {/* Next Page Button */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <span className="hidden sm:inline">Trang sau</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </main>

          </div>
        </div>
      </section>

      {/* Dynamic Quotation Modal */}
      {isModalOpen && (
        <QuotationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={modalProduct}
        />
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-slate-600 font-bold">Đang tải E-Catalogue...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
