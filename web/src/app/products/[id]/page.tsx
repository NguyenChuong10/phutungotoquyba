import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ShieldCheck, Truck, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import { productsData } from "@/data/productsData";

import ProductDetailActions from "@/components/public/ProductDetailActions";


interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return productsData.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = productsData.find((p) => p.id === id);
  if (!product) return { title: "Không Tìm Thấy Phụ Tùng - Q.BA" };

  return {
    title: `${product.name} (Part No: ${product.partNumber}) - Phụ Tùng Ô Tô Q.BA`,
    description: `Báo giá ${product.name} chính hãng Mã Part No: ${product.partNumber}. Cam kết ${product.qualityStandard} sẵn kho Q.BA Đà Nẵng. Hotline 0903.588.167.`,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = productsData.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  // Related Products
  const relatedProducts = productsData.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id
  ).slice(0, 3);

  return (
    <div>

      {/* 1. Header Banner */}
      <section className="bg-[#111317] text-white pt-32 md:pt-36 pb-8 md:pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          {/* Breadcrumb Navigation */}
          <nav className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <Link href="/products" className="hover:text-white transition-colors">Danh mục Phụ tùng</Link>
            <ChevronRight size={14} />
            <Link href="/products" className="hover:text-white transition-colors">{product.categoryName}</Link>
            <ChevronRight size={14} />
            <span className="text-brand truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </section>


      {/* 2. Main Product Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl space-y-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Image Gallery (Col 6) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Main Image Box */}
              <div className="relative w-full h-[380px] sm:h-[480px] bg-slate-100 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-2xl group">
                <Image 
                  src={product.imageSrc}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-brand text-white text-xs font-black tracking-widest uppercase shadow-lg">
                  {product.qualityStandard}
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900/90 text-white text-xs font-bold uppercase backdrop-blur-md">
                  {product.brand}
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {product.gallery && product.gallery.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {product.gallery.map((img, idx) => (
                    <div 
                      key={`thumb-${idx}`}
                      className="relative h-24 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-md"
                    >
                      <Image 
                        src={img} 
                        alt={`${product.name} thumbnail ${idx}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Quality Commitment Badges */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase">Cam Kết Chất Lượng</h4>

                    <p className="text-[11px] text-gray-500">Hàng chuẩn loại 1 cao cấp</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <Truck className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase">Gửi Hàng Toàn Quốc</h4>
                    <p className="text-[11px] text-gray-500">Đóng gói thùng gỗ chắc chắn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Product Detail & Quotation CTA (Col 6) */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Availability Badge at top */}
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs uppercase border border-emerald-200">
                  <CheckCircle2 size={14} /> Sẵn Kho Đà Nẵng
                </span>
              </div>

              {/* Product Title */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading text-slate-900 uppercase leading-snug">
                {product.name}
              </h2>

              {/* Product Identifiers & Tags (Moved down below Title) */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs shadow-sm">
                  Part No: {product.partNumber}
                </span>
              </div>




              {/* Compatibility Vehicle Tags */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider block">
                  Dòng Xe Vận Tải Tương Thích:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.compatibility.map((comp, idx) => (
                    <span 
                      key={`compat-${idx}`}
                      className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs"
                    >
                      ✓ {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider block">
                  Mô Tả Sản Phẩm:
                </span>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed text-justify">
                  {product.description}
                </p>
              </div>

              {/* Quotation Action Buttons */}
              <ProductDetailActions product={product} />

            </div>

          </div>

          {/* 3. Specifications Table Section */}
          <div className="space-y-6 pt-8 border-t border-slate-200">
            <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 uppercase flex items-center gap-2">
              <FileText className="text-brand" />
              THÔNG SỐ KỸ THUẬT CHI TIẾT
            </h3>

            <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs sm:text-sm">
                <tbody>
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <tr 
                      key={`spec-${idx}`}
                      className={idx % 2 === 0 ? "bg-slate-50" : "bg-white"}
                    >
                      <td className="py-4 px-6 font-bold text-slate-900 w-1/3 border-b border-slate-200/80">
                        {key}
                      </td>
                      <td className="py-4 px-6 text-gray-700 border-b border-slate-200/80 font-medium">
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="space-y-8 pt-8 border-t border-slate-200">
              <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 uppercase">
                PHỤ TÙNG CÙNG <span className="text-brand">DANH MỤC</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedProducts.map((rel) => (
                  <div 
                    key={`rel-prod-${rel.id}`}
                    className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-brand/40 shadow-lg transition-all group"
                  >
                    <div className="relative h-40 bg-slate-200 rounded-2xl overflow-hidden mb-4">
                      <Image src={rel.imageSrc} alt={rel.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-[10px] font-bold font-mono text-brand uppercase block mb-1">Part: {rel.partNumber}</span>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-brand transition-colors mb-3">
                      {rel.name}
                    </h4>
                    <Link 
                      href={`/products/${rel.id}`}
                      className="text-xs font-bold text-slate-800 group-hover:text-brand uppercase inline-flex items-center gap-1"
                    >
                      Xem chi tiết →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
