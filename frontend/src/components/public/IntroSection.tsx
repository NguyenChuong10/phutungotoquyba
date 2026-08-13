import React from "react";
import Link from "next/link";

export default function IntroSection() {
  return (
    <section id="about" className="py-20 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-brand rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Column: Intro Text (Hình 1) */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-extrabold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
              Giới thiệu Phụ Tùng Q.BA
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading text-[#111317] uppercase leading-tight tracking-wide">
              KHÔNG NGỪNG CHUYỂN ĐỘNG <br />
              <span className="text-brand">ĐÁP ỨNG NHU CẦU KHÁCH HÀNG</span>
            </h2>

            <p className="text-gray-700 leading-relaxed text-base md:text-lg text-justify">
              Ngành công nghiệp ô tô đóng vai trò huyết mạch trong sự vươn mình của nền kinh tế hiện đại. Tại <strong className="text-brand font-black">Q.BA</strong>, với 25 năm kinh nghiệm làm việc với các chủng loại phụ tùng xe vận tải Trung Quốc, <strong className="text-brand font-black">Q.BA</strong> tự tin phục vụ các cá nhân, tổ chức trong lĩnh vực vận tải bằng <strong className="text-brand font-black">sự uy tín</strong>.
            </p>
          </div>

          {/* Right Column: Thế Mạnh Tiên Phong (Hình 2) */}
          <div className="space-y-6 bg-slate-50 p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-[#111317] font-heading uppercase leading-tight">
                THẾ MẠNH
              </h2>
              <h2 className="text-3xl md:text-4xl font-black text-brand font-heading uppercase leading-tight drop-shadow-[0_0_15px_rgba(217,4,41,0.2)]">
                TIÊN PHONG
              </h2>
            </div>

            {/* 3 Core Points with Red Checkmarks */}
            <ul className="space-y-5 pt-2">
              <li className="flex items-center gap-4">
                <div className="bg-red-100/80 text-brand p-2.5 rounded-full shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-slate-900 font-bold text-lg tracking-wide">Tư vấn kỹ thuật chính xác</span>
              </li>

              <li className="flex items-center gap-4">
                <div className="bg-red-100/80 text-brand p-2.5 rounded-full shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-slate-900 font-bold text-lg tracking-wide">Danh mục sản phẩm đa dạng</span>
              </li>

              <li className="flex items-center gap-4">
                <div className="bg-red-100/80 text-brand p-2.5 rounded-full shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-slate-900 font-bold text-lg tracking-wide">Chất lượng sản phẩm trên giá thành</span>
              </li>
            </ul>

            <div className="pt-4">
              <Link 
                href="/about" 
                className="inline-flex items-center gap-2 bg-[#111317] hover:bg-brand text-white font-black px-8 py-3.5 rounded-full uppercase text-xs tracking-wider transition-all duration-300 shadow-lg hover:scale-105"
              >
                TÌM HIỂU THÊM VỀ Q.BA →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
