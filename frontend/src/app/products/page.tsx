"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Tag,
  CornerDownRight,
  Package,
  X,
  Layers,
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
        const res = await AdminApiService.getPublicProducts({ limit: 100 });
        if (res.ok && res.data) {
          const mapped: Product[] = res.data.map((p: any) => ({
            id: String(p.id),
            partNumber: p.partNumber || `PN-${p.id}`,
            name: p.name,
            categorySlug: p.category?.parent?.slug || p.category?.slug || '',
            subCategorySlug: p.category?.slug || '',
            brand: p.brand?.name || '',
            qualityStandard: p.qualityStandard || 'Loại 1',
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

  const handleOpenQuoteModal = (product?: Product) => {
    setModalProduct(product || null);
    setIsModalOpen(true);
  };

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
    // Toggle accordion expansion state
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
                                  <span className="flex items-center gap-1.5 truncate">
                                    <CornerDownRight size={12} className={isSubActive ? "text-brand" : "text-slate-400"} />
                                    <span className="truncate">{sub.name}</span>
                                  </span>
                                  {isSubActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                                  )}
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

              {/* Brand Filter Box */}
              <div className="p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-4">
                <h3 className="text-xs font-black font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Tag size={16} className="text-brand" />
                  THƯƠNG HIỆU SẢN XUẤT
                </h3>

                <div className="space-y-1">
                  {brands.map((brand, bIdx) => {
                    const isActive = selectedBrand === brand;
                    return (
                      <button
                        key={`brand-filter-${bIdx}`}
                        onClick={() => handleSelectBrand(brand)}
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isActive
                            ? "bg-slate-900 text-white shadow-md"
                            : "text-slate-700 hover:bg-slate-100 hover:text-brand"
                        }`}
                      >
                        <span>{brand}</span>
                        {isActive && <CheckCircle2 size={15} className="text-brand" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Right Main Section (Col 9): Search Bar & Product Grid */}
            <main className="lg:col-span-9 space-y-6">
              
              {/* Top Search Input Bar (Horizontally aligned with Left Sidebar) */}
              <div className="p-4 md:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-3/4">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nhập Mã Phụ Tùng (vd: VG1560080012, JS160T...) hoặc Tên phụ tùng..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand transition-colors p-1 rounded-full hover:bg-slate-200 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Tìm thấy: <strong className="text-brand text-sm font-black">{filteredProducts.length}</strong>
                  </span>
                  {(searchQuery || selectedCategory !== "all" || selectedBrand !== "Tất cả thương hiệu") && (
                    <button
                      onClick={resetFilters}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={14} />
                      Xóa Lọc
                    </button>
                  )}
                </div>
              </div>

              {/* Product Grid Area */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-brand/40 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                    >
                      {/* Product Card Image Container */}
                      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden p-2">
                        <Image
                          src={formatImageUrl(p.imageSrc || (p as any).image)}
                          alt={p.name}
                          fill
                          loading="lazy"
                          unoptimized
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Part Number Badge Overlay */}
                        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black font-mono px-2.5 py-1 rounded-lg border border-slate-700 shadow-sm">
                          {p.partNumber}
                        </div>

                        {/* Brand Badge Overlay */}
                        {p.brand && (
                          <div className="absolute bottom-3 left-3 bg-brand/90 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm">
                            {p.brand}
                          </div>
                        )}
                      </div>

                      {/* Product Card Body Content */}
                      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                            {p.name}
                          </h3>
                          <p className="text-xs font-black text-brand mt-2">
                            {p.price}
                          </p>
                        </div>

                        {/* Actions Bar */}
                        <div className="pt-2">
                          <Link
                            href={`/products/${p.id}`}
                            className="w-full block text-center py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-brand text-white text-xs font-extrabold transition-all shadow-sm cursor-pointer"
                          >
                            Xem Chi Tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
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
