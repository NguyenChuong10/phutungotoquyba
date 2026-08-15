import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, User, ChevronRight, Tag, BookOpen, ShieldCheck, ArrowLeft, ArrowRight, Share2, Flame } from "lucide-react";
import { newsData } from "@/data/newsData";
import { API_BASE_URL } from "@/config/api";
import ArticleContentRenderer from "@/components/public/ArticleContentRenderer";
import ArticleJsonLd from "@/components/public/ArticleJsonLd";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getArticleDetail(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/news/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        const art = data.data;
        return {
          id: art.id,
          title: art.title,
          slug: art.slug,
          category: art.categorySlug || 'Cẩm Nang Kỹ Thuật',
          summary: art.content ? art.content.replace(/<[^>]*>?/gm, '').slice(0, 180) + '...' : '',
          content: art.content || '',
          imageSrc: art.thumbnailUrl || '/images/news-section/news-1.png',
          publishedAt: art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('vi-VN') : '15 THÁNG 8',
          readTime: '5 PHÚT ĐỌC',
          author: art.author?.fullName || 'KỸ THUẬT Q.BA',
          tags: ['Phụ Tùng Q.BA', 'Xe Tải Nặng', 'Kỹ Thuật'],
        };
      }
    }
  } catch (err) {
    console.error("Failed to fetch article from API:", err);
  }

  // Fallback to local newsData
  return newsData.find((a) => a.slug === slug) || null;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleDetail(slug);
  if (!article) return { title: "Bài Viết Không Tồn Tại - Q.BA" };

  return {
    title: `${article.title} - Cẩm Nang Phụ Tùng Ô Tô Q.BA`,
    description: article.summary,
    openGraph: {
      title: `${article.title} - Phụ Tùng Ô Tô Q.BA Đà Nẵng`,
      description: article.summary,
      images: [{ url: article.imageSrc }],
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleDetail(slug);

  if (!article) {
    notFound();
  }

  // Related & Next/Prev Articles fallback
  const allNews = newsData;
  const currentIndex = allNews.findIndex((a) => a.slug === article.slug);
  const prevArticle = currentIndex > 0 ? allNews[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < allNews.length - 1 ? allNews[currentIndex + 1] : null;
  const relatedArticles = allNews.filter((a) => a.slug !== article.slug).slice(0, 5);

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans">
      {/* 0. SEO JSON-LD Structured Data */}
      <ArticleJsonLd
        article={{
          title: article.title,
          description: article.summary,
          slug: article.slug,
          imageSrc: article.imageSrc,
          publishedAt: article.publishedAt,
          author: article.author,
          category: article.category,
        }}
      />

      {/* 1. Header The Verge Style Hero Banner */}
      <section className="bg-[#111317] text-white pt-32 md:pt-36 pb-12 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl relative z-10 space-y-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <Link href="/news" className="hover:text-white transition-colors">Cẩm Nang Kỹ Thuật</Link>
            <ChevronRight size={14} />
            <span className="text-[#D90429] truncate max-w-xs">{article.category}</span>
          </nav>

          {/* The Verge Title Highlight Box */}
          <div className="bg-[#0D0F12] p-4 md:p-6 rounded-xl border-l-4 border-[#D90429] shadow-xl">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black font-heading uppercase text-white tracking-wide leading-tight">
              {article.title}
            </h1>
          </div>

          {/* Red Author Metadata Line */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold text-slate-400 pt-1">
            <span className="px-3 py-1 rounded-md bg-[#D90429] text-white uppercase text-[11px] font-black tracking-wider">
              {article.category}
            </span>
            <span className="text-[#D90429] font-black uppercase">{article.author || 'KỸ THUẬT Q.BA'}</span>
            <span>•</span>
            <span>{article.publishedAt}</span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </section>

      {/* 2. Main Content & Sidebar Layout (Pure White Background for Effortless Reading) */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

            {/* Left Column: Article Body (Col 8) */}
            <article className="lg:col-span-8 space-y-8">
              
              {/* Cover Image Container */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200">
                <Image 
                  src={article.imageSrc}
                  alt={article.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {/* Lead Summary Quote Box */}
              {article.summary && (
                <div className="p-6 md:p-8 rounded-2xl bg-slate-50 border-l-4 border-[#D90429] text-slate-900 text-base md:text-lg font-bold leading-relaxed shadow-sm">
                  &ldquo;{article.summary}&rdquo;
                </div>
              )}

              {/* Rich Body Content Renderer with TOC & Image Lightbox */}
              <ArticleContentRenderer content={article.content} />

              {/* Article Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="pt-6 border-t border-slate-200 space-y-3">
                  <span className="text-xs font-mono font-black uppercase text-slate-500 tracking-wider block flex items-center gap-1.5">
                    <Tag size={14} className="text-[#D90429]" /> THẺ BÀI VIẾT LIÊN QUAN:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, idx) => (
                      <span 
                        key={`tag-${idx}`}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold hover:border-[#D90429] hover:text-[#D90429] transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Next / Previous Article Navigation Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                {prevArticle ? (
                  <Link
                    href={`/news/${prevArticle.slug}`}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#D90429]/60 transition-all flex flex-col group"
                  >
                    <span className="text-[10px] font-mono font-black uppercase text-slate-500 flex items-center gap-1">
                      <ArrowLeft size={12} className="text-[#D90429]" /> BÀI VIẾT TRƯỚC
                    </span>
                    <span className="text-xs font-extrabold font-heading text-slate-900 line-clamp-1 group-hover:text-[#D90429] mt-1">
                      {prevArticle.title}
                    </span>
                  </Link>
                ) : (
                  <div></div>
                )}

                {nextArticle ? (
                  <Link
                    href={`/news/${nextArticle.slug}`}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#D90429]/60 transition-all flex flex-col text-right group sm:col-start-2"
                  >
                    <span className="text-[10px] font-mono font-black uppercase text-slate-500 flex items-center justify-end gap-1">
                      BÀI VIẾT TIẾP THEO <ArrowRight size={12} className="text-[#D90429]" />
                    </span>
                    <span className="text-xs font-extrabold font-heading text-slate-900 line-clamp-1 group-hover:text-[#D90429] mt-1">
                      {nextArticle.title}
                    </span>
                  </Link>
                ) : null}
              </div>

              {/* Author Bio Card */}
              <div className="p-6 md:p-8 rounded-2xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-5 border border-slate-800">
                <div className="w-16 h-16 rounded-xl bg-[#D90429]/20 text-[#D90429] flex items-center justify-center font-black font-heading text-xl shrink-0 border border-[#D90429]/40 shadow-inner">
                  Q.BA
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <h4 className="font-extrabold text-sm uppercase text-white font-heading">{article.author}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Chuyên gia tra mã catalog & tư vấn phụ tùng xe tải nặng Trung Quốc (HOWO, Weichai, Fast Gear) với 25 năm uy tín tại Đà Nẵng và Miền Trung.
                  </p>
                </div>
              </div>

            </article>

            {/* Right Sidebar Column (Col 4) */}
            <aside className="lg:col-span-4 space-y-8 sticky top-32">
              
              {/* Numbered MOST POPULAR Widget (The Verge Screenshot 3 Style on Light Theme) */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-6 shadow-md relative overflow-hidden">
                <div className="border-b border-slate-200 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#D90429] font-mono">
                    MOST POPULAR
                  </h4>
                </div>

                <div className="space-y-5 relative z-10">
                  {relatedArticles.map((pop, idx) => (
                    <div key={`pop-detail-${pop.id}`} className="flex items-start gap-4 border-b border-slate-200/80 pb-3.5 last:border-0 last:pb-0 group">
                      <span className="text-lg font-black font-heading text-[#D90429] shrink-0 w-4">
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

              {/* Quick Zalo Contact Box */}
              <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#D90429] to-[#99021C] text-white shadow-2xl space-y-4">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider inline-block">
                  HỖ TRỢ KỸ THUẬT 24/7
                </span>
                <h4 className="font-black text-xl uppercase font-heading text-white">
                  TƯ VẤN BÁO GIÁ HỎA TỐC
                </h4>
                <p className="text-xs text-red-100 leading-relaxed">
                  Gửi số khung (VIN) hoặc hình ảnh phụ tùng cần tư vấn qua Zalo để nhận báo giá trong 5 phút.
                </p>
                <a 
                  href="https://zalo.me/0903588167" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-white text-[#D90429] font-black rounded-xl text-xs uppercase tracking-wider block text-center shadow-lg hover:bg-slate-100 transition-colors"
                >
                  CHAT ZALO (0903.588.167)
                </a>
              </div>

            </aside>

          </div>
        </div>
      </section>
    </div>
  );
}
