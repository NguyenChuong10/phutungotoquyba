"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Clock, Calendar, BookOpen, ArrowRight, MessageSquare, Loader2 } from "lucide-react";
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
  tags: string[];
}

const CATEGORY_LABEL_MAP: Record<string, string> = {
  'cam-nang-ky-thuat': 'Cẩm Nang Kỹ Thuật',
  'bao-duong-xe-tai': 'Bảo Dưỡng Xe Tải',
  'tra-ma-vin': 'Mẹo Tra Mã VIN',
  'tin-tuc-quy-ba': 'Tin Tức Q.BA',
};

const CATEGORIES_LIST = [
  "Tất cả tin tức",
  "Cẩm Nang Kỹ Thuật",
  "Bảo Dưỡng Xe Tải",
  "Mẹo Tra Mã VIN",
  "Tin Tức Q.BA",
];

export default function NewsIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả tin tức");
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
            publishedAt: art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('vi-VN') : 'Mới xuất bản',
            readTime: '5 phút đọc',
            isFeatured: !!art.isFeatured,
            tags: ['Phụ Tùng Q.BA', 'Kỹ Thuật Xe Tải', 'Bảo Dưỡng'],
          }));
          setArticlesList(mapped);
        } else {
          // Fallback to initial mock news if DB is empty
          const fallbackMapped: ArticleUIItem[] = newsData.map((art) => ({
            ...art,
            isFeatured: !!art.isFeatured,
          }));
          setArticlesList(fallbackMapped);
        }
      } catch (err) {
        console.error('Failed to load news from API:', err);
        const fallbackMapped: ArticleUIItem[] = newsData.map((art) => ({
          ...art,
          isFeatured: !!art.isFeatured,
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

  const filteredArticles = useMemo(() => {
    return articlesList.filter((art) => {
      const matchCat = selectedCategory === "Tất cả tin tức" || art.category.toLowerCase().includes(selectedCategory.toLowerCase());
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
    <div>
      {/* 1. Header Banner */}
      <section className="bg-[#111317] text-white pt-32 md:pt-40 pb-16 md:pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-black tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
            Tin Tức & Hướng Dẫn Kỹ Thuật Q.BA
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black font-heading uppercase tracking-wide leading-tight mb-6">
            KINH NGHIỆM & <span className="text-brand">CẨM NANG PHỤ TÙNG</span>
          </h1>

          <p className="text-gray-300 text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            Chia sẻ kiến thức bảo dưỡng động cơ Weichai, hộp số Fast Gear, mẹo nhận biết phụ tùng HOWO chính hãng từ đội ngũ kỹ thuật 25 năm kinh nghiệm.
          </p>
        </div>
      </section>

      {/* 2. Main News Section */}
      <section className="py-16 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl space-y-12">
          {loading ? (
            <div className="p-16 text-center bg-white rounded-3xl space-y-3 shadow-lg">
              <Loader2 size={36} className="animate-spin text-brand mx-auto" />
              <p className="text-xs font-bold text-slate-600">Đang tải bài viết kỹ thuật mới nhất từ CSDL...</p>
            </div>
          ) : (
            <>
              {/* Featured Article Card */}
              {featuredArticle && !searchQuery && selectedCategory === "Tất cả tin tức" && (
                <div className="p-6 md:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group">
                  <div className="lg:col-span-7 relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-900">
                    <Image 
                      src={featuredArticle.imageSrc}
                      alt={featuredArticle.title}
                      fill
                      priority
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-brand text-white text-xs font-black tracking-wider uppercase shadow-lg">
                      BÀI VIẾT NỔI BẬT
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                      <span className="px-3 py-1 rounded-full bg-brand/10 text-brand uppercase">
                        {featuredArticle.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {featuredArticle.publishedAt}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-heading text-slate-900 uppercase leading-snug group-hover:text-brand transition-colors">
                      <Link href={`/news/${featuredArticle.slug}`}>
                        {featuredArticle.title}
                      </Link>
                    </h2>

                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {featuredArticle.summary}
                    </p>

                    <div className="pt-2">
                      <Link 
                        href={`/news/${featuredArticle.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-brand text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
                      >
                        ĐỌC BÀI VIẾT CHI TIẾT
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Bar & Search Bar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200 shadow-lg">
                {/* Category Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                  {CATEGORIES_LIST.map((cat, idx) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={`news-cat-${idx}`}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
                          isActive 
                            ? "bg-brand text-white shadow-md shadow-brand/30" 
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-72 shrink-0">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand transition-all font-medium"
                  />
                </div>
              </div>

              {/* Articles Grid */}
              {filteredArticles.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white text-center space-y-3">
                  <BookOpen size={40} className="text-gray-400 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-800 uppercase">Không tìm thấy bài viết phù hợp</h3>
                  <p className="text-xs text-gray-500">Vui lòng thử tìm kiếm với từ khóa khác.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredArticles.map((article) => (
                    <article 
                      key={`art-card-${article.id}`}
                      className="rounded-3xl bg-white border border-slate-200/90 hover:border-brand/40 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                    >
                      <div>
                        {/* Article Image */}
                        <div className="relative h-52 bg-slate-900 overflow-hidden">
                          <Image 
                            src={article.imageSrc}
                            alt={article.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase">
                            {article.category}
                          </div>
                        </div>

                        {/* Article Content */}
                        <div className="p-6 space-y-3">
                          <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold">
                            <span className="flex items-center gap-1">
                              <Calendar size={13} />
                              {article.publishedAt}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={13} />
                              {article.readTime}
                            </span>
                          </div>

                          <h3 className="text-lg font-black font-heading text-slate-900 uppercase leading-snug group-hover:text-brand transition-colors line-clamp-2">
                            <Link href={`/news/${article.slug}`}>
                              {article.title}
                            </Link>
                          </h3>

                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                            {article.summary}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-6 pt-0">
                        <Link 
                          href={`/news/${article.slug}`}
                          className="text-xs font-bold text-slate-900 group-hover:text-brand uppercase inline-flex items-center gap-1.5 transition-colors"
                        >
                          Đọc tiếp bài viết →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Direct Technical Consultation CTA */}
          <div className="p-8 md:p-12 rounded-3xl bg-slate-900 text-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 border border-slate-800">
            <div className="space-y-2 text-center lg:text-left">
              <h3 className="text-2xl font-black font-heading uppercase text-white">
                BẠN CẦN THƯỜNG XUYÊN XEM CẨM NANG & TRA MÃ PHỤ TÙNG?
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm max-w-xl">
                Kết nối Zalo Kỹ thuật Q.BA để nhận thông báo bài viết mới và tư vấn tra catalog trực tiếp 24/7.
              </p>
            </div>

            <a 
              href="https://zalo.me/0903588167" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl bg-brand hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-brand/40 transition-colors shrink-0"
            >
              <MessageSquare size={18} />
              KẾT NỐI ZALO KỸ THUẬT Q.BA
            </a>
          </div>

        </div>
      </section>
    </div>
  );
}
