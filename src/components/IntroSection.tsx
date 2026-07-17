import React from "react";
import Image from "next/image";

const services = [
  {
    id: "pioneer-1",
    title: "MUA BÁN VÀ PHÂN PHỐI",
    desc: "Cung cấp phụ tùng ô tô chính hãng, chất lượng cao, đáp ứng mọi nhu cầu của thị trường với độ bền vượt trội.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    ),
    bg: "/images/PioneerSection/hopsoxetai.png"
  },
  {
    id: "pioneer-2",
    title: "THƯƠNG MẠI DỊCH VỤ",
    desc: "Xây dựng chuỗi bán lẻ phụ tùng, đa dạng và chăm sóc xe hơi toàn diện, phù hợp cho người sử dụng.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
        <path d="M12 13V7"></path>
        <path d="M16 13V7"></path>
      </svg>
    ),
    bg: "/images/PioneerSection/bomcaoap.png"
  }
];

export default function IntroSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative background elements (Moved to top of unified section) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-brand rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">

          {/* Left Text */}
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-4xl font-black font-heading text-[#111317] uppercase leading-tight">
              KHÔNG NGỪNG CHUYỂN ĐỘNG <br />
              <span className="text-brand">ĐÁP ỨNG NHU CẦU KHÁCH HÀNG</span>
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Ngành công nghiệp ô tô đóng vai trò huyết mạch trong sự vươn mình của nền kinh tế hiện đại. Tại <strong className="text-brand font-black">Q.BA</strong>, với 25 năm kinh nghiệm làm việc với các chủng loại phụ tùng xe vận tải Trung Quốc <strong className="text-brand font-black">Q.BA</strong> tự tin phục vụ các cá nhân, tổ chức trong lĩnh vực vận tải bằng chất lượng, <strong className="text-brand font-black">Q.BA</strong> vô cùng tự hào khi được cống hiến những giá trị cốt lõi, tiếp sức cho sự phát triển mạnh mẽ cho sự nghiệp của bạn.
            </p>
            </div>

            {/* Right Image */}
            <div className="flex-1 flex justify-center relative mt-10 md:mt-0">
              {/* Spinning Gear Background Element */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] z-0 opacity-10 animate-spin-slow motion-reduce:animate-none pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#111317]">
                  <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.309A7.013 7.013 0 007.62 6.34l-1.423-.474a1.875 1.875 0 00-2.36 1.155l-1.5 4.501a1.875 1.875 0 001.155 2.36l1.423.474a7.013 7.013 0 00-.51 1.43l-1.423-.474a1.875 1.875 0 00-2.36 1.155l-1.5 4.501a1.875 1.875 0 001.155 2.36l1.423.474a7.013 7.013 0 00.51 1.43l-1.423-.474a1.875 1.875 0 002.36 1.155l1.5-4.501a1.875 1.875 0 00-1.155-2.36l-1.423-.474a7.013 7.013 0 00.51-1.43l1.423.474a1.875 1.875 0 002.36-1.155l1.5-4.501a1.875 1.875 0 00-1.155-2.36l-1.423-.474a7.013 7.013 0 00-.51-1.43l1.423.474zM12 15a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>

              <div className="relative w-72 h-72 md:w-96 md:h-96">
                {/* Main Product Circular Image Slider */}
                <div className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(17,19,23,0.15)] z-10 bg-white">
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="flex w-[300%] h-full animate-slide">
                      <div className="relative w-1/3 h-full">
                        <Image src="/images/introsection/intro-slide-1.png" alt="Hệ thống phụ tùng ô tô" fill className="object-cover scale-[1.02]" sizes="(max-width: 768px) 100vw, 33vw" />
                      </div>
                      <div className="relative w-1/3 h-full">
                        <Image src="/images/introsection/intro-slide-2.png" alt="Sản xuất phụ tùng" fill className="object-cover scale-[1.02]" sizes="(max-width: 768px) 100vw, 33vw" />
                      </div>
                      <div className="relative w-1/3 h-full">
                        <Image src="/images/introsection/intro-slide-3.png" alt="Cơ khí chính xác" fill className="object-cover scale-[1.02]" sizes="(max-width: 768px) 100vw, 33vw" />
                      </div>
                    </div>
                  </div>
                  {/* Overlay Border to perfectly hide anti-aliasing artifacts */}
                  <div className="absolute inset-0 rounded-full border-[12px] border-white z-10 pointer-events-none"></div>
                </div>

                {/* Decorative smaller overlapping circle */}
                <div className="absolute -bottom-4 -left-8 w-32 h-32 md:w-40 md:h-40 rounded-full border-8 border-white shadow-xl overflow-hidden z-10 animate-pulse relative">
                  <Image src="/images/introsection/intro-slide-1.png" alt="Chi tiết linh kiện" fill className="object-cover" sizes="160px" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Separator / Spacer to let the circle overlap elegantly */}
        <div className="h-16 md:h-24"></div>

        {/* Bottom Part (Pioneer Section) */}
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">

            {/* Title Area */}
            <div className="w-full lg:w-5/12">

              <h2 className="text-4xl md:text-5xl font-black text-[#111317] font-heading uppercase leading-tight mb-2">
                THẾ MẠNH
              </h2>
              <h2 className="text-4xl md:text-5xl font-black text-brand font-heading uppercase leading-tight mb-8 drop-shadow-[0_0_15px_rgba(217,4,41,0.2)]">
                TIÊN PHONG
              </h2>


              {/* 3 Core Points Added Here */}
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3">
                  <div className="bg-brand/10 p-2 rounded-full text-brand">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-800 font-bold text-lg tracking-wide">Tư vấn kỹ thuật chính xác</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-brand/10 p-2 rounded-full text-brand">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-800 font-bold text-lg tracking-wide">Danh mục sản phẩm đa dạng</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-brand/10 p-2 rounded-full text-brand">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-800 font-bold text-lg tracking-wide">Chất lượng sản phẩm trên giá thành</span>
                </li>
              </ul>
            </div>

            {/* Cards Area */}
            <div className="w-full lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className={`group relative h-[400px] rounded-none overflow-hidden cursor-pointer shadow-2xl transition-all duration-500 border border-white/5 hover:border-brand/50 ${index === 1 ? 'sm:mt-16' : ''}`}
                >
                  {/* Background Image with Hover Zoom */}
                  <Image
                    src={service.bg}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover opacity-70 mix-blend-luminosity transition-all duration-700 group-hover:scale-110 group-hover:mix-blend-normal group-hover:opacity-100"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111317] via-[#111317]/80 to-transparent transition-colors duration-500 group-hover:from-[#111317] group-hover:via-[#111317]/50"></div>

                  {/* Content */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end border-b-4 border-transparent group-hover:border-brand transition-colors">
                    {/* Glowing Icon */}
                    <div className="w-16 h-16 rounded-sm bg-[#111317]/50 backdrop-blur-md border border-brand/30 flex items-center justify-center text-brand mb-6 transform group-hover:-translate-y-2 transition-all duration-300 shadow-[0_0_15px_rgba(217,4,41,0.2)] group-hover:bg-brand group-hover:text-white group-hover:shadow-[0_0_25px_rgba(217,4,41,0.6)]">
                      {service.icon}
                    </div>

                    <h3 className="text-2xl font-black font-heading text-white uppercase mb-3 transform group-hover:-translate-y-2 transition-all duration-300">
                      {service.title}
                    </h3>

                    <p className="text-gray-300 line-clamp-3 text-sm leading-relaxed transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                      {service.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
  );
}
