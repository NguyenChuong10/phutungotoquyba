import React from "react";
import Image from "next/image";
import { ShieldCheck, Truck, Package, Award, Phone, ArrowRight, MapPin } from "lucide-react";
import { fetchApi } from "@/config/api";
import { formatImageUrl } from "@/utils/imageHelper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Giới Thiệu - Phụ Tùng Ô Tô Q.BA | 25 Năm Uy Tín Hàng Đầu",
  description: "Tìm hiểu về Phụ Tùng Ô Tô Q.BA - Đơn vị 25 năm kinh nghiệm phân phối phụ tùng xe ben, xe đầu kéo, xe tải Trung Quốc chuẩn OEM tại Đà Nẵng và miền Trung.",
};

export default async function AboutPage() {
  // Fetch dynamic settings from backend
  let warehouseImages: any[] = [];
  let settingsData: Record<string, string> = {};

  try {
    const res = await fetchApi("/settings", { cache: "no-store" });
    if (res.ok && res.data) {
      settingsData = res.data;
      if (res.data.aboutGalleryImages) {
        const parsed = JSON.parse(res.data.aboutGalleryImages);
        if (Array.isArray(parsed)) {
          warehouseImages = parsed;
        }
      }
    }
  } catch (err) {
    console.error("Failed to load about page settings:", err);
  }

  const headerBadge = settingsData.aboutHeaderBadge !== undefined ? settingsData.aboutHeaderBadge : "Hành Trình 25 Năm Uy Tín";
  const headerTitle = settingsData.aboutHeaderTitle !== undefined ? settingsData.aboutHeaderTitle : "GIỚI THIỆU PHỤ TÙNG Ô TÔ Q.BA";
  const headerSubtitle = settingsData.aboutHeaderSubtitle !== undefined ? settingsData.aboutHeaderSubtitle : "Chuyên cung cấp & phân phối phụ tùng ô tô xe tải nặng, xe ben, xe đầu kéo, rơ-moóc Trung Quốc chính hãng.";

  let storyBlocks: any[] = [];
  if (settingsData.aboutStoryBlocks) {
    try {
      const parsedBlocks = JSON.parse(settingsData.aboutStoryBlocks);
      if (Array.isArray(parsedBlocks)) {
        storyBlocks = parsedBlocks;
      }
    } catch {
      // Ignore
    }
  }

  const galleryBadge = settingsData.aboutGallerySectionBadge || "Năng lực thực tế";
  const galleryTitle = settingsData.aboutGallerySectionTitle || "HÌNH ẢNH KHO HÀNG & VẬN CHUYỂN";
  const galleryDesc = settingsData.aboutGallerySectionDesc || "Hình ảnh thực tế về quy mô lưu trữ, đóng gói kiện thùng gỗ và hoạt động vận chuyển tại Phụ Tùng Ô Tô Q.BA";

  return (
    <div>

      {/* 1. Header Banner */}
      <section className="bg-[#111317] text-white pt-28 sm:pt-32 md:pt-36 pb-8 md:pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 max-w-[1536px] relative z-10 text-center">
          {Boolean(headerBadge) && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-[11px] font-black tracking-widest uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
              {headerBadge}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading uppercase tracking-wide leading-tight mb-2 sm:mb-3">
            {headerTitle}
          </h1>

          <p className="text-gray-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            {headerSubtitle}
          </p>
        </div>
      </section>

      {/* 2. Story Timeline Section */}
      {storyBlocks.length > 0 && (
        <section className="py-12 md:py-16 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="relative">
              {/* Connecting Vertical Line on Desktop - ONLY when 2 or more blocks */}
              {storyBlocks.length > 1 && (
                <div className="absolute left-4 md:left-1/2 top-8 bottom-8 w-1 bg-gradient-to-b from-brand via-brand/40 to-slate-200 -translate-x-1/2 hidden md:block rounded-full z-0" />
              )}

              <div className={storyBlocks.length > 1 ? "space-y-16 md:space-y-24 relative z-10" : "relative z-10"}>
                {storyBlocks.map((item: any, idx: number) => {
                  const isEven = idx % 2 === 0;
                  const isMultiple = storyBlocks.length > 1;

                  return (
                    <div
                      key={item.id || `story-${idx}`}
                      className="relative grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center"
                    >
                      {/* Central Node Circle - ONLY when 2 or more blocks */}
                      {isMultiple && (
                        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-brand text-white items-center justify-center font-black text-xs shadow-lg border-4 border-white z-20">
                          {idx + 1}
                        </div>
                      )}

                      {/* Text Block */}
                      <div
                        className={`md:col-span-6 space-y-4 ${
                          isMultiple
                            ? isEven
                              ? "md:order-1 md:pr-8"
                              : "md:order-2 md:pl-8"
                            : "md:order-1"
                        }`}
                      >
                        {Boolean(item.badge) && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-100 border border-slate-200 text-slate-800 text-xs font-extrabold uppercase tracking-wider">
                            <Award className="w-3.5 h-3.5 text-brand" />
                            {item.badge}
                          </div>
                        )}

                        <h3 className="text-2xl sm:text-3xl font-black font-heading text-[#111317] uppercase leading-tight">
                          {item.title}
                        </h3>

                        <p className="text-gray-700 leading-relaxed text-base md:text-lg text-justify whitespace-pre-line">
                          {item.content}
                        </p>

                        {idx === 0 && (
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                              <ShieldCheck className="w-7 h-7 text-brand shrink-0" />
                              <div>
                                <h4 className="font-bold text-slate-900 text-xs uppercase">Cam kết chất lượng</h4>
                                <p className="text-[11px] text-gray-600">Hàng chuẩn loại 1 cao cấp</p>
                              </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                              <Truck className="w-7 h-7 text-brand shrink-0" />
                              <div>
                                <h4 className="font-bold text-slate-900 text-xs uppercase">Gửi Hàng Toàn Quốc</h4>
                                <p className="text-[11px] text-gray-600">Gửi hàng hỏa tốc</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Block */}
                      <div
                        className={`md:col-span-6 ${
                          isMultiple
                            ? isEven
                              ? "md:order-2 md:pl-8"
                              : "md:order-1 md:pr-8"
                            : "md:order-2"
                        }`}
                      >
                        {Boolean(item.image) ? (
                          <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-slate-900 group aspect-[4/3] w-full bg-slate-100">
                            <Image
                              src={formatImageUrl(item.image)}
                              alt={item.title || "Hình ảnh câu chuyện Phụ Tùng Q.BA"}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>

                            {idx === 0 && (
                              <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center shrink-0">
                                  <MapPin size={18} />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-[#111317] text-xs uppercase truncate">CỬA HÀNG PHỤ TÙNG Q.BA</h4>
                                  <p className="text-[11px] text-gray-600 truncate">43-45 Nguyễn Văn Tạo, Đà Nẵng</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="aspect-[4/3] w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                            <Package className="w-10 h-10 mb-2 opacity-40" />
                            <span className="text-xs font-bold uppercase">Cửa hàng Phụ Tùng Q.BA</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Real Warehouse Bento Grid Gallery */}
      {warehouseImages.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-extrabold uppercase tracking-widest">
                <Package className="w-4 h-4" />
                {galleryBadge}
              </div>
              <h2 className="text-3xl sm:text-5xl font-black font-heading text-[#111317] uppercase tracking-wider">
                {galleryTitle}
              </h2>
              <p className="text-gray-600 text-base md:text-lg">
                {galleryDesc}
              </p>
            </div>

            {/* Gallery Grid - Dynamic Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {warehouseImages.map((img: any, idx: number) => (
                <div
                  key={img.id || `wh-img-${idx}`}
                  className="group relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  <Image
                    src={formatImageUrl(img.src)}
                    alt={img.alt || img.title || "Hình ảnh kho hàng Q.BA"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="inline-block px-2.5 py-0.5 rounded bg-brand text-[10px] font-black uppercase tracking-wider mb-2">
                      KHO HÀNG Q.BA
                    </span>
                    <h3 className="font-extrabold text-lg sm:text-xl font-heading mb-1 line-clamp-1">
                      {img.title}
                    </h3>
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed font-medium">
                      {img.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Call To Action (CTA) */}
      <section className="py-16 bg-[#111317] text-white relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading uppercase tracking-wide leading-tight">
            CẦN TƯ VẤN BÁO GIÁ <span className="text-brand">MÃ PHỤ TÙNG?</span>
          </h2>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
            Liên hệ ngay với đội ngũ kỹ thuật 25 năm kinh nghiệm của Phụ Tùng Q.BA để nhận báo giá ưu đãi nhất!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <a
              href="tel:0903588167"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-brand text-white font-black py-4 px-8 rounded-full text-base uppercase tracking-wider hover:bg-white hover:text-brand hover:scale-105 transition-all duration-300 shadow-[0_0_25px_rgba(217,4,41,0.4)]"
            >
              <Phone size={20} />
              GỌI HOTLINE: 0903.588.167
            </a>

            <a
              href="https://zalo.me/0903588167"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-blue-600 text-white font-black py-4 px-8 rounded-full text-base uppercase tracking-wider hover:bg-white hover:text-blue-600 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              TƯ VẤN QUA ZALO OA
              <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
