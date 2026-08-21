"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { AdminApiService } from "@/services/adminApiService";
import { formatImageUrl } from "@/utils/imageHelper";

interface VehicleCategoryItem {
  id: string | number;
  src: string;
  alt: string;
  desc: string;
  slug?: string;
}

const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  'dong-co-may-phat': '/images/vehicle-category/dongco.png',
  'ben-thuy-luc': '/images/vehicle-category/ben.png',
  'cabin-than-vo': '/images/vehicle-category/cabin.png',
  'gam-cau-phanh': '/images/vehicle-category/gam.png',
  'hop-so-bo-dong-toc': '/images/vehicle-category/hopso.png',
  'linh-kien-ro-mooc': '/images/vehicle-category/romooc.png',
  'gioang-seal-phot': '/images/vehicle-category/sealphot.png',
  'vong-bi-bac-dan': '/images/vehicle-category/vongbi.png',
};

const FALLBACK_BANNERS: VehicleCategoryItem[] = [
  { id: 1, src: '/images/vehicle-category/dongco.png', alt: 'ĐỘNG CƠ & MÁY PHÁT', desc: 'Chủng loại phụ tùng động cơ Weichai, Yuchai, Cummins chính hãng xe tải nặng Q.BA Đà Nẵng.', slug: '/products' },
  { id: 2, src: '/images/vehicle-category/gam.png', alt: 'GẦM & SEAL PHỐT', desc: 'Phụ tùng cầu xe, gầm phanh, gioăng phớt chịu nhiệt xe tải nặng.', slug: '/products' },
  { id: 3, src: '/images/vehicle-category/romooc.png', alt: 'LINH KIỆN RƠ-MOÓC', desc: 'Cụm chân chống Fuwa, mâm moóc 50/90, bát nhíp, đinh kéo moóc.', slug: '/products' },
  { id: 4, src: '/images/vehicle-category/hopso.png', alt: 'HỘP SỐ & BỘ ĐỒNG TỐC', desc: 'Hộp số Fast Gear, bánh răng đồng tốc 9JS, 10JSD, 12JSD.', slug: '/products' },
  { id: 5, src: '/images/vehicle-category/cabin.png', alt: 'CABIN & THÂN VỎ', desc: 'Phụ tùng thân vỏ, mặt ca lăng, kính chắn gió, đèn pha xe HOWO, Shacman.', slug: '/products' },
  { id: 6, src: '/images/vehicle-category/ben.png', alt: 'BEN THỦY LỰC', desc: 'Tháp nâng ben Hyva, bơm thủy lực, van nâng hạ thùng xe ben.', slug: '/products' },
  { id: 7, src: '/images/vehicle-category/vongbi.png', alt: 'VÒNG BI BẠC ĐẠN', desc: 'Vòng bi moay ơ, bạc đạn tỳ, bạc đạn kim hộp số chịu tải nặng.', slug: '/products' },
];

export default function VehicleCategory() {
  const [categoriesList, setCategoriesList] = useState<VehicleCategoryItem[]>(FALLBACK_BANNERS);
  const [selectedProduct, setSelectedProduct] = useState<VehicleCategoryItem | null>(null);
  const [isModalImageLoading, setIsModalImageLoading] = useState(true);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string | number, boolean>>({});

  useEffect(() => {
    async function loadCategories() {
      try {
        const bannersRes = await AdminApiService.getCategoryBannersPublic();
        if (bannersRes && (bannersRes.ok || bannersRes.success) && Array.isArray(bannersRes.data) && bannersRes.data.length > 0) {
          const items: VehicleCategoryItem[] = bannersRes.data.map((b: any) => ({
            id: b.id,
            src: formatImageUrl(b.imageUrl) || '/images/vehicle-category/dongco.png',
            alt: b.title,
            desc: b.description || `Danh mục phụ tùng ${b.title} chính hãng xe tải nặng Q.BA Đà Nẵng.`,
            slug: b.linkUrl || '/products',
          }));
          setCategoriesList(items);
          return;
        }

        const tree = await AdminApiService.getCategoriesTree();
        if (tree && tree.length > 0) {
          const items: VehicleCategoryItem[] = tree.map((cat: any) => {
            const dbIcon = cat.iconUrl || cat.imageUrl;
            return {
              id: cat.id || cat.slug,
              src: formatImageUrl(dbIcon) || DEFAULT_CATEGORY_ICONS[cat.slug] || '/images/vehicle-category/dongco.png',
              alt: cat.name,
              desc: cat.description || `Danh mục phụ tùng ${cat.name} chính hãng xe tải nặng Q.BA Đà Nẵng.`,
              slug: cat.slug,
            };
          });
          setCategoriesList(items);
        }
      } catch (err) {
        console.error("Failed to load vehicle categories:", err);
      }
    }
    loadCategories();
  }, []);

  const handleImageError = (id: string | number) => {
    setImageErrorMap((prev) => ({ ...prev, [id]: true }));
  };

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

  if (categoriesList.length === 0) {
    return null;
  }

  return (
    <section id="products" className="bg-[#111317] py-20 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/vehicle-category/baxe.png"
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
                {categoriesList.map((product) => (
                  <div 
                    key={`${setIndex}-${product.id}`} 
                    onClick={() => {
                      setIsModalImageLoading(true);
                      setSelectedProduct(product);
                    }}
                    className="group cursor-pointer w-[280px] h-[420px] rounded-xl shadow-2xl shrink-0 overflow-hidden border-2 border-brand hover:scale-105 transition-transform motion-reduce:transition-none bg-gray-900 relative"
                  >

                    <Image
                      src={imageErrorMap[product.id] ? (DEFAULT_CATEGORY_ICONS[product.slug || ''] || '/images/vehicle-category/dongco.png') : product.src}
                      alt={product.alt}
                      fill
                      sizes="280px"
                      className="object-cover"
                      onError={() => handleImageError(product.id)}
                    />
                    {/* Overlay Text */}
                    <div className="absolute top-0 left-0 w-full pt-6 pb-12 px-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-0 z-10">
                      <h3 className="text-[#EF233C] text-lg md:text-xl font-bold font-heading uppercase text-center tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {product.alt}
                      </h3>
                    </div>

                    {/* Hover Overlay Hint */}
                    <div className="absolute inset-0 bg-brand/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 z-10">
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

        <Link href="/products" className="bg-brand text-white uppercase font-bold tracking-wider py-4 px-10 rounded-full shadow-[0_0_20px_rgba(217,4,41,0.4)] hover:bg-white hover:text-brand hover:scale-105 transition-all duration-300 motion-reduce:transition-none cursor-pointer">
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
            
            {/* Image Side with Loading Spinner */}
            <div className="w-full md:w-5/12 h-[300px] md:h-auto relative bg-gray-950 overflow-hidden group flex items-center justify-center min-h-[250px]">
              {isModalImageLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 z-20 gap-3">
                  <div className="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Đang tải ảnh...</span>
                </div>
              )}
              <Image 
                src={selectedProduct.src} 
                alt={selectedProduct.alt} 
                fill 
                onLoad={() => setIsModalImageLoading(false)}
                className={`object-cover transition-all duration-700 ${isModalImageLoading ? 'opacity-0 scale-95' : 'opacity-70 group-hover:scale-110'}`} 
                sizes="(max-width: 768px) 100vw, 40vw" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111317] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#111317] z-10 pointer-events-none"></div>
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
                  href="/products" 
                  onClick={() => setSelectedProduct(null)}
                  className="inline-flex items-center justify-center w-full sm:w-auto bg-gradient-to-r from-brand to-orange-600 text-white font-bold py-4 px-10 rounded-full hover:shadow-[0_10px_25px_rgba(217,4,41,0.4)] transition-all duration-300 group cursor-pointer"
                >
                  LIÊN HỆ BÁO GIÁ CÁC MÃ SẢN PHẨM 
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
