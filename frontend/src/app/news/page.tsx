"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  Clock, 
  Calendar, 
  BookOpen, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  Plus, 
  TrendingUp, 
  Flame, 
  Tag, 
  X,
  ChevronRight,
  User,
  MessageSquare,
  Filter
} from "lucide-react";
import { AdminApiService } from "@/services/adminApiService";

interface ArticleUIItem {
  id: number | string;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  summary: string;
  content: string;
  imageSrc: string;
  publishedAt: string;
  readTime: string;
  isFeatured: boolean;
  author: string;
  tags: string[];
}

const CATEGORY_LABEL_MAP: Record<string, string> = {
  'cam-nang-ky-thuat': 'Cẩm Nang Kỹ Thuật',
  'bao-duong-xe-tai': 'Bảo Dưỡng Xe Tải',
  'tra-ma-vin': 'Mẹo Tra Mã VIN',
  'tin-tuc-quy-ba': 'Tin Tức Q.BA',
};

const CATEGORIES_PILLS = [
  { label: "CẨM NANG KỸ THUẬT", slug: "cam-nang-ky-thuat" },
  { label: "BẢO DƯỠNG XE TẢI", slug: "bao-duong-xe-tai" },
  { label: "MẸO TRA MÃ VIN", slug: "tra-ma-vin" },
  { label: "TIN TỨC Q.BA", slug: "tin-tuc-quy-ba" },
];

const HOT_TAGS = [
  "Phụ Tùng HOWO",
  "Động Cơ Weichai",
  "Hộp Số Fast Gear",
  "Bảo Dưỡng Gầm",
  "Mã Part No.",
  "Búp Sen Phanh",
  "Tra Mã VIN",
];

export default function NewsIndexPage() {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [articlesList, setArticlesList] = useState<ArticleUIItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      try {
        const res = await AdminApiService.getNewsList();
        if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: ArticleUIItem[] = res.data.map((art: any) => ({
            id: art.id,
            title: art.title,
            slug: art.slug,
            categorySlug: art.categorySlug || 'cam-nang-ky-thuat',
            category: CATEGORY_LABEL_MAP[art.categorySlug] || art.categorySlug || 'Cẩm Nang Kỹ Thuật',
            summary: art.content ? art.content.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...' : 'Cẩm nang hướng dẫn kỹ thuật phụ tùng xe tải Q.BA Đà Nẵng.',
            content: art.content || '',
            imageSrc: (art.thumbnailUrl && art.thumbnailUrl !== '/images/news-section/news-1.png') ? art.thumbnailUrl : '/images/logo/logonen.png',
            publishedAt: art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('vi-VN') : '15 THÁNG 8',
            readTime: '5 PHÚT ĐỌC',
            isFeatured: !!art.isFeatured,
            author: art.author?.fullName || 'KỸ THUẬT Q.BA',
            tags: ['Phụ Tùng Q.BA', 'Xe Tải Nặng', 'Kỹ Thuật'],
          }));
          setArticlesList(mapped);
        } else {
          setArticlesList([]);
        }
      } catch (err) {
        console.error('Failed to load news from API:', err);
        setArticlesList([]);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  const featuredArticle = useMemo(() => {
    return articlesList.find((a) => a.isFeatured) || articlesList[0];
  }, [articlesList]);

  const compactStackArticles = useMemo(() => {
    return articlesList.filter((a) => a.id !== featuredArticle?.id).slice(0, 3);
  }, [articlesList, featuredArticle]);

  const mostPopularArticles = useMemo(() => {
    return articlesList.slice(0, 5);
  }, [articlesList]);

  const filteredArticles = useMemo(() => {
    return articlesList.filter((art) => {
      const matchCat = !selectedCategorySlug || art.categorySlug === selectedCategorySlug;
      const matchTag = !selectedTag || art.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase())) || art.title.toLowerCase().includes(selectedTag.toLowerCase());
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        (art.tags && art.tags.some((t) => t.toLowerCase().includes(q)));

      return matchCat && matchTag && matchSearch;
    });
  }, [articlesList, selectedCategorySlug, selectedTag, searchQuery]);

  const resetFilters = () => {
    setSelectedCategorySlug(null);
    setSelectedTag(null);
    setSearchQuery("");
  };

  // Structured Data (JSON-LD ItemList) for Search Engine Crawlers
  const newsListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": articlesList.slice(0, 10).map((art, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://phutungotoquyba.com/news/${art.slug}`,
      "name": art.title,
    })),
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">
      {/* 0. SEO JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsListSchema) }}
      />

      {/* 1. Bright & Premium Header Banner & Controls */}
      <section className="bg-[#111317] text-white pt-32 md:pt-36 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D90429]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D90429]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <span className="text-[#D90429] font-black uppercase">Tin tức & Cẩm nang</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading uppercase tracking-wide leading-tight text-white">
                TIN TỨC & <span className="text-[#D90429]">CẨM NANG KỸ THUẬT</span>
              </h1>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Hướng dẫn sửa chữa, bảo dưỡng động cơ Weichai, hộp số Fast Gear, gầm xe HOWO và mẹo tra mã phụ tùng Part No. chính xác từ chuyên gia Q.BA Đà Nẵng.
              </p>
            </div>

            {/* Clean Integrated Search Box */}
            <div className="w-full md:w-80 shrink-0">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm bài viết, từ khóa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-[#D90429] focus:ring-2 focus:ring-[#D90429]/20 transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Related Category Pills Bar */}
          <div className="flex items-center gap-2.5 overflow-x-auto pt-2 pb-1 scrollbar-none">
            <span className="text-xs font-black uppercase text-slate-400 font-mono tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter size={13} className="text-[#D90429]" /> DANH MỤC /
            </span>

            <button
              onClick={() => setSelectedCategorySlug(null)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                selectedCategorySlug === null
                  ? "bg-[#D90429] text-white shadow-lg shadow-[#D90429]/30 scale-105"
                  : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60"
              }`}
            >
              TẤT CẢ BÀI VIẾT
            </button>

            {CATEGORIES_PILLS.map((item, idx) => {
              const isSelected = selectedCategorySlug === item.slug;
              return (
                <button
                  key={`pill-cat-${idx}`}
                  onClick={() => setSelectedCategorySlug(isSelected ? null : item.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? "bg-[#D90429] border-[#D90429] text-white shadow-lg shadow-[#D90429]/30 scale-105"
                      : "bg-[#16191F] border-slate-700/80 text-slate-300 hover:bg-[#D90429] hover:text-white hover:border-[#D90429]"
                  }`}
                >
                  <Plus size={13} className="stroke-[3]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Dual-Split Verge Editorial Hero Showcase (Bright & Elegant Canvas) */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-7xl space-y-12">
          {loading ? (
            <div className="p-20 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-3 shadow-xs">
              <Loader2 size={40} className="animate-spin text-[#D90429] mx-auto" />
              <p className="text-xs font-bold text-slate-600">Đang tải tin tức kỹ thuật từ CSDL Q.BA...</p>
            </div>
          ) : (
            <>
              {/* Dual-Split Verge Hero Showcase Grid */}
              {featuredArticle && !searchQuery && !selectedCategorySlug && !selectedTag && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-slate-200 pb-12">
                  
                  {/* Left Column (7 cols): Main Featured Cover Banner */}
                  <div className="lg:col-span-7 space-y-4 group">
                    <Link href={`/news/${featuredArticle.slug}`} className="block">
                      <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-3xl bg-slate-100 overflow-hidden shadow-lg border border-slate-200">
                        <Image 
                          src={featuredArticle.imageSrc}
                          alt={featuredArticle.title}
                          fill
                          priority
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-xl bg-[#D90429] text-white text-xs font-black uppercase tracking-wider shadow-md">
                          {featuredArticle.category}
                        </div>
                      </div>
                    </Link>

                    {/* Crisp & Bright Title Highlight Block */}
                    <div className="space-y-3">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading uppercase text-slate-900 leading-tight group-hover:text-[#D90429] transition-colors">
                        <Link href={`/news/${featuredArticle.slug}`}>
                          {featuredArticle.title}
                        </Link>
                      </h2>

                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3 font-sans pt-1 font-medium">
                        {featuredArticle.summary}
                      </p>

                      <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-500 pt-1">
                        <span className="text-[#D90429] font-black uppercase">{featuredArticle.author}</span>
                        <span>•</span>
                        <span>{featuredArticle.publishedAt}</span>
                        <span>•</span>
                        <span>{featuredArticle.readTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (5 cols): Compact Spotlight Article Stack */}
                  <div className="lg:col-span-5 space-y-6 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-8">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-black uppercase tracking-widest text-[#D90429] font-mono flex items-center gap-1.5">
                        <Flame size={14} /> BÀI VIẾT TIÊU ĐIỂM KHÁC
                      </span>
                    </div>

                    <div className="space-y-6 divide-y divide-slate-100">
                      {compactStackArticles.map((art) => (
                        <div key={`stack-${art.id}`} className="pt-6 first:pt-0 flex items-start justify-between gap-4 group">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <h3 className="font-extrabold text-sm sm:text-base font-heading text-slate-900 uppercase leading-snug group-hover:text-[#D90429] transition-colors line-clamp-3">
                              <Link href={`/news/${art.slug}`}>
                                {art.title}
                              </Link>
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                              <span className="text-[#D90429] font-extrabold uppercase">{art.author}</span>
                              <span>•</span>
                              <span>{art.publishedAt}</span>
                            </div>
                          </div>

                          <Link href={`/news/${art.slug}`} className="shrink-0">
                            <div className="relative w-24 h-20 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/90 shadow-xs">
                              <Image 
                                src={art.imageSrc}
                                alt={art.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Active Filter Indicator Bar */}
              {(selectedCategorySlug || selectedTag || searchQuery) && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span>Kết quả lọc bài viết:</span>
                    {selectedCategorySlug && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#D90429]/10 text-[#D90429] font-extrabold uppercase">
                        {CATEGORY_LABEL_MAP[selectedCategorySlug] || selectedCategorySlug}
                      </span>
                    )}
                    {selectedTag && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-200 text-slate-900 font-extrabold">
                        #{selectedTag}
                      </span>
                    )}
                    {searchQuery && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-200 text-slate-900 font-bold">
                        Từ khóa: &quot;{searchQuery}&quot;
                      </span>
                    )}
                    <span className="text-slate-500 font-mono">({filteredArticles.length} bài viết)</span>
                  </div>

                  <button
                    onClick={resetFilters}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <X size={14} /> Xóa Lọc
                  </button>
                </div>
              )}

              {/* 3. Verge Layout Section: High-Legibility Feed Stream + MOST POPULAR Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                
                {/* Left Feed Stream Column (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="flex items-center justify-between border-b-2 border-[#D90429] pb-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#D90429] font-mono flex items-center gap-2">
                      <Sparkles size={15} />
                      CẨM NANG & HƯỚNG DẪN KỸ THUẬT MỚI NHẤT
                    </h3>
                  </div>

                  {filteredArticles.length === 0 ? (
                    <div className="p-16 rounded-3xl bg-slate-50 border border-slate-200/90 text-center space-y-4 shadow-xs">
                      <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Search size={32} />
                      </div>
                      <h4 className="font-black uppercase text-slate-900 text-base">Không tìm thấy bài viết phù hợp</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục cẩm nang khác.</p>
                      <button
                        onClick={resetFilters}
                        className="px-6 py-2.5 rounded-xl bg-[#D90429] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        Xem Tất Cả Bài Viết
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8 divide-y divide-slate-100">
                      {filteredArticles.map((article) => (
                        <article key={`feed-${article.id}`} className="pt-8 first:pt-0 flex flex-col sm:flex-row items-start justify-between gap-6 group">
                          <div className="space-y-2.5 flex-1">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-slate-100 text-[#D90429] font-mono">
                              {article.category}
                            </span>
                            
                            <h3 className="text-lg sm:text-xl font-black font-heading text-slate-900 uppercase leading-snug group-hover:text-[#D90429] transition-colors">
                              <Link href={`/news/${article.slug}`}>
                                {article.title}
                              </Link>
                            </h3>

                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-sans font-medium">
                              {article.summary}
                            </p>

                            <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-500">
                              <span className="text-[#D90429] font-black uppercase">{article.author}</span>
                              <span>•</span>
                              <span>{article.publishedAt}</span>
                              <span>•</span>
                              <span>{article.readTime}</span>
                            </div>
                          </div>

                          <Link href={`/news/${article.slug}`} className="w-full sm:w-auto shrink-0">
                            <div className="relative w-full sm:w-48 h-32 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
                              <Image 
                                src={article.imageSrc}
                                alt={article.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                          </Link>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column (4 cols): Numbered MOST POPULAR Sidebar */}
                <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-28 lg:self-start">
                  
                  {/* Numbered MOST POPULAR Widget */}
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-6 shadow-sm relative overflow-hidden">
                    {/* Submerged Slanted Background Watermark Text (Centered & Fit Form) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl sm:text-6xl font-black font-heading text-slate-300/35 select-none pointer-events-none uppercase tracking-widest leading-none z-0 -rotate-12 italic text-center whitespace-nowrap">
                      POPULAR
                    </div>

                    <div className="border-b border-slate-200 pb-3 relative z-10">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#D90429] font-mono flex items-center gap-2">
                        <TrendingUp size={16} /> MOST POPULAR
                      </h4>
                    </div>

                    <div className="space-y-6 relative z-10">
                      {mostPopularArticles.map((pop, idx) => (
                        <div key={`pop-${pop.id}`} className="flex items-start gap-4 border-b border-slate-200/80 pb-4 last:border-0 last:pb-0 group">
                          <span className="text-2xl font-black font-heading text-[#D90429] shrink-0 w-6">
                            0{idx + 1}
                          </span>
                          <div className="space-y-1">
                            <h5 className="font-extrabold text-xs text-slate-900 uppercase leading-snug group-hover:text-[#D90429] transition-colors">
                              <Link href={`/news/${pop.slug}`}>
                                {pop.title}
                              </Link>
                            </h5>
                            <span className="text-[10px] font-mono text-slate-400 block">{pop.publishedAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hot Topics Tag Cloud Widget */}
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4 shadow-xs">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 font-mono flex items-center gap-2 border-b border-slate-200 pb-3">
                      <Tag size={16} className="text-[#D90429]" /> CHỦ ĐỀ HOT
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {HOT_TAGS.map((tag, idx) => {
                        const isSelected = selectedTag === tag;
                        return (
                          <button
                            key={`tag-cloud-${idx}`}
                            onClick={() => setSelectedTag(isSelected ? null : tag)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              isSelected
                                ? "bg-[#D90429] text-white border-[#D90429] shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:border-[#D90429] hover:text-[#D90429]"
                            }`}
                          >
                            #{tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Direct Zalo Technical Support Banner */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#D90429] to-[#99021C] text-white shadow-xl space-y-4">
                    <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider inline-block">
                      TƯ VẤN TRỰC TIẾP Q.BA
                    </span>
                    <h4 className="font-black text-xl uppercase font-heading text-white">
                      KẾT NỐI KỸ THUẬT Q.BA
                    </h4>
                    <p className="text-xs text-red-100 leading-relaxed">
                      Gửi số khung (VIN) hoặc hình ảnh phụ tùng cần tư vấn qua Zalo để nhận báo giá trong 5 phút.
                    </p>
                    <a 
                      href="https://zalo.me/0903588167" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-3.5 bg-white text-[#D90429] font-black rounded-2xl text-xs uppercase tracking-wider block text-center shadow-lg hover:bg-slate-100 transition-colors"
                    >
                      CHAT ZALO (0903.588.167)
                    </a>
                  </div>

                </aside>

              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
