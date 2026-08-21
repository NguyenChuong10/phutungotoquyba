"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { List, X, ZoomIn, Lightbulb, ChevronDown, ChevronUp, BookOpen, Layers } from "lucide-react";

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
  const [showStickyTocBar, setShowStickyTocBar] = useState(false);
  const [isStickyTocDropdownOpen, setIsStickyTocDropdownOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // 1. Process HTML Content: Add IDs for TOC & Clean Formatting
  const { processedHtml, tocItems } = useMemo(() => {
    if (!content) return { processedHtml: "", tocItems: [] };

    // 0. Clean empty paragraphs, excessive linebreaks & unwrap legacy box card wrapper <div> elements
    let htmlStr = content
      .replace(/<p>\s*(?:&nbsp;|<br\s*\/?>)?\s*<\/p>/gi, "")
      .replace(/(?:<br\s*\/?>\s*){2,}/gi, "<br />")
      .replace(/<div[^>]*class=["'][^"']*(?:bg-slate-50|border-slate-200|rounded-3xl|shadow-sm|my-10|my-8|space-y-6|space-y-4)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi, (match, inner) => {
        return `<div class="my-2.5 space-y-2">${inner}</div>`;
      });

    const items: TocItem[] = [];
    let headingIndex = 0;

    // A. Add IDs & SEO styling to H2 & H3 tags
    htmlStr = htmlStr.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, innerText) => {
      headingIndex++;
      
      const textWithoutBadge = innerText.replace(/<span[^>]*w-[0-9]+[^>]*>[\s\S]*?<\/span>/gi, "").trim();
      let cleanText = textWithoutBadge.replace(/<[^>]*>?/gm, "").trim();
      cleanText = cleanText.replace(/^[0-9]+(?=[A-ZÀ-Ỹa-zà-ỹ\s])/, "").trim();

      const id = `heading-sec-${headingIndex}`;
      const isH2 = tag.toLowerCase() === "h2";
      const level = isH2 ? 2 : 3;

      if (cleanText) {
        items.push({ id, text: cleanText, level });
      }

      if (attrs.includes("class=")) {
        return `<${tag} id="${id}" ${attrs}>${innerText}</${tag}>`;
      }

      const headingClasses = isH2
        ? "scroll-mt-36 font-bold text-slate-900 font-heading text-xl sm:text-2xl mt-6 mb-2 pb-1.5 border-b border-slate-200"
        : "scroll-mt-36 font-bold text-slate-900 font-heading text-lg sm:text-xl mt-5 mb-2 border-l-4 border-[#D90429] pl-3";

      return `<${tag} id="${id}" ${attrs} class="${headingClasses}">${innerText}</${tag}>`;
    });

    // B. Transform standalone <img> tags into Clean Editorial Cards (Without HÌNH X caption)
    htmlStr = htmlStr.replace(/<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)\/?>/gi, (match, beforeAttrs, src, afterAttrs) => {
      const altMatch = (beforeAttrs + " " + afterAttrs).match(/alt=["']([^"']+)["']/i);
      const altText = altMatch ? altMatch[1] : "Sơ đồ kỹ thuật phụ tùng Q.BA Đà Nẵng";

      return `
<figure class="my-5 group/figure">
  <div class="relative w-full aspect-[16/9] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs flex items-center justify-center">
    <img src="${src}" alt="${altText}" class="w-full h-full object-cover group-hover/figure:scale-105 transition-transform duration-500 cursor-zoom-in" />
    <div class="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 pointer-events-none shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zoom-in text-[#D90429]"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
      <span>Phóng to sơ đồ</span>
    </div>
  </div>
</figure>`;
    });

    return { processedHtml: htmlStr, tocItems: items };
  }, [content]);

  // 2. Intercept Image Clicks for Lightbox
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

  // 3. Scroll tracking for sticky top reading bar & active heading highlight
  useEffect(() => {
    if (tocItems.length === 0) return;

    const handleScroll = () => {
      const scrollPos = window.scrollY;

      // Show sticky TOC header bar when user scrolls down past 450px
      if (scrollPos > 450) {
        setShowStickyTocBar(true);
      } else {
        setShowStickyTocBar(false);
        setIsStickyTocDropdownOpen(false);
      }

      // Track active heading
      const checkPos = scrollPos + 220;
      for (let i = tocItems.length - 1; i >= 0; i--) {
        const itemEl = document.getElementById(tocItems[i].id);
        if (itemEl && itemEl.offsetTop <= checkPos) {
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
      setIsStickyTocDropdownOpen(false);
    }
  };

  const activeItemText = useMemo(() => {
    const found = tocItems.find((item) => item.id === activeTocId);
    return found ? found.text : "Nội dung bài viết";
  }, [tocItems, activeTocId]);

  return (
    <div className="space-y-4 relative">
      {/* 1. Dynamic Inline Table of Contents */}
      {tocItems.length > 0 && (
        <div className="p-4 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs space-y-3.5 my-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5 font-black text-slate-900 text-xs uppercase tracking-widest font-heading">
              <div className="w-7 h-7 rounded-xl bg-red-50 border border-red-200 text-[#D90429] flex items-center justify-center shrink-0">
                <List size={15} />
              </div>
              <span>NỘI DUNG BÀI VIẾT</span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] font-bold">
              {tocItems.length} mục
            </span>
          </div>

          <nav className="space-y-1 text-xs font-sans">
            {tocItems.map((item, idx) => {
              const isActive = activeTocId === item.id;
              const isH2 = item.level === 2;

              return (
                <button
                  key={`toc-${item.id}`}
                  onClick={() => scrollToHeading(item.id)}
                  className={`group flex items-start gap-2.5 w-full text-left transition-all py-1.5 px-3 rounded-xl cursor-pointer ${
                    isH2 ? "font-bold text-slate-800" : "pl-7 font-medium text-slate-600 text-[11px]"
                  } ${
                    isActive
                      ? "text-[#D90429] font-extrabold bg-red-50 border border-red-200/60 shadow-2xs"
                      : "hover:text-[#D90429] hover:bg-slate-100/80"
                  }`}
                >
                  <span className={`font-mono shrink-0 transition-colors ${
                    isActive ? "text-[#D90429] font-bold" : "text-slate-400 group-hover:text-[#D90429]"
                  }`}>
                    {isH2 ? `${idx + 1}.` : "•"}
                  </span>

                  <span className="leading-snug flex-1">
                    {item.text}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* 2. STICKY TOP READING TOC BAR (Sticks prominent at top when scrolling) */}
      {showStickyTocBar && tocItems.length > 0 && (
        <div className="sticky top-20 z-40 my-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-lg rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-[#D90429] flex items-center justify-center shrink-0">
                <List size={16} />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D90429] block">
                  Đang đọc phần:
                </span>
                <span className="text-xs font-bold text-slate-900 truncate block">
                  {activeItemText}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsStickyTocDropdownOpen((prev) => !prev)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
            >
              <span>Xem Tất Cả Mục ({tocItems.length})</span>
              {isStickyTocDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Sticky Dropdown Menu Content */}
          {isStickyTocDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl space-y-2 z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider font-heading flex items-center gap-2">
                  <List size={14} className="text-[#D90429]" />
                  <span>DANH SÁCH MỤC LỤC BÀI VIẾT</span>
                </span>
                <button
                  onClick={() => setIsStickyTocDropdownOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="space-y-1 text-xs">
                {tocItems.map((item, idx) => {
                  const isActive = activeTocId === item.id;
                  const isH2 = item.level === 2;

                  return (
                    <button
                      key={`sticky-dropdown-${item.id}`}
                      onClick={() => scrollToHeading(item.id)}
                      className={`group flex items-start gap-2.5 w-full text-left transition-all py-1.5 px-3 rounded-xl cursor-pointer ${
                        isH2 ? "font-bold text-slate-800" : "pl-7 font-medium text-slate-600 text-[11px]"
                      } ${
                        isActive
                          ? "text-[#D90429] font-extrabold bg-red-50 border border-red-200/60 shadow-2xs"
                          : "hover:text-[#D90429] hover:bg-slate-100/80"
                      }`}
                    >
                      <span className={`font-mono shrink-0 ${
                        isActive ? "text-[#D90429] font-bold" : "text-slate-400"
                      }`}>
                        {isH2 ? `${idx + 1}.` : "•"}
                      </span>
                      <span className="leading-snug">
                        {item.text}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      )}

      {/* 3. Main Article Content Body */}
      <div
        ref={contentRef}
        className="article-rich-body font-sans text-slate-800 text-base md:text-lg leading-relaxed
          [&_p]:text-slate-700 [&_p]:text-base [&_p]:md:text-lg [&_p]:leading-relaxed [&_p]:my-2 [&_p]:font-normal
          [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:font-heading [&_h2]:text-slate-900 [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:pb-1.5 [&_h2]:border-b [&_h2]:border-slate-200
          [&_h3]:text-lg [&_h3]:sm:text-xl [&_h3]:font-bold [&_h3]:font-heading [&_h3]:text-slate-900 [&_h3]:mt-4.5 [&_h3]:mb-2 [&_h3]:border-l-4 [&_h3]:border-[#D90429] [&_h3]:pl-3
          [&_figure]:my-3.5
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ul]:space-y-1 [&_ul]:text-slate-700
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_ol]:space-y-1 [&_ol]:text-slate-700
          [&_strong]:font-bold [&_strong]:text-slate-900
          [&_blockquote]:p-3.5 [&_blockquote]:bg-red-50/70 [&_blockquote]:border-l-4 [&_blockquote]:border-[#D90429] [&_blockquote]:rounded-r-xl [&_blockquote]:italic [&_blockquote]:text-slate-900 [&_blockquote]:font-medium [&_blockquote]:my-3
          [&_table]:w-full [&_table]:my-3 [&_table]:border-collapse [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:shadow-xs
          [&_th]:bg-slate-900 [&_th]:text-white [&_th]:font-heading [&_th]:font-bold [&_th]:text-xs [&_th]:uppercase [&_th]:p-2.5 [&_th]:text-left
          [&_td]:p-2.5 [&_td]:text-xs [&_td]:border-b [&_td]:border-slate-200 [&_td]:text-slate-700
          [&_a]:text-[#D90429] [&_a]:font-bold [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-red-700"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      ></div>

      {/* 4. Callout Advice Box */}
      <div className="p-5 rounded-2xl bg-red-50/80 border-l-4 border-[#D90429] text-slate-900 shadow-xs space-y-2.5 my-5 border border-red-200/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#D90429] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Lightbulb size={18} />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase text-[#D90429] tracking-wider font-heading">
              LỜI KHUYÊN KỸ THUẬT TỪ QUẢN LÝ KHO Q.BA
            </h4>
            <p className="text-xs text-slate-600 font-medium">Tư vấn chọn mua đúng mã linh kiện OEM & loại 1 cao cấp</p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic bg-white p-3 rounded-xl border border-red-200/80 shadow-2xs font-medium">
          &ldquo;Nếu bạn gặp khó khăn trong việc tra cứu số khung VIN xe HOWO, Weichai hoặc Fast Gear, hãy chụp ảnh mã linh kiện cũ hoặc gửi số VIN qua Zalo. Đội ngũ kỹ thuật Q.BA với 25 năm kinh nghiệm sẽ hỗ trợ tra sơ đồ nhà máy và báo giá trong 5 phút!&rdquo;
        </p>
      </div>

      {/* 5. Full-Screen Image Lightbox Modal */}
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
            <div className="relative w-full h-[68vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-black flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                className="w-full h-full object-contain mx-auto"
              />
            </div>

            {lightboxImage.alt && (
              <p className="text-xs font-mono font-bold text-slate-300 bg-slate-900 px-5 py-2.5 rounded-full border border-slate-800 text-center shadow-lg">
                {lightboxImage.alt}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
