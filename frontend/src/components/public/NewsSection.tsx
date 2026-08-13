import React from "react";
import Image from "next/image";
import Link from "next/link";

const cards = [
  {
    id: "news-1",
    title: "THÔNG TIN DOANH NGHIỆP",
    desc: "Các bài viết giới thiệu về hoạt động, sự kiện, thông báo của công ty Q.BA.",
    imgUrl: "/images/news-section/quyba.png",
    linkUrl: "/news/gioi-thieu-lich-su-25-nam-phat-trien-nang-luc-cung-cap-phu-tung-xe-tai-qba-da-nang-5511"
  },
  {
    id: "news-2",
    title: "THÔNG TIN SẢN PHẨM",
    desc: "Các danh mục phụ tùng tại Q.BA.",
    imgUrl: "/images/news-section/sanpham.png",
    linkUrl: "/news/tong-quan-he-thong-phu-tung-xe-tai-nang-trung-quoc-san-kho-da-nang-howo-weichai-fast-gear-8447"
  },
  {
    id: "news-3",
    title: "CẨM NANG KỸ THUẬT",
    desc: "Cẩm nang kỹ thuật, bảo dưỡng, lái xe.",
    imgUrl: "/images/news-section/sanpham.png",
    linkUrl: "/news/cam-nang-ky-thuat-bao-duong-dong-co-weichai-wp12-quy-trinh-kiem-tra-dinh-ky-50000km-7840"
  }
];

export default function NewsSection() {
  return (
    <section id="news" className="py-20 relative bg-white overflow-hidden">
      {/* Blueprint Grid Overlay for Industrial Feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {cards.map((card) => (
            <Link key={card.id} href={card.linkUrl} className="flex flex-col h-full bg-white group cursor-pointer border border-[#111317]/10 hover:border-brand/30 transition-colors duration-300 shadow-xl hover:shadow-2xl">
              {/* Image */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#111317]">
                <Image
                  src={card.imgUrl}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Text */}
              <div className="p-6 flex flex-col flex-1 border-t-4 border-brand">
                <h3 className="text-xl font-black font-heading text-[#111317] mb-3 line-clamp-2 uppercase group-hover:text-brand transition-colors">
                  {card.title}
                </h3>
                <p className="text-[#111317]/70 text-sm leading-relaxed mb-6 flex-1 text-justify">
                  {card.desc}
                </p>
                
                {/* Arrow Button */}
                <div className="inline-flex self-start items-center font-bold text-sm uppercase tracking-widest text-brand group-hover:text-[#111317] transition-colors">
                  Đọc tiếp
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
