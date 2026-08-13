import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ShieldCheck, Truck, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import { productsData } from "@/data/productsData";
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
          categorySlug: p.category?.parent?.slug || p.category?.slug || "dong-co-may-phat",
          categoryName: p.category?.parent?.name || p.category?.name || "Động Cơ & Máy Phát",
          brand: p.brand?.name || "HOWO Sinotruk",
          qualityStandard: p.qualityStandard || "Loai 1 Cao Cap",
          price: p.price && Number(p.price) > 0 ? `${Number(p.price).toLocaleString()} ₫` : "Liên hệ Báo Giá",
          inStock: p.inStock,
          imageSrc: formatImageUrl(p.images?.[0]?.imageUrl),
          gallery: p.images?.map((img: { imageUrl: string }) => formatImageUrl(img.imageUrl)) || [formatImageUrl(null)],
          description: p.description || "Phụ tùng chính hãng kho Q.BA Đà Nẵng",
          specifications: (p.specifications as Record<string, string>) || {
            "Mã phụ tùng (Part No.)": p.partNumber,
            "Thương hiệu": p.brand?.name || "HOWO Sinotruk",
            "Xuất xứ": "Chính hãng nhà máy",
          },
          compatibility: (p.compatibility as string[]) || ["Xe Tải Nặng HOWO", "Shacman", "FAW"],
        };
      }
    }
  } catch {
    // API server offline fallback
  }

  // Fallback to static mock data
  return productsData.find((p) => p.id === id) || null;
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
  return productsData.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductDetail(id);
  if (!product) return { title: "Không Tìm Thấy Phụ Tùng - Q.BA" };

  return {
    title: `${product.name} (Part No: ${product.partNumber}) - Phụ Tùng Ô Tô Q.BA`,
    description: `Báo giá ${product.name} chính hãng Mã Part No: ${product.partNumber}. Cam kết ${product.qualityStandard} sẵn kho Q.BA Đà Nẵng. Hotline 0903.588.167.`,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductDetail(id);

  if (!product) {
    notFound();
  }

  // Fetch all products to get related items dynamically
  let allProducts = productsData;
  try {
    const res = await fetch(`${API_BASE_URL}/products?limit=100`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        allProducts = json.data.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          partNumber: p.partNumber || `PN-${p.id}`,
          categorySlug: p.category?.parent?.slug || p.category?.slug || "dong-co-may-phat",
          imageSrc: p.images?.[0]?.imageUrl || "/images/vehicle-category/dongco.png",
        }));
      }
    }
  } catch {
    // Fallback
  }

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

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
            
            {/* Left Column: Interactive Image Gallery (Col 6) */}
            <div className="lg:col-span-6 space-y-6">
              <ProductImageGallery
                productName={product.name}
                qualityStandard={product.qualityStandard}
                brandName={product.brand}
                images={product.gallery && product.gallery.length > 0 ? product.gallery : [product.imageSrc]}
              />

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

              {/* Product Identifiers & Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs shadow-sm">
                  Part No: {product.partNumber}
                </span>
              </div>

              {/* Compatibility Vehicle Tags */}
              {product.compatibility && product.compatibility.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-gray-500 tracking-wider block">
                    Dòng Xe Vận Tải Tương Thích:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.compatibility.map((comp: string, idx: number) => (
                      <span 
                        key={`compat-${idx}`}
                        className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs"
                      >
                        ✓ {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
              <ProductDetailActions product={product as any} />

            </div>

          </div>

          {/* 3. Specifications Table Section */}
          {(() => {
            const rawSpecs = (product.specifications && typeof product.specifications === 'object') ? product.specifications : {};
            const cleanSpecs: Record<string, string> = {
              'Mã phụ tùng (Part No.)': product.partNumber || rawSpecs['Mã Phụ Tùng (Part No.)'] || rawSpecs['Mã phụ tùng (Part No.)'] || 'Đang cập nhật',
              'Chất liệu': rawSpecs['Chất liệu'] || rawSpecs['Chất liệu đúc/sản xuất'] || 'Thép đúc hợp kim cao cấp',
            };
            const specEntries = Object.entries(cleanSpecs);

            return (
              <div className="space-y-6 pt-8 border-t border-slate-200">
                <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 uppercase flex items-center gap-2">
                  <FileText className="text-brand" />
                  THÔNG SỐ KỸ THUẬT CHI TIẾT
                </h3>

                <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <tbody>
                      {specEntries.map(([key, val], idx) => (
                        <tr 
                          key={`spec-${idx}`}
                          className={idx % 2 === 0 ? "bg-slate-50" : "bg-white"}
                        >
                          <td className="py-4 px-6 font-bold text-slate-900 w-1/3 border-b border-slate-200/80">
                            {key}
                          </td>
                          <td className="py-4 px-6 text-gray-700 border-b border-slate-200/80 font-medium">
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

          {/* 4. Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="space-y-8 pt-8 border-t border-slate-200">
              <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 uppercase">
                PHỤ TÙNG CÙNG <span className="text-brand">DANH MỤC</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedProducts.map((rel: any) => (
                  <div 
                    key={`rel-prod-${rel.id}`}
                    className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-brand/40 shadow-lg transition-all group"
                  >
                    <div className="relative h-40 bg-slate-200 rounded-2xl overflow-hidden mb-4">
                      <Image src={rel.imageSrc} alt={rel.name} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized sizes="100vw" />
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
