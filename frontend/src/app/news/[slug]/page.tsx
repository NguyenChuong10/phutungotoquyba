import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  Tag, 
  BookOpen, 
  ArrowLeft, 
  ArrowRight, 
  Share2, 
  Flame, 
  TrendingUp,
  MessageSquare,
  Sparkles,
  Eye,
  CheckCircle2
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import ArticleContentRenderer from "@/components/public/ArticleContentRenderer";
import ArticleJsonLd from "@/components/public/ArticleJsonLd";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_NAMES: Record<string, string> = {
  'cam-nang-ky-thuat': 'Cẩm Nang Kỹ Thuật',
  'bao-duong-xe-tai': 'Bảo Dưỡng Xe Tải',
  'meo-tra-ma-vin': 'Mẹo Tra Mã VIN',
  'tin-tuc-qba': 'Tin Tức Q.BA',
};

async function getArticleDetail(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/news/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        const art = data.data;
        const catName = CATEGORY_NAMES[art.categorySlug] || art.categoryName || art.categorySlug || 'Cẩm Nang Kỹ Thuật';
        
        // Calculate dynamic reading time based on word count of real content
        const wordCount = art.content ? art.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 0;
        const calcReadTime = Math.max(1, Math.ceil(wordCount / 200));

        // Format dates dynamically from DB
        const pubDateStr = art.publishedAt || art.createdAt;
        const upDateStr = art.updatedAt || art.createdAt;
        const formattedPubDate = pubDateStr ? new Date(pubDateStr).toLocaleDateString('vi-VN') : 'Đang cập nhật';
        const formattedUpDate = upDateStr ? new Date(upDateStr).toLocaleDateString('vi-VN') : 'Đang cập nhật';

        // Extract keywords from title for dynamic tags
        const titleKeywords = art.title
          ? art.title.split(' ').filter((w: string) => w.length > 3).slice(0, 4)
          : [];
        const dynamicTags = Array.from(new Set([catName, ...titleKeywords]));

        return {
          id: art.id,
          title: art.title,
          slug: art.slug,
          category: catName,
          summary: art.summary || (art.content ? art.content.replace(/<[^>]*>?/gm, '').slice(0, 180) + '...' : ''),
          content: art.content || '',
          imageSrc: (art.thumbnailUrl && art.thumbnailUrl !== '/images/news-section/news-1.png') ? art.thumbnailUrl : '/images/logo/logonen.png',
          publishedAt: formattedPubDate,
          updatedAt: formattedUpDate,
          readTime: `${calcReadTime} phút đọc`,
          views: typeof art.views === 'number' ? art.views : 0,
          author: art.author?.fullName || 'Quản Trị Viên Q.BA',
          tags: dynamicTags,
        };
      }
    }
  } catch (err) {
    console.error("Failed to fetch article from API:", err);
  }

  return null;
}

async function getAllArticlesList() {
  try {
    const res = await fetch(`${API_BASE_URL}/news`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const list = data?.data?.news || data?.data || [];
      if (Array.isArray(list)) {
        return list.map((art: any) => {
          const dateStr = art.publishedAt || art.createdAt;
          return {
            id: art.id,
            title: art.title,
            slug: art.slug,
            category: CATEGORY_NAMES[art.categorySlug] || art.categorySlug || 'Cẩm Nang Kỹ Thuật',
            summary: art.summary || (art.content ? art.content.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...' : ''),
            imageSrc: (art.thumbnailUrl && art.thumbnailUrl !== '/images/news-section/news-1.png') ? art.thumbnailUrl : '/images/logo/logonen.png',
            publishedAt: dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : 'Đang cập nhật',
            author: art.author?.fullName || 'Quản Trị Viên Q.BA',
            views: typeof art.views === 'number' ? art.views : 0,
          };
        });
      }
    }
  } catch (err) {
    console.error("Failed to fetch all news list from API:", err);
  }
  return [];
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
  const [article, allNews] = await Promise.all([
    getArticleDetail(slug),
    getAllArticlesList(),
  ]);

  if (!article) {
    notFound();
  }

  // Related & Next/Prev Articles dynamically calculated from DB
  const currentIndex = allNews.findIndex((a) => a.slug === article.slug);
  const prevArticle = currentIndex > 0 ? allNews[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < allNews.length - 1 ? allNews[currentIndex + 1] : null;
  
  // Sort most popular articles by real view count from DB
  const popularArticles = [...allNews]
    .filter((a) => a.slug !== article.slug)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Dynamic Tag Cloud derived from real news list categories & topics
  const dynamicHotTags = Array.from(
    new Set(allNews.map((n) => n.category).filter(Boolean))
  );

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans pt-24 md:pt-28">
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

      {/* Main Container - Editorial Layout */}
      <div className="container mx-auto px-4 max-w-7xl py-4">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-5 flex-wrap pb-3 border-b border-slate-200/80">
          <Link href="/" className="hover:text-[#D90429] transition-colors">Trang chủ</Link>
          <span className="text-slate-400">&gt;</span>
          <Link href="/news" className="hover:text-[#D90429] transition-colors">Cẩm Nang Kỹ Thuật</Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-slate-900 font-bold truncate max-w-md">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* Left Main Article Content Column (Col 8) */}
          <article className="lg:col-span-8 bg-white p-5 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 relative">
            
            {/* Article Header Info (SEO Title & Meta Header) */}
            <div className="space-y-3 pb-5 border-b border-slate-200/80">
              {/* Category Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#D90429] text-xs font-bold uppercase tracking-wider border border-red-200/60">
                <Sparkles size={13} />
                {article.category}
              </div>

              {/* H1 Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading text-slate-900 leading-tight">
                {article.title}
              </h1>

              {/* Author & Publishing Date Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium pt-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#D90429] text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs">
                      QBA
                    </div>
                    <span className="font-bold text-slate-900">{article.author}</span>
                  </div>
                  <span>•</span>
                  <span>Đăng: <strong className="text-slate-700">{article.publishedAt}</strong></span>
                  <span>•</span>
                  <span>Cập nhật: <strong className="text-slate-700">{article.updatedAt}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Eye size={13} className="text-slate-400" /> {article.views} lượt xem</span>
                </div>

                {/* Social Share Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px] uppercase font-mono">CHIA SẺ:</span>
                  <a
                    href={`https://zalo.me/share?url=${encodeURIComponent(`https://phutungotoquyba.com/news/${article.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/80 text-[11px] font-bold hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    Zalo
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://phutungotoquyba.com/news/${article.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/80 text-[11px] font-bold hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </div>

            {/* Main Article Featured Cover Image */}
            <div className="relative aspect-[16/9] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
              <Image 
                src={article.imageSrc}
                alt={article.title}
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Rich Article Body Renderer (100% Real DB Content) */}
            <ArticleContentRenderer content={article.content} />

            {/* Article Related Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="pt-5 border-t border-slate-200 space-y-2.5">
                <span className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Tag size={14} className="text-[#D90429]" /> THẺ BÀI VIẾT:
                </span>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, idx) => (
                    <span 
                      key={`tag-${idx}`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold hover:border-[#D90429] hover:text-[#D90429] transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Next / Previous Article Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-slate-200">
              {prevArticle ? (
                <Link
                  href={`/news/${prevArticle.slug}`}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-[#D90429] hover:bg-slate-100/80 transition-all flex flex-col group"
                >
                  <span className="text-[11px] font-mono font-bold uppercase text-[#D90429] flex items-center gap-1">
                    <ArrowLeft size={13} /> BÀI VIẾT TRƯỚC
                  </span>
                  <span className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#D90429] mt-1">
                    {prevArticle.title}
                  </span>
                </Link>
              ) : (
                <div></div>
              )}

              {nextArticle ? (
                <Link
                  href={`/news/${nextArticle.slug}`}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-[#D90429] hover:bg-slate-100/80 transition-all flex flex-col text-right group sm:col-start-2"
                >
                  <span className="text-[11px] font-mono font-bold uppercase text-[#D90429] flex items-center justify-end gap-1">
                    BÀI VIẾT TIẾP THEO <ArrowRight size={13} />
                  </span>
                  <span className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#D90429] mt-1">
                    {nextArticle.title}
                  </span>
                </Link>
              ) : null}
            </div>

            {/* Author Bio Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D90429] text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                Q.BA
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-bold text-sm text-slate-900">{article.author}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Chuyên gia tra mã catalog & tư vấn phụ tùng xe tải nặng Trung Quốc (HOWO, Weichai, Fast Gear) với 25 năm kinh nghiệm tại Đà Nẵng và Miền Trung.
                </p>
              </div>
            </div>

          </article>

          {/* Right Sidebar Column (Col 4) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 lg:self-start">
            
            {/* Numbered MOST POPULAR Widget (Real views from DB) */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-5 shadow-xs relative overflow-hidden">
              {/* Submerged Slanted Background Watermark Text */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black font-heading text-slate-300/30 select-none pointer-events-none uppercase tracking-widest leading-none z-0 -rotate-12 italic text-center whitespace-nowrap">
                POPULAR
              </div>

              <div className="border-b border-slate-200 pb-3 relative z-10">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#D90429] font-mono flex items-center gap-2">
                  <TrendingUp size={16} /> BÀI VIẾT NỔI BẬT
                </h4>
              </div>

              <div className="space-y-3.5 relative z-10">
                {popularArticles.length > 0 ? (
                  popularArticles.map((pop, idx) => (
                    <div key={`pop-detail-${pop.id}`} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0 group">
                      <span className="text-base font-black font-heading text-[#D90429] shrink-0 w-5">
                        0{idx + 1}
                      </span>
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-xs text-slate-900 group-hover:text-[#D90429] transition-colors leading-snug">
                          <Link href={`/news/${pop.slug}`}>
                            {pop.title}
                          </Link>
                        </h5>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{pop.publishedAt}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><Eye size={10} /> {pop.views} xem</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic">Đang cập nhật bài viết...</div>
                )}
              </div>
            </div>

            {/* Hot Topics Tag Cloud Widget (Real DB Categories) */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-4 shadow-xs">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 font-mono flex items-center gap-2 border-b border-slate-200 pb-3">
                <Tag size={16} className="text-[#D90429]" /> CHỦ ĐỀ QUAN TÂM
              </h4>
              <div className="flex flex-wrap gap-2">
                {dynamicHotTags.length > 0 ? (
                  dynamicHotTags.map((tag, idx) => (
                    <Link
                      key={`tag-cloud-detail-${idx}`}
                      href={`/news?search=${encodeURIComponent(tag)}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold hover:border-[#D90429] hover:text-[#D90429] transition-colors cursor-pointer"
                    >
                      #{tag}
                    </Link>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Đang cập nhật...</span>
                )}
              </div>
            </div>

            {/* Direct Zalo Contact Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#D90429] to-[#99021C] text-white shadow-xl space-y-4">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider inline-block">
                HỖ TRỢ KỸ THUẬT Q.BA
              </span>
              <h4 className="font-black text-lg uppercase font-heading text-white">
                TƯ VẤN BÁO GIÁ HỎA TỐC
              </h4>
              <p className="text-xs text-red-100 leading-relaxed">
                Gửi số khung (VIN) hoặc hình ảnh phụ tùng cần tư vấn qua Zalo để nhận báo giá trong 5 phút.
              </p>
              <a 
                href="https://zalo.me/0903588167" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3 bg-white text-[#D90429] font-black rounded-xl text-xs uppercase tracking-wider block text-center shadow-md hover:bg-slate-100 transition-colors"
              >
                CHAT ZALO (0903.588.167)
              </a>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}
