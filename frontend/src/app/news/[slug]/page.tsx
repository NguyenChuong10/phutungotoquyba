import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, User, ChevronRight, Tag, BookOpen, ShieldCheck } from "lucide-react";
import { newsData } from "@/data/newsData";


interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return newsData.map((art) => ({
    slug: art.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = newsData.find((a) => a.slug === slug);
  if (!article) return { title: "Bài Viết Không Tồn Tại - Q.BA" };

  return {
    title: `${article.title} - Phụ Tùng Ô Tô Q.BA`,
    description: article.summary,
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = newsData.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  // Related Articles
  const relatedArticles = newsData.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <div>

      {/* 1. Header Banner */}
      <section className="bg-[#111317] text-white pt-32 md:pt-40 pb-12 md:pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10 space-y-4">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <Link href="/news" className="hover:text-white transition-colors">Tin tức & Cẩm nang</Link>
            <ChevronRight size={14} />
            <span className="text-brand truncate max-w-xs">{article.category}</span>
          </nav>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black font-heading uppercase text-white tracking-wide leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-300 font-bold pt-2">
            <span className="px-3 py-1 rounded-full bg-brand text-white uppercase text-[11px]">
              {article.category}
            </span>
            <span className="flex items-center gap-1.5">
              <User size={15} className="text-brand" />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={15} className="text-brand" />
              {article.publishedAt}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-brand" />
              {article.readTime}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Article Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* Left Column: Main Article Body (Col 8) */}
            <article className="lg:col-span-8 space-y-8">
              
              {/* Featured Cover Image */}
              <div className="relative h-[320px] sm:h-[450px] rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-200">
                <Image 
                  src={article.imageSrc}
                  alt={article.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {/* Summary Lead Box */}
              <div className="p-6 rounded-2xl bg-slate-50 border-l-4 border-brand text-slate-800 text-sm md:text-base font-medium leading-relaxed italic">
                &ldquo;{article.summary}&rdquo;
              </div>


              {/* Rich Body Content */}
              <div 
                className="prose prose-lg max-w-none text-slate-800 leading-relaxed font-sans space-y-6 [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-black [&_h2]:font-heading [&_h2]:uppercase [&_h2]:text-slate-900 [&_h2]:pt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:text-slate-900"
                dangerouslySetInnerHTML={{ __html: article.content }}
              ></div>

              {/* Article Tags */}
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider block flex items-center gap-1.5">
                  <Tag size={15} className="text-brand" /> Thẻ bài viết:
                </span>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, idx) => (
                    <span 
                      key={`tag-${idx}`}
                      className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author Bio Box */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex items-center gap-4 border border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-brand/20 text-brand flex items-center justify-center font-bold text-xl shrink-0 border border-brand/40">
                  Q.BA
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase text-white">{article.author}</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Chuyên gia tra mã catalog & tư vấn phụ tùng xe tải nặng Trung Quốc (HOWO, Weichai, Fast Gear) với 25 năm uy tín tại Đà Nẵng và Miền Trung.
                  </p>
                </div>
              </div>

            </article>

            {/* Right Sidebar (Col 4) */}
            <aside className="lg:col-span-4 space-y-8">
              
              {/* Quick Zalo Contact Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-brand to-red-700 text-white shadow-xl space-y-4">
                <h4 className="font-black text-lg uppercase">TƯ VẤN KỸ THUẬT HỎA TỐC</h4>
                <p className="text-xs text-red-100 leading-relaxed">
                  Gửi số khung (VIN) hoặc hình ảnh phụ tùng cần tư vấn cho kỹ thuật Q.BA qua Zalo.
                </p>
                <a 
                  href="https://zalo.me/0903588167" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-white text-brand font-black rounded-xl text-xs uppercase tracking-wider block text-center shadow-lg hover:bg-red-50 transition-colors"
                >
                  CHAT ZALO KỸ THUẬT
                </a>
              </div>

              {/* Catalog E-Product Widget */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-lg space-y-4">
                <h4 className="font-black text-sm font-heading text-slate-900 uppercase flex items-center gap-2 pb-3 border-b border-slate-200">
                  <ShieldCheck size={18} className="text-brand" />
                  E-CATALOGUE PHỤ TÙNG
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Tra cứu hơn 10.000+ mã phụ tùng xe tải ben, xe đầu kéo sẵn kho Đà Nẵng.
                </p>
                <Link 
                  href="/products"
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-brand text-white text-xs font-bold uppercase tracking-wider block text-center transition-colors"
                >
                  TRA CỨU SẢN PHẨM →
                </Link>
              </div>

              {/* Recent Articles */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-4">
                <h4 className="font-black text-sm font-heading text-slate-900 uppercase flex items-center gap-2 pb-3 border-b border-slate-200">
                  <BookOpen size={18} className="text-brand" />
                  BÀI VIẾT KHÁC
                </h4>

                <div className="space-y-4">
                  {relatedArticles.map((rel) => (
                    <div key={`rel-art-${rel.id}`} className="space-y-1 group">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{rel.publishedAt}</span>
                      <h5 className="font-bold text-slate-900 text-xs leading-snug group-hover:text-brand transition-colors">
                        <Link href={`/news/${rel.slug}`}>
                          {rel.title}
                        </Link>
                      </h5>
                    </div>
                  ))}
                </div>
              </div>

            </aside>

          </div>
        </div>
      </section>

    </div>
  );
}
