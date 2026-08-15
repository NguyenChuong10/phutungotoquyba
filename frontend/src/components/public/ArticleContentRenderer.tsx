"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { List, X, ZoomIn, Lightbulb, ShieldCheck, Maximize2 } from "lucide-react";

interface ArticleContentRendererProps {
  content: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function ArticleContentRenderer({ content }: ArticleContentRendererProps) {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [activeTocId, setActiveTocId] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);

  // 1. Process HTML Content: Add IDs for TOC & Enhance Images into Verge Editorial Cards
  const { processedHtml, tocItems } = useMemo(() => {
    if (!content) return { processedHtml: "", tocItems: [] };

    const items: TocItem[] = [];
    let headingIndex = 0;

    // A. Add IDs to H2 & H3 tags
    let htmlStr = content.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, innerText) => {
      headingIndex++;
      const cleanText = innerText.replace(/<[^>]*>?/gm, "").trim();
      const id = `heading-sec-${headingIndex}`;
      const level = tag.toLowerCase() === "h2" ? 2 : 3;

      if (cleanText) {
        items.push({ id, text: cleanText, level });
      }

      return `<${tag} id="${id}" ${attrs} class="scroll-mt-32 font-black text-slate-900 uppercase font-heading text-xl sm:text-2xl mt-10 mb-4 pt-4 border-t border-slate-200 flex items-center gap-2">${innerText}</${tag}>`;
    });

    // B. Transform standalone <img> tags into The Verge Editorial Light Cards
    let figIndex = 0;
    htmlStr = htmlStr.replace(/<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)\/?>/gi, (match, beforeAttrs, src, afterAttrs) => {
      const altMatch = (beforeAttrs + " " + afterAttrs).match(/alt=["']([^"']+)["']/i);
      const altText = altMatch ? altMatch[1] : "Sơ đồ kỹ thuật phụ tùng Q.BA Đà Nẵng";
      figIndex++;

      return `
<figure class="my-8 rounded-2xl bg-slate-50 border border-slate-200 shadow-md overflow-hidden p-3 sm:p-4 space-y-3 group/figure">
  <div class="relative w-full aspect-[16/9] sm:aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
    <img src="${src}" alt="${altText}" class="w-full h-full object-cover group-hover/figure:scale-105 transition-transform duration-500 cursor-zoom-in" />
    <div class="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 pointer-events-none shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zoom-in text-[#D90429]"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
      <span>Phóng to sơ đồ</span>
    </div>
  </div>
  <figcaption class="text-center text-xs font-mono font-extrabold text-slate-700 pt-2 border-t border-slate-200 flex items-center justify-center gap-2">
    <span class="text-[#D90429]">📷 HÌNH ${figIndex}:</span>
    <span>${altText}</span>
  </figcaption>
</figure>`;
    });

    return { processedHtml: htmlStr, tocItems: items };
  }, [content]);

  // 2. Intercept Image Clicks to Trigger Full-Screen Lightbox Modal
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleImgClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === "IMG") {
        const img = target as HTMLImageElement;
        setLightboxImage({
          src: img.src,
          alt: img.alt || "Sơ đồ kỹ thuật phụ tùng xe tải Q.BA Đà Nẵng",
        });
      }
    };

    el.addEventListener("click", handleImgClick);
    return () => {
      el.removeEventListener("click", handleImgClick);
    };
  }, [processedHtml]);

  // 3. Track active heading for Table of Contents highlight on scroll
  useEffect(() => {
    if (tocItems.length === 0) return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = tocItems.length - 1; i >= 0; i--) {
        const itemEl = document.getElementById(tocItems[i].id);
        if (itemEl && itemEl.offsetTop <= scrollPos) {
          setActiveTocId(tocItems[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Dynamic Table of Contents (Light Theme) */}
      {tocItems.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-3 my-6">
          <div className="flex items-center gap-2 font-black text-slate-900 text-xs uppercase tracking-widest font-heading border-b border-slate-200 pb-3">
            <List size={16} className="text-[#D90429]" />
            <span>MỤC LỤC NỘI DUNG BÀI VIẾT</span>
          </div>

          <nav className="space-y-1.5 text-xs font-semibold">
            {tocItems.map((item) => (
              <button
                key={`toc-${item.id}`}
                onClick={() => scrollToHeading(item.id)}
                className={`block w-full text-left transition-all py-2 px-3 rounded-lg cursor-pointer ${
                  item.level === 3 ? "pl-6 text-slate-600 text-[11px]" : "text-slate-800"
                } ${
                  activeTocId === item.id
                    ? "bg-[#D90429] text-white font-black shadow-sm"
                    : "hover:bg-slate-200/60 hover:text-[#D90429]"
                }`}
              >
                • {item.text}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* 2. Main Article Content Body (Light Background Crisp Readability) */}
      <div
        ref={contentRef}
        className="article-rich-body text-slate-800 text-sm md:text-base leading-relaxed space-y-6 font-sans
          [&_p:first-of-type]:first-letter:text-4xl [&_p:first-of-type]:first-letter:font-black [&_p:first-of-type]:first-letter:text-[#D90429] [&_p:first-of-type]:first-letter:mr-2.5 [&_p:first-of-type]:first-letter:float-left [&_p:first-of-type]:first-letter:leading-none
          [&_p]:leading-relaxed [&_p]:text-slate-700
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:text-slate-700
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:text-slate-700
          [&_strong]:font-black [&_strong]:text-slate-900
          [&_blockquote]:p-5 [&_blockquote]:bg-red-50/60 [&_blockquote]:border-l-4 [&_blockquote]:border-[#D90429] [&_blockquote]:rounded-r-2xl [&_blockquote]:italic [&_blockquote]:text-slate-900 [&_blockquote]:font-bold"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      ></div>

      {/* 3. Callout Box: Advice from Q.BA Technical Team */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900 text-white shadow-xl space-y-4 my-8 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D90429]/20 text-[#D90429] border border-[#D90429]/40 flex items-center justify-center shrink-0">
            <Lightbulb size={22} />
          </div>
          <div>
            <h4 className="font-extrabold text-xs uppercase text-white tracking-wider font-heading">
              LỜI KHUYÊN KỸ THUẬT TỪ QUẢN LÝ KHO Q.BA
            </h4>
            <p className="text-xs text-slate-400">Tư vấn chọn mua đúng mã linh kiện OEM & loại 1 cao cấp</p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          &ldquo;Nếu bạn gặp khó khăn trong việc tra cứu số khung VIN xe HOWO, Weichai hoặc Fast Gear, hãy chụp ảnh mã linh kiện cũ hoặc gửi số VIN qua Zalo. Đội ngũ kỹ thuật Q.BA với 25 năm kinh nghiệm sẽ hỗ trợ tra sơ đồ nhà máy và báo giá trong 5 phút!&rdquo;
        </p>
      </div>

      {/* 4. Full-Screen Image Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-slate-800 hover:bg-[#D90429] text-white flex items-center justify-center transition-colors cursor-pointer z-10 shadow-2xl"
            aria-label="Đóng ảnh"
          >
            <X size={24} />
          </button>

          <div className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center space-y-4">
            <div className="relative w-full h-[68vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                className="w-full h-full object-contain mx-auto"
              />
            </div>
            {lightboxImage.alt && (
              <p className="text-xs font-mono font-bold text-slate-300 bg-slate-900 px-5 py-2.5 rounded-full border border-slate-800 text-center shadow-lg">
                🔍 {lightboxImage.alt}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
