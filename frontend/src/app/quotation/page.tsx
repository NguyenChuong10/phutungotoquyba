"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuotation } from "@/context/QuotationContext";
import { quotationService } from "@/services/quotationService";
import { parseNumericProductId } from "@/utils/productHelper";
import { Trash2, Plus, Minus, Send, CheckCircle2, Package, ArrowLeft, ShieldCheck, Truck, Clock } from "lucide-react";

export default function QuotationPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems } = useQuotation();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [generalNote, setGeneralNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    const itemsSummary = items
      .map((i) => `- ${i.product.name} (Part No: ${i.product.partNumber}) x${i.quantity}`)
      .join("\n");

    const payload = {
      phoneNumber,
      customerName: fullName,
      note: `Danh sách báo giá (${totalItems} mã):\n${itemsSummary}\n\nGhi chú thêm: ${generalNote}`,
      items: items.map((i) => ({
        productId: parseNumericProductId(i.product.id),
        partNumber: i.product.partNumber,
        productName: i.product.name,
        quantity: i.quantity,
      })),
    };

    const res = await quotationService.submitQuotation(payload);
    setIsSubmitting(false);
    setSubmitResult(res);

    if (res.success) {
      clearCart();
    }
  };

  return (
    <div className="bg-[#111317] min-h-screen text-white pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header & Breadcrumb */}
          <div className="mb-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-[#FF0000] text-xs font-bold uppercase tracking-wider transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Tiếp tục xem danh mục phụ tùng
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading uppercase tracking-wide drop-shadow-md">
              Danh sách <span className="text-[#FF0000]">Yêu cầu Báo giá</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Xem lại các mã phụ tùng đã chọn và gửi yêu cầu tư vấn báo giá hỏa tốc trong 5 phút từ Chuyên viên Q.BA.
            </p>
          </div>

          {items.length === 0 && !submitResult ? (
            /* Empty State */
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-[#FF0000]/10 border border-[#FF0000]/30 flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-[#FF0000]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Danh sách báo giá đang trống</h2>
              <p className="text-slate-400 text-sm mb-8">
                Bạn chưa thêm mã phụ tùng nào vào danh sách. Hãy truy cập E-Catalogue phụ tùng xe tải Q.BA để chọn các mã SKU cần báo giá.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-[#FF0000] text-white font-bold py-4 px-10 rounded-full shadow-[0_0_20px_rgba(217,4,41,0.4)] hover:bg-white hover:text-[#FF0000] hover:scale-105 transition-all duration-300 uppercase tracking-wider text-sm"
              >
                Khám phá Catalogue Phụ Tùng
              </Link>
            </div>
          ) : submitResult?.success ? (
            /* Success State */
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-[0_0_50px_rgba(16,185,129,0.15)]">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-3">Gửi Báo Giá Thành Công!</h2>
              <p className="text-slate-300 text-base leading-relaxed mb-8">
                {submitResult.message}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://zalo.me/0903588167"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-full transition-all text-sm uppercase tracking-wider"
                >
                  Chat Zalo Trực Tiếp (0903.588.167)
                </a>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-8 rounded-full transition-all text-sm uppercase tracking-wider border border-slate-700"
                >
                  Tiếp tục xem sản phẩm
                </Link>
              </div>
            </div>
          ) : (
            /* Main Content: Cart List + Submission Form */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Product List Column */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex justify-between items-center bg-slate-900/80 px-6 py-4 rounded-2xl border border-slate-800">
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Sản phẩm đã chọn (<span className="text-[#FF0000]">{totalItems}</span> mã)
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-xs text-slate-400 hover:text-[#FF0000] flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 bg-black rounded-xl overflow-hidden border border-slate-800 shrink-0">
                        <Image
                          src={item.product.imageSrc}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-[#FF0000]/10 border border-[#FF0000]/30 text-[#FF0000] text-[10px] font-extrabold uppercase rounded">
                            {item.product.brand}
                          </span>
                          <span className="text-slate-400 text-xs font-mono">
                            Part No: <span className="text-white font-bold">{item.product.partNumber}</span>
                          </span>
                        </div>
                        <h3 className="text-white font-bold text-base truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Tiêu chuẩn: <span className="text-slate-300 font-semibold">{item.product.qualityStandard}</span>
                        </p>
                      </div>

                      {/* Quantity & Delete */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-950">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                            aria-label="Giảm số lượng"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-sm font-bold font-mono text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                            aria-label="Tăng số lượng"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-2 text-slate-500 hover:text-[#FF0000] hover:bg-slate-800 rounded-lg transition-colors"
                          aria-label="Xóa sản phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                  <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#FF0000] shrink-0" />
                    <span className="text-xs font-semibold text-slate-300">Báo giá trong 5 phút</span>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#FF0000] shrink-0" />
                    <span className="text-xs font-semibold text-slate-300">Kiểm định chuẩn 100%</span>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                    <Truck className="w-5 h-5 text-[#FF0000] shrink-0" />
                    <span className="text-xs font-semibold text-slate-300">Giao hàng toàn quốc</span>
                  </div>
                </div>

              </div>

              {/* Submission Form Column */}
              <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl sticky top-32">
                <h3 className="text-xl font-bold font-heading uppercase text-white mb-2 flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#FF0000]" />
                  Gửi Yêu Cầu Báo Giá
                </h3>
                <p className="text-slate-400 text-xs mb-6">
                  Điền số điện thoại của bạn để nhận báo giá chi tiết từng mã phụ tùng kèm chiết khấu tốt nhất.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Số điện thoại <span className="text-[#FF0000]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Nhập số điện thoại (VD: 0903588167)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF0000] font-medium text-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập tên người mua / Đội xe / Gara"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF0000] font-medium text-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Ghi chú thêm (Dòng xe, năm sản xuất...)
                    </label>
                    <textarea
                      rows={3}
                      value={generalNote}
                      onChange={(e) => setGeneralNote(e.target.value)}
                      placeholder="VD: Cần gấp trong ngày tại kho Đà Nẵng, xe HOWO 371HP 2021..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF0000] font-medium text-sm transition-colors resize-none"
                    ></textarea>
                  </div>

                  {submitResult && !submitResult.success && (
                    <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs font-semibold">
                      {submitResult.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#FF0000] to-orange-600 text-white font-black py-4 px-6 rounded-full shadow-[0_0_25px_rgba(217,4,41,0.4)] hover:shadow-[0_0_35px_rgba(217,4,41,0.6)] hover:scale-[1.02] transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Gửi Yêu Cầu Báo Giá Q.BA 1-Click
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                  <p className="text-slate-400 text-xs mb-2">Hoặc gọi tư vấn kỹ thuật trực tiếp:</p>
                  <a
                    href="tel:0903588167"
                    className="text-[#FF0000] hover:text-white font-extrabold text-base tracking-wider transition-colors"
                  >
                    HOTLINE: 0903.588.167
                  </a>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
  );
}
