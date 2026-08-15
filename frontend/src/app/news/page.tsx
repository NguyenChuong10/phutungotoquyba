"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Clock, Calendar, BookOpen, ArrowRight, MessageSquare, Loader2, Sparkles, Plus, TrendingUp, Flame } from "lucide-react";
import { newsData } from "@/data/newsData";
import { AdminApiService } from "@/services/adminApiService";

interface ArticleUIItem {
  id: number | string;
  title: string;
  slug: string;
  category: string;
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
  { label: "CẨM NANG KỸ THUẬT", cat: "Cẩm Nang Kỹ Thuật" },
  { label: "BẢO DƯỠNG XE TẢI", cat: "Bảo Dưỡng Xe Tải" },
  { label: "MẸO TRA MÃ VIN", cat: "Mẹo Tra Mã VIN" },
  { label: "TIN TỨC Q.BA", cat: "Tin Tức Q.BA" },
];

export default function NewsIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
            category: CATEGORY_LABEL_MAP[art.categorySlug] || art.categorySlug || 'Cẩm Nang Kỹ Thuật',
            summary: art.content ? art.content.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...' : 'Cẩm nang hướng dẫn kỹ thuật phụ tùng xe tải Q.BA Đà Nẵng.',
            content: art.content || '',
            imageSrc: art.thumbnailUrl || '/images/news-section/news-1.png',
            publishedAt: art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('vi-VN') : '15 THÁNG 8',
            readTime: '5 PHÚT ĐỌC',
            isFeatured: !!art.isFeatured,
            author: art.author?.fullName || 'KỸ THUẬT Q.BA',
            tags: ['Phụ Tùng Q.BA', 'Kỹ Thuật Xe Tải', 'Bảo Dưỡng'],
          }));
          setArticlesList(mapped);
        } else {
          // Fallback to initial mock news if DB is empty
          const fallbackMapped: ArticleUIItem[] = newsData.map((art) => ({
            ...art,
            isFeatured: !!art.isFeatured,
            author: 'KỸ THUẬT Q.BA',
          }));
          setArticlesList(fallbackMapped);
        }
      } catch (err) {
        console.error('Failed to load news from API:', err);
        const fallbackMapped: ArticleUIItem[] = newsData.map((art) => ({
          ...art,
          isFeatured: !!art.isFeatured,
          author: 'KỸ THUẬT Q.BA',
        }));
        setArticlesList(fallbackMapped);
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
      const matchCat = !selectedCategory || art.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        (art.tags && art.tags.some((t) => t.toLowerCase().includes(q)));

      return matchCat && matchSearch;
    });
  }, [articlesList, selectedCategory, searchQuery]);

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans">
      {/* 1. Header Banner & Related Category Tag Pills Bar (⊕) */}
      <section className="bg-[#111317] text-white pt-32 md:pt-36 pb-10 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl space-y-6">
          <p className="text-slate-300 text-sm md:text-base max-w-4xl leading-relaxed font-sans">
            Bạn đang tìm mua phụ tùng xe tải HOWO, động cơ Weichai, hộp số Fast Gear chính hãng? Hoặc cần tra cứu sơ đồ nhà máy & mẹo bảo dưỡng từ chuyên gia 25 năm kinh nghiệm. Cổng thông tin kỹ thuật Q.BA là nơi cung cấp đầy đủ thông tin chi tiết dành cho bạn.
          </p>

          {/* Related Category Pills Bar with ⊕ icons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="text-xs font-black uppercase text-slate-400 font-mono tracking-wider mr-2">
              RELATED /
            </span>

            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                selectedCategory === null
                  ? "bg-[#D90429] text-white shadow-lg"
                  : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              TẤT CẢ BÀI VIẾT
            </button>

            {CATEGORIES_PILLS.map((item, idx) => {
              const isSelected = selectedCategory === item.cat;
              return (
                <button
                  key={`pill-cat-${idx}`}
                  onClick={() => setSelectedCategory(isSelected ? null : item.cat)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-[#D90429] border-[#D90429] text-white shadow-lg"
                      : "bg-[#16191F] border-slate-700/80 text-[#D90429] hover:bg-[#D90429] hover:text-white hover:border-[#D90429]"
                  }`}
                >
                  <Plus size={12} className="stroke-[3]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Main Verge Hero Grid & Content Section (Pure White Canvas) */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-7xl space-y-12">
          {loading ? (
            <div className="p-16 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <Loader2 size={36} className="animate-spin text-[#D90429] mx-auto" />
              <p className="text-xs font-bold text-slate-600">Đang tải tin tức kỹ thuật mới nhất từ CSDL Q.BA...</p>
            </div>
          ) : (
            <>
              {/* Dual-Split Verge Hero Grid */}
              {featuredArticle && !searchQuery && !selectedCategory && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-slate-200 pb-12">
                  
                  {/* Left Column (7 cols): Main Featured Cover Banner */}
                  <div className="lg:col-span-7 space-y-4 group">
                    <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl bg-slate-900 overflow-hidden shadow-xl border border-slate-200">
                      <Image 
                        src={featuredArticle.imageSrc}
                        alt={featuredArticle.title}
                        fill
                        priority
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-[#D90429] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                        {featuredArticle.category}
                      </div>
                    </div>

                    {/* The Verge Title Highlight Box */}
                    <div className="space-y-3">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading uppercase text-slate-900 leading-tight">
                        <Link href={`/news/${featuredArticle.slug}`} className="hover:text-[#D90429] transition-colors">
                          <span className="bg-[#111317] text-white px-3.5 py-1 inline shadow-md border-l-4 border-[#D90429] rounded-r-md">
                            {featuredArticle.title}
                          </span>
                        </Link>
                      </h2>

                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3 font-sans pt-1 font-medium">
                        {featuredArticle.summary}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] font-mono font-bold text-slate-500 pt-1">
                        <span className="text-[#D90429] font-black uppercase">{featuredArticle.author}</span>
                        <span>•</span>
                        <span>{featuredArticle.publishedAt}</span>
                        <span>•</span>
                        <span>{featuredArticle.readTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (5 cols): Compact Article Stack (Verge Style) */}
                  <div className="lg:col-span-5 space-y-6 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-8">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono">
                        LATEST REVIEWS & GUIDES
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
                            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                              <span className="text-[#D90429] font-extrabold uppercase">{art.author}</span>
                              <span>{art.publishedAt}</span>
                            </div>
                          </div>

                          <div className="relative w-24 h-20 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                            <Image 
                              src={art.imageSrc}
                              alt={art.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* 3. Verge Layout Section: Feed Grid + MOST POPULAR Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                
                {/* Left Feed Column (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="flex items-center justify-between border-b-2 border-[#D90429] pb-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#D90429] font-mono flex items-center gap-2">
                      <Sparkles size={14} />
                      LATEST IN TECHNICAL GUIDES
                    </h3>
                  </div>

                  <div className="space-y-8 divide-y divide-slate-100">
                    {filteredArticles.map((article) => (
                      <div key={`feed-${article.id}`} className="pt-8 first:pt-0 flex flex-col sm:flex-row items-start justify-between gap-6 group">
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

                          <div className="flex items-center gap-3 text-[11px] font-mono font-bold text-slate-500">
                            <span className="text-[#D90429] font-black uppercase">{article.author}</span>
                            <span>•</span>
                            <span>{article.publishedAt}</span>
                          </div>
                        </div>

                        <div className="relative w-full sm:w-44 h-32 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 shadow-md">
                          <Image 
                            src={article.imageSrc}
                            alt={article.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column (4 cols): MOST POPULAR Numbered Widget (The Verge Screenshot 3 Style) */}
                <aside className="lg:col-span-4 space-y-8 sticky top-32">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-6 shadow-md relative overflow-hidden">
                    {/* Background Graphic Vertical Text */}
                    <div className="absolute right-0 top-0 bottom-0 text-[80px] font-black font-heading text-slate-200/60 select-none pointer-events-none uppercase tracking-tighter leading-none writing-vertical text-right p-4">
                      POPULAR
                    </div>

                    <div className="border-b border-slate-200 pb-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#D90429] font-mono">
                        MOST POPULAR
                      </h4>
                    </div>

                    <div className="space-y-6 relative z-10">
                      {mostPopularArticles.map((pop, idx) => (
                        <div key={`pop-${pop.id}`} className="flex items-start gap-4 border-b border-slate-200/80 pb-4 last:border-0 last:pb-0 group">
                          <span className="text-xl font-black font-heading text-[#D90429] shrink-0 w-5">
                            {idx + 1}
                          </span>
                          <div className="space-y-1">
                            <h5 className="font-extrabold text-xs text-slate-900 uppercase leading-snug group-hover:text-[#D90429] transition-colors">
                              <Link href={`/news/${pop.slug}`}>
                                {pop.title}
                              </Link>
                            </h5>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Direct Zalo Technical Support Banner */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#D90429] to-[#99021C] text-white shadow-2xl space-y-4">
                    <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider inline-block">
                      TƯ VẤN TRỰC TIẾP Q.BA
                    </span>
                    <h4 className="font-black text-lg uppercase font-heading text-white">
                      KẾT NỐI KỸ THUẬT Q.BA
                    </h4>
                    <p className="text-xs text-red-100 leading-relaxed">
                      Gửi số khung (VIN) hoặc hình ảnh phụ tùng cần tư vấn qua Zalo để nhận báo giá trong 5 phút.
                    </p>
                    <a 
                      href="https://zalo.me/0903588167" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-3.5 bg-white text-[#D90429] font-black rounded-xl text-xs uppercase tracking-wider block text-center shadow-lg hover:bg-slate-100 transition-colors"
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
