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
import { getProductUrl } from "@/utils/productHelper";
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

  // Items Per Page Settings (40 products per page - 4 cols x 10 rows)
  const [itemsPerPage, setItemsPerPage] = useState<number>(40);
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
        const res = await AdminApiService.getPublicProducts({ limit: 5000 });
        if (res.ok && res.data) {
          const mapped: Product[] = res.data.map((p: any) => ({
            id: String(p.id),
            partNumber: p.partNumber || '',
            internalCode: p.internalCode || '',
            internalName: p.internalName || '',
            name: p.name,
            categorySlug: p.category?.parent?.slug || p.category?.slug || '',
            subCategorySlug: p.category?.slug || '',
            brand: (!p.brand?.name || p.brand?.name === 'Chưa Phân Loại' || p.brand?.name === 'Chưa phân loại' || p.brand?.name === 'Không có thương hiệu' || p.brand?.name === 'Không') ? '' : p.brand.name,
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
          const mappedNames = res.data.map((b: any) => (b.name === "Chưa Phân Loại" || b.name === "Chưa phân loại" ? "Không" : b.name));
          const brandNames = Array.from(new Set(["Tất cả thương hiệu", "Không", ...mappedNames]));
          setBrands(brandNames);
        } else {
          setBrands(["Tất cả thương hiệu", "Không"]);
        }
      } catch (err) {
        console.error("Failed to load brands:", err);
      }
    }

    loadRealtimeCategories();
    loadRealtimeProducts();
    loadRealtimeBrands();
  }, []);

  // Sync category & subcategory state when navigating via URL searchParams (e.g. from breadcrumbs)
  useEffect(() => {
    const cat = searchParams.get("category") || searchParams.get("categorySlug") || "all";
    const subCat = searchParams.get("subCategory") || searchParams.get("subCategorySlug") || null;
    const search = searchParams.get("search") || searchParams.get("q") || "";

    setSelectedCategory(cat);
    setSelectedSubCategory(subCat);
    if (search) setSearchQuery(search);

    if (cat && cat !== "all") {
      setExpandedCategories((prev) => ({ ...prev, [cat]: true }));
    }
  }, [searchParams]);

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

      const matchBrand =
        selectedBrand === "Tất cả thương hiệu"
          ? true
          : selectedBrand === "Không"
          ? (!p.brand || p.brand === "" || p.brand === "Không" || p.brand === "Chưa Phân Loại" || p.brand === "Không có thương hiệu")
          : p.brand === selectedBrand;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q) ||
        (p.internalCode && p.internalCode.toLowerCase().includes(q)) ||
        (p.internalName && p.internalName.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q));

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
      {/* 1. Header Banner - Compact & Perfectly Spaced below Navbar */}
      <section className="bg-[#111317] text-white pt-28 sm:pt-32 md:pt-36 pb-8 md:pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 max-w-[1536px] relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-[11px] font-black tracking-widest uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
            E-Catalogue Phụ Tùng Xe Tải Nặng Q.BA
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading uppercase tracking-wide leading-tight mb-2 sm:mb-3">
            TRA CỨU & BÁO GIÁ <span className="text-brand">PHỤ TÙNG CHÍNH HÃNG</span>
          </h1>

          <p className="text-gray-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Tra cứu theo tên sản phẩm, thương hiệu xe và chủng loại. Cam kết hàng chuẩn loại 1 cao cấp sẵn kho Đà Nẵng.
          </p>
        </div>
      </section>

      {/* 2. Main E-Catalogue Section */}
      <section id="catalogue-section" className="py-6 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 max-w-[1536px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">

            {/* Sleek Compact Left Sidebar Column (~270px wide) */}
            <aside className="lg:col-span-3 xl:col-span-2 space-y-4">
              {/* Category Filter Box */}
              <div className="p-3.5 md:p-4 rounded-md bg-white border border-slate-200/90 shadow-sm space-y-2.5">
                <h3 className="text-xs font-black font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Filter size={15} className="text-brand" />
                  DANH MỤC PHỤ TÙNG
                </h3>

                <div className="space-y-1">
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
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${selectedCategory === "all"
                            ? "bg-brand text-white shadow-sm"
                            : "text-slate-700 hover:bg-slate-100 hover:text-brand"
                            }`}
                        >
                          <span className="font-bold text-xs leading-snug">{cat.name}</span>
                        </button>
                      );
                    }

                    return (
                      <div key={`cat-group-${cat.slug}`} className="space-y-1">
                        {/* Main Category Row */}
                        <div
                          onClick={() => handleSelectMainCategory(cat.slug)}
                          className={`w-full text-left px-2.5 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${isMainActive
                            ? "bg-brand text-white shadow-sm"
                            : selectedCategory === cat.slug
                              ? "bg-red-50 text-brand font-extrabold border border-brand/20"
                              : "text-slate-800 hover:bg-slate-100 hover:text-brand"
                            }`}
                        >
                          <span className="font-bold text-xs leading-snug pr-1.5">{cat.name}</span>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {hasSub && (
                              <button
                                onClick={(e) => toggleCategoryExpand(cat.slug, e)}
                                className="p-0.5 rounded hover:bg-black/10 transition-colors"
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
                          <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-slate-200 ml-2.5 animate-in fade-in duration-200">
                            {cat.subCategories!.map((sub) => {
                              const isSubActive = selectedSubCategory === sub.slug;
                              return (
                                <button
                                  key={`sub-filter-${sub.slug}`}
                                  onClick={(e) => handleSelectSubCategory(cat.slug, sub.slug, e)}
                                  className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-semibold transition-all flex items-center justify-between cursor-pointer ${isSubActive
                                    ? "bg-slate-900 text-white font-extrabold shadow-2xs"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-brand"
                                    }`}
                                >
                                  <span className="font-semibold text-[11px] leading-snug">{sub.name}</span>
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
              <div className="p-3.5 md:p-4 rounded-md bg-white border border-slate-200/90 shadow-sm space-y-2">
                <h3 className="text-xs font-black font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Tag size={15} className="text-brand" />
                  THƯƠNG HIỆU
                </h3>

                <div className="space-y-1">
                  {brands.map((b) => (
                    <button
                      key={`brand-opt-${b}`}
                      onClick={() => handleSelectBrand(b)}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${selectedBrand === b
                        ? "bg-slate-900 text-white font-extrabold shadow-2xs"
                        : "text-slate-700 hover:bg-slate-100 hover:text-brand"
                        }`}
                    >
                      <span className="font-bold text-xs leading-snug">{b}</span>
                      {selectedBrand === b && <CheckCircle2 size={13} className="text-amber-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main 4-Column Product Catalogue Area (Col-10 / ~1350px wide) */}
            <main className="lg:col-span-9 xl:col-span-10 space-y-5">

              {/* Search Bar & Toolbar Header */}
              <div className="p-4 rounded-md bg-white border border-slate-200/90 shadow-sm space-y-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nhập tên sản phẩm hoặc Mã Part No (Ví dụ: Động cơ WP10, Hộp số Fast, 6126000)..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all bg-slate-50/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-900 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Controls Toolbar: Stats & Grid Column Density Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-100">
                  <div className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <Package size={14} className="text-brand" />
                    <span>Tìm thấy <strong className="text-slate-900 font-black">{filteredProducts.length}</strong> mã phụ tùng</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Items Per Page Density Selector */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/80">
                      <span className="hidden sm:inline text-[11px] text-slate-400 font-semibold">Hiển thị:</span>
                      <div className="flex items-center gap-1">
                        {[20, 40, 80, 160].map((num) => (
                          <button
                            key={`item-count-${num}`}
                            onClick={() => {
                              setItemsPerPage(num);
                              setCurrentPage(1);
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-extrabold transition-all cursor-pointer ${itemsPerPage === num
                              ? "bg-brand text-white shadow-xs font-black"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                              }`}
                            title={`Hiển thị ${num} sản phẩm trên 1 trang`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(searchQuery || selectedCategory !== "all" || selectedBrand !== "Tất cả thương hiệu") && (
                      <button
                        onClick={resetFilters}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw size={12} />
                        <span>Xóa Lọc</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Display Area */}
              {filteredProducts.length === 0 ? (
                <div className="p-12 rounded-md bg-white border border-slate-200 text-center space-y-3 shadow-xs">
                  <div className="w-14 h-14 rounded-full bg-slate-100 text-gray-400 flex items-center justify-center mx-auto">
                    <Search size={28} />
                  </div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                    Không tìm thấy phụ tùng phù hợp
                  </h3>
                  <p className="text-gray-500 text-xs max-w-md mx-auto">
                    Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục phụ tùng khác.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-5 py-2 rounded-md bg-brand text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-brand-hover transition-colors cursor-pointer"
                  >
                    Xem Tất Cả Sản Phẩm
                  </button>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* INDUSTRIAL PRODUCT GRID (FIXED 4 COLS LAYOUT) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {paginatedProducts.map((p) => (
                      <Link
                        key={p.id}
                        href={getProductUrl(p)}
                        className="group bg-white rounded-md border border-slate-200 hover:border-brand hover:ring-1 hover:ring-brand/40 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer"
                      >
                        {/* Image Frame - CLEAR & SPACIOUS (ASPECT 4:3) */}
                        <div className="relative aspect-[4/3] w-full bg-white overflow-hidden flex items-center justify-center border-b border-slate-100">
                          <Image
                            src={formatImageUrl(p.imageSrc || (p as any).image)}
                            alt={`${p.name} - Phụ tùng xe tải Q.BA Đà Nẵng`}
                            fill
                            loading="lazy"
                            unoptimized
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-contain"
                          />

                          {/* Brand Badge */}
                          {p.brand && p.brand.trim() !== '' && p.brand !== 'Chưa Phân Loại' && p.brand !== 'Chưa phân loại' && p.brand !== 'Không có thương hiệu' && p.brand !== 'Không' && (
                            <div className="absolute top-2 right-2 font-extrabold text-[9px] uppercase px-2 py-0.5 rounded shadow-sm z-10 bg-slate-900/90 text-white">
                              {p.brand}
                            </div>
                          )}
                        </div>

                        {/* Card Content Body */}
                        <div className="p-3 sm:p-3.5 space-y-1.5 flex-1 flex flex-col justify-between bg-white">
                          <div className="space-y-1">
                            {/* Tên SP */}
                            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                              {p.name}
                            </h3>

                            {/* Mã nội bộ SKU Kho (Dòng 1) */}
                            {p.internalCode && (
                              <div className="text-[11px] font-mono font-bold text-slate-500 leading-none">
                                {p.internalCode}
                              </div>
                            )}

                            {/* Mã phụ tùng PartNo (Dòng 2) */}
                            {p.partNumber && (
                              <div className="text-[11px] sm:text-xs font-mono font-extrabold text-red-600 leading-none">
                                {p.partNumber}
                              </div>
                            )}

                            {/* Đơn giá */}
                            <div className="pt-0.5">
                              <span className="text-xs sm:text-sm font-black text-brand">
                                {p.price || "Liên hệ Báo Giá"}
                              </span>
                            </div>
                          </div>

                          {/* Footer Xem Chi Tiết */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Kiểm tra kho Đà Nẵng
                            </span>
                            <span className="text-[11px] sm:text-xs font-black text-brand group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                              Chi Tiết <ChevronRight size={13} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination Control Bar */}
                  {totalPages > 1 && (
                    <div className="pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-slate-500">
                        Hiển thị <span className="font-extrabold text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="font-extrabold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> trên tổng số <span className="font-black text-brand">{filteredProducts.length}</span> sản phẩm
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Prev Page Button */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={15} />
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
                                  className={`w-8 h-8 rounded-md font-black text-xs transition-all cursor-pointer ${currentPage === page
                                    ? "bg-brand text-white shadow-sm"
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
                          className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <span className="hidden sm:inline">Trang sau</span>
                          <ChevronRight size={15} />
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
