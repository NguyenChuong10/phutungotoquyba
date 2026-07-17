"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

const products = [
  { id: 'p1', src: '/images/vehiclecategory/dongco.png', alt: 'Động Cơ', desc: 'Hệ thống động cơ diesel mạnh mẽ, bền bỉ, tiết kiệm nhiên liệu, phù hợp cho các dòng xe tải nặng và máy công trình. Đảm bảo sức kéo vượt trội trên mọi địa hình.' },
  { id: 'p2', src: '/images/vehiclecategory/ben.png', alt: 'Ben', desc: 'Hệ thống thủy lực ben chịu tải siêu trường siêu trọng, hoạt động mượt mà và cực kỳ ổn định trong điều kiện làm việc khắc nghiệt tại các mỏ đá, công trường.' },
  { id: 'p3', src: '/images/vehiclecategory/cabin.png', alt: 'Cabin', desc: 'Các chi tiết thân vỏ và nội thất cabin chất lượng cao (ghế hơi, mặt ga lăng, đèn pha), đảm bảo an toàn và sự thoải mái tối đa cho người lái trong các chuyến đi dài.' },
  { id: 'p4', src: '/images/vehiclecategory/gam.png', alt: 'Gầm', desc: 'Hệ thống khung gầm đúc chắc chắn, nhíp và giảm xóc chịu lực cực tốt, rô tuyn tay lái chuẩn xác, giúp xe vận hành đầm chắc trên mọi cung đường phức tạp.' },
  { id: 'p5', src: '/images/vehiclecategory/hopso.png', alt: 'Hộp Số', desc: 'Hộp số đa cấp truyền động mượt mà, bộ đồng tốc cao cấp giúp sang số nhẹ nhàng, tối ưu hóa toàn bộ công suất từ động cơ truyền đến các trục bánh xe.' },
  { id: 'p6', src: '/images/vehiclecategory/romooc.png', alt: 'RƠ-MOOC', desc: 'Linh kiện rơ-mooc chuyên dụng: chân chống, mâm phanh, trục cầu, búp sen phanh, móc kéo... Đạt tiêu chuẩn an toàn cao nhất và chịu tải trọng siêu cường.' },
  { id: 'p7', src: '/images/vehiclecategory/sealphot.png', alt: 'Seal Phốt', desc: 'Bộ phớt làm kín (sin, phớt git, phớt trục khuỷu) từ vật liệu cao cấp chịu nhiệt độ cao, chịu hóa chất và dầu nhớt cực tốt, ngăn chặn rò rỉ triệt để.' },
  { id: 'p8', src: '/images/vehiclecategory/vongbi.png', alt: 'Vòng Bi', desc: 'Các loại vòng bi, bạc đạn công nghiệp (bi moay ơ, bi hộp số, bi chữ thập) có độ chính xác tuyệt đối, giảm ma sát tối đa và tăng cường tuổi thọ chi tiết máy.' }
];

export default function VehicleCategory() {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);

  // Khóa scroll body khi mở Modal
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProduct]);

  return (
    <section className="bg-[#111317] py-20 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/vehiclecategory/baxe.png"
          alt="Q.BA Vehicles Background"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="container mx-auto px-4 flex flex-col items-center relative z-10">
        
        {/* Section Title */}
        <h2 className="text-3xl md:text-5xl font-heading font-black text-white uppercase tracking-wider mb-12 text-center drop-shadow-lg">
          Danh mục <span className="text-brand">Phụ tùng</span>
        </h2>
        
        {/* Floating Products Marquee Slider */}
        <div className="w-full max-w-5xl overflow-hidden mb-12 relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee motion-reduce:animate-none hover:[animation-play-state:paused]">
            {Array.from({ length: 2 }).map((_, setIndex) => (
              <div key={`set-${setIndex}`} className="flex gap-12 px-6">
                {products.map((product) => (
                  <div 
                    key={`${setIndex}-${product.id}`} 
                    onClick={() => setSelectedProduct(product)}
                    className="group cursor-pointer w-[280px] h-[420px] rounded-xl shadow-2xl shrink-0 overflow-hidden border-2 border-brand hover:scale-105 transition-transform motion-reduce:transition-none bg-gray-900 relative"
                  >
                    <Image src={product.src} alt={product.alt} fill className="object-cover" sizes="280px" />
                    {/* Overlay Text */}
                    <div className="absolute top-0 left-0 w-full pt-6 pb-12 px-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
                      <h3 className="text-[#EF233C] text-lg md:text-xl font-bold font-heading uppercase text-center tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {product.alt}
                      </h3>
                    </div>

                    {/* Hover Overlay Hint */}
                    <div className="absolute inset-0 bg-brand/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <span className="text-white font-bold uppercase tracking-widest border-2 border-white px-6 py-2 rounded-full">
                        Xem chi tiết
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <Link href="/featured-products" className="bg-brand text-white uppercase font-bold tracking-wider py-4 px-10 rounded-full shadow-[0_0_20px_rgba(217,4,41,0.4)] hover:bg-white hover:text-brand hover:scale-105 transition-all duration-300 motion-reduce:transition-none cursor-pointer">
          Khám phá thêm
        </Link>
      </div>

      {/* Modal / Overlay Giới thiệu */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setSelectedProduct(null)}
          ></div>
          
          {/* Modal Box */}
          <div className="relative bg-[#111317] border border-brand/30 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-[0_0_50px_rgba(217,4,41,0.25)] flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 p-2.5 bg-black/50 hover:bg-brand text-white rounded-full transition-all duration-300 hover:rotate-90 shadow-lg"
            >
              <X size={24} />
            </button>
            
            {/* Image Side */}
            <div className="w-full md:w-5/12 h-[300px] md:h-auto relative bg-black overflow-hidden group">
              <Image 
                src={selectedProduct.src} 
                alt={selectedProduct.alt} 
                fill 
                className="object-cover opacity-70 group-hover:scale-110 transition-transform duration-700" 
                sizes="(max-width: 768px) 100vw, 40vw" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111317] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#111317]"></div>
            </div>
            
            {/* Content Side */}
            <div className="w-full md:w-7/12 p-8 md:p-14 flex flex-col justify-center relative z-10">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold tracking-widest uppercase mb-6 w-max shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
                Giới thiệu danh mục
              </div>
              
              <h3 className="text-4xl md:text-5xl font-black font-heading text-white uppercase mb-8 tracking-wide drop-shadow-sm border-l-4 border-brand pl-6 leading-tight">
                Phụ tùng <br/><span className="text-brand">{selectedProduct.alt}</span>
              </h3>
              
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-12 text-justify">
                {selectedProduct.desc}
              </p>
              
              <div className="mt-auto">
                <Link 
                  href="/featured-products" 
                  onClick={() => setSelectedProduct(null)}
                  className="inline-flex items-center justify-center w-full sm:w-auto bg-gradient-to-r from-brand to-orange-600 text-white font-bold py-4 px-10 rounded-full hover:shadow-[0_10px_25px_rgba(217,4,41,0.4)] transition-all duration-300 group"
                >
                  XEM CHI TIẾT CÁC MÃ SẢN PHẨM 
                  <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
                </Link>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
