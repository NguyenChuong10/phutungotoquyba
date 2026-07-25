"use client";

import React, { useState, useEffect } from "react";
import { X, ShoppingCart, User, Phone, Mail, FileText, Send, CheckCircle2, MessageSquare, ShieldCheck } from "lucide-react";
import { Product } from "@/data/productsData";

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export default function QuotationModal({ isOpen, onClose, product }: QuotationModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 3000);
  };

  const handleZaloQuickQuote = () => {
    const prodInfo = product 
      ? `[Báo giá: ${product.name} - Part No: ${product.partNumber} - Mã QB: ${product.internalCode}]`
      : "[Yêu cầu báo giá phụ tùng xe tải Q.BA]";
    const message = encodeURIComponent(`Xin chào Q.BA, tôi là ${fullName || "Khách hàng"} (SĐT: ${phone || "..."}). Tôi cần báo giá: ${prodInfo}. Ghi chú: ${note}`);
    window.open(`https://zalo.me/0903588167?text=${message}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Main Modal Box */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 z-10 transform transition-all duration-300 scale-100">
        
        {/* Modal Header */}
        <div className="bg-[#111317] text-white p-6 sm:p-8 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-800 hover:bg-brand text-gray-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Đóng cửa sổ"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand/20 border border-brand/40 text-brand flex items-center justify-center shrink-0 shadow-lg">
              <ShoppingCart size={28} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black font-heading uppercase text-white tracking-wide">
                BÁO GIÁ NHANH
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm mt-1 leading-relaxed">
                Vui lòng điền thông tin vào form dưới đây, chúng tôi sẽ liên hệ lại với bạn nhanh chóng
              </p>
            </div>
          </div>
        </div>

        {/* Selected Product Banner (If triggered from a product) */}
        {product && (
          <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-900 block truncate max-w-xs">{product.name}</span>
              <span className="text-gray-500 font-mono">Part No: {product.partNumber} | Mã QB: {product.internalCode}</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 size={56} className="text-emerald-500 mx-auto animate-bounce" />
              <h4 className="text-xl font-bold text-slate-900 uppercase">GỬI YÊU CẦU THÀNH CÔNG!</h4>
              <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
                Cảm ơn bạn! Đội ngũ tư vấn kỹ thuật Phụ Tùng Ô Tô Q.BA sẽ liên hệ báo giá qua SĐT/Zalo trong 5 phút.
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmitForm}>
              {/* Họ và tên */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Họ và tên *</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                  />
                </div>
              </div>

              {/* Số điện thoại */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Số điện thoại *</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="tel"
                    placeholder="0903.xxx.xxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email (Không bắt buộc)</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                  />
                </div>
              </div>

              {/* Ghi chú thêm */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Mô tả mã phụ tùng / Ghi chú</label>
                <div className="relative">
                  <FileText size={18} className="absolute left-3.5 top-3 text-gray-400" />
                  <textarea 
                    rows={2}
                    placeholder="Mô tả cụ thể số lượng cần mua, năm sản xuất xe..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                <button 
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-blue-600 hover:to-sky-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
                >
                  <Send size={16} />
                  GỬI YÊU CẦU BÁO GIÁ
                </button>

                <button 
                  type="button"
                  onClick={handleZaloQuickQuote}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageSquare size={16} />
                  CHAT BÁO GIÁ ZALO 0903.588.167
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
