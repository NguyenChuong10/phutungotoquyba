export const dynamic = 'force-dynamic';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  FileText,
  Tag,
  Headphones,
  ArrowRight,
  Layers,
} from "lucide-react";
import ProductDetailActions from "@/components/public/ProductDetailActions";
import ProductImageGallery from "@/components/public/ProductImageGallery";
import { API_BASE_URL } from "@/config/api";
import { formatImageUrl } from "@/utils/imageHelper";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProductDetail(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const p = json.data;
        return {
          id: String(p.id),
          name: p.name,
          partNumber: p.partNumber || `PN-${p.id}`,
          internalCode: p.internalCode || `QB-INT-${p.id}`,
          categorySlug: p.category?.parent?.slug || p.category?.slug || "dong-co-may-phat",
          categoryName: p.category?.parent?.name || p.category?.name || "Động Cơ & Máy Phát",
          brand: p.brand?.name || "HOWO Sinotruk",
          qualityStandard: p.qualityStandard || "",
          price: p.price && Number(p.price) > 0 ? `${Number(p.price).toLocaleString('vi-VN')} ₫` : "Liên hệ Báo Giá",
          inStock: p.inStock,
          imageSrc: formatImageUrl(p.images?.[0]?.imageUrl),
          gallery: p.images?.map((img: { imageUrl: string }) => formatImageUrl(img.imageUrl)) || [formatImageUrl(null)],
          description: p.description || "Phụ tùng chính hãng kho Q.BA Đà Nẵng, nhập khẩu trực tiếp từ nhà máy sản xuất.",
          specifications: (p.specifications as Record<string, string>) || {
            "Mã phụ tùng (Part No.)": p.partNumber,
            "Thương hiệu": p.brand?.name || "HOWO Sinotruk",
          },
          compatibility: (p.compatibility as string[]) || ["Xe Tải Nặng HOWO", "Shacman", "FAW"],
        };
      }
    }
  } catch (err) {
    console.error("Failed to fetch product detail:", err);
  }

  return null;
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE_URL}/products?limit=100`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        return json.data.map((p: { id: number }) => ({ id: String(p.id) }));
      }
    }
  } catch {
    // Fallback
  }
  return [];
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductDetail(id);
  if (!product) return { title: "Không Tìm Thấy Phụ Tùng - Q.BA" };

  return {
    title: `${product.name} (Part No: ${product.partNumber}) - Phụ Tùng Ô Tô Q.BA`,
    description: `Báo giá ${product.name} chính hãng Mã Part No: ${product.partNumber}. Cam kết ${product.qualityStandard || 'chất lượng cao'} sẵn kho Q.BA Đà Nẵng. Hotline 0903.588.167.`,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductDetail(id);

  if (!product) {
    notFound();
  }

  // Fetch all products to get related items dynamically
  let allProducts: any[] = [];
  try {
    const res = await fetch(`${API_BASE_URL}/products?limit=100`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        allProducts = json.data.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          partNumber: p.partNumber || `PN-${p.id}`,
          brand: p.brand?.name || 'Đối Tác Q.BA',
          categorySlug: p.category?.parent?.slug || p.category?.slug || "dong-co-may-phat",
          imageSrc: formatImageUrl(p.images?.[0]?.imageUrl),
          price: p.price && Number(p.price) > 0 ? `${Number(p.price).toLocaleString('vi-VN')} ₫` : 'Liên Hệ Báo Giá',
        }));
      }
    }
  } catch {
    // Fallback
  }

  const sameCategoryProducts = allProducts.filter(
    (p) => p.id !== product.id && p.categorySlug === product.categorySlug
  );
  const otherProducts = allProducts.filter(
    (p) => p.id !== product.id && p.categorySlug !== product.categorySlug
  );
  const relatedProducts = [...sameCategoryProducts, ...otherProducts].slice(0, 4);

  return (
    <div className="bg-white min-h-screen pt-24 sm:pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-7xl space-y-6">
        
        {/* Breadcrumb Navigation - Docked cleanly inside main container */}
        <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 pb-2 border-b border-slate-100">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={13} className="text-slate-400" />
          <Link href="/products" className="hover:text-slate-900 transition-colors">
            Danh mục Phụ tùng
          </Link>
          <ChevronRight size={13} className="text-slate-400" />
          <Link href={`/products?categorySlug=${product.categorySlug}`} className="hover:text-slate-900 transition-colors text-slate-700">
            {product.categoryName}
          </Link>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-2">
          
          {/* Left Column: Focused Image Gallery Slider */}
          <div className="lg:col-span-6">
            <ProductImageGallery
              productName={product.name}
              qualityStandard={product.qualityStandard}
              brandName={product.brand}
              images={product.gallery && product.gallery.length > 0 ? product.gallery : [product.imageSrc]}
            />
          </div>

          {/* Right Column: Product Detail, Actions & Commitments */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Availability & Brand Tag */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {product.inStock ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Sẵn Kho Đà Nẵng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Tạm Hết Hàng • Liên Hệ Đặt Hàng
                </span>
              )}

              <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-500" />
                <span>{product.brand}</span>
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Part Number & Internal Code Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-slate-900 text-white font-mono font-extrabold text-xs">
                Part No: <span className="text-amber-400">{product.partNumber}</span>
              </span>
              <span className="px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-xs">
                Mã Nội Bộ: {product.internalCode}
              </span>
            </div>

            {/* Pricing Line */}
            <div className="py-2 border-y border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Đơn Giá Báo Sỉ:</span>
              <span className="text-xl sm:text-2xl font-black text-brand">{product.price}</span>
            </div>

            {/* Compatible Vehicle Tags */}
            {product.compatibility && product.compatibility.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-extrabold uppercase text-slate-500 block">
                  Dòng Xe Tương Thích:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.compatibility.map((comp: string, idx: number) => (
                    <span 
                      key={`compat-${idx}`}
                      className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{comp}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Short Description */}
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase text-slate-500 block">
                Mô Tả Sản Phẩm:
              </span>
              <p className="text-slate-600 text-sm leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quotation Action Buttons */}
            <ProductDetailActions product={product as any} />

            {/* Quality Commitments Bar (Right Column) */}
            <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-100">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-0.5">
                <ShieldCheck className="w-4 h-4 text-slate-700 mx-auto" />
                <h4 className="font-extrabold text-slate-900 text-[11px] uppercase">Chất Lượng</h4>
                <p className="text-[10px] text-slate-500 line-clamp-1">
                  {product.qualityStandard ? product.qualityStandard : 'Chính hãng nhà máy'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-0.5">
                <Truck className="w-4 h-4 text-slate-700 mx-auto" />
                <h4 className="font-extrabold text-slate-900 text-[11px] uppercase">Giao Hàng</h4>
                <p className="text-[10px] text-slate-500 line-clamp-1">Toàn quốc hỏa tốc</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-0.5">
                <Headphones className="w-4 h-4 text-slate-700 mx-auto" />
                <h4 className="font-extrabold text-slate-900 text-[11px] uppercase">Tư Vấn</h4>
                <p className="text-[10px] text-slate-500 line-clamp-1">Hỗ trợ Zalo</p>
              </div>
            </div>
          </div>

        </div>

        {/* Specifications Table */}
        {(() => {
          const rawSpecs = (product.specifications && typeof product.specifications === 'object') ? product.specifications : {};
          const cleanSpecs: Record<string, string> = {
            'Mã phụ tùng (Part No.)': product.partNumber || rawSpecs['Mã Phụ Tùng (Part No.)'] || rawSpecs['Mã phụ tùng (Part No.)'] || 'Đang cập nhật',
            'Thương hiệu nhà máy': product.brand,
            'Danh mục phụ tùng': product.categoryName,
          };

          const mat = rawSpecs['Chất liệu'] || rawSpecs['Chất liệu đúc/sản xuất'];
          if (mat && String(mat).trim()) {
            cleanSpecs['Chất liệu'] = String(mat).trim();
          }

          Object.entries(rawSpecs).forEach(([k, v]) => {
            if (
              v &&
              typeof v === 'string' &&
              v.trim() &&
              !cleanSpecs[k] &&
              k !== 'Mã Phụ Tùng (Part No.)' &&
              k !== 'Mã phụ tùng (Part No.)' &&
              k !== 'Chất liệu đúc/sản xuất'
            ) {
              cleanSpecs[k] = v.trim();
            }
          });

          const specEntries = Object.entries(cleanSpecs);

          return (
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-black text-slate-900 uppercase flex items-center gap-2">
                <FileText className="text-brand w-5 h-5" />
                <span>THÔNG SỐ KỸ THUẬT CHI TIẾT</span>
              </h3>

              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                <table className="w-full text-left text-xs sm:text-sm">
                  <tbody>
                    {specEntries.map(([key, val], idx) => (
                      <tr 
                        key={`spec-${idx}`}
                        className={idx % 2 === 0 ? "bg-slate-50/60" : "bg-white"}
                      >
                        <td className="py-3 px-4 font-bold text-slate-900 w-1/3 border-b border-slate-200/80 uppercase text-xs">
                          {key}
                        </td>
                        <td className="py-3 px-4 text-slate-700 border-b border-slate-200/80 font-medium">
                          {String(val)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 uppercase flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand" />
                <span>PHỤ TÙNG CÙNG DANH MỤC</span>
              </h3>
              <Link
                href={`/products?categorySlug=${product.categorySlug}`}
                className="text-xs font-bold text-slate-600 hover:text-brand transition-colors uppercase flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((rel: any) => (
                <div 
                  key={`rel-prod-${rel.id}`}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-brand/40 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square bg-slate-50 rounded-xl overflow-hidden mb-2.5 border border-slate-100 flex items-center justify-center p-2">
                      <Image
                        src={rel.imageSrc}
                        alt={rel.name}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/90 text-amber-400 font-mono font-bold text-[10px] uppercase shadow-2xs">
                        {rel.partNumber}
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block mb-0.5">
                      {rel.brand}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 group-hover:text-brand transition-colors mb-1.5 leading-snug">
                      {rel.name}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-2">
                    <span className="text-xs font-black text-brand">{rel.price}</span>
                    <Link 
                      href={`/products/${rel.id}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-brand group-hover:text-white text-slate-700 font-extrabold text-[11px] uppercase transition-all duration-300 inline-flex items-center gap-1"
                    >
                      <span>Chi tiết</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
