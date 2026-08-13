"use client";

import React, { useState, useEffect } from "react";
import { X, ShoppingCart, User, Phone, Mail, FileText, Send, CheckCircle2, MessageSquare, ShieldCheck, Loader2 } from "lucide-react";
import { Product } from "@/data/productsData";
import { quotationService } from "@/services/quotationService";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

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

  // Anti-XSS Sanitizer
  const sanitize = (str: string) => str.replace(/[<>'"&]/g, "").trim();

  // Strict Vietnamese Mobile Phone Validator
  const isValidPhone = (num: string) => {
    const clean = num.replace(/\D/g, "");
    return /^(03|05|07|08|09)\d{8}$/.test(clean);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setPhoneError("Số điện thoại không hợp lệ. Vui lòng nhập đúng SĐT di động Việt Nam (10 chữ số, ví dụ: 0905123456).");
      return;
    }
    setPhoneError("");
    setIsSubmitting(true);

    const prodInfo = product 
      ? `[Yêu cầu báo giá phụ tùng: ${product.name} - Part No: ${product.partNumber}]`
      : "";

    const fullNote = `${prodInfo} ${sanitize(note)}`.trim();

    const payload = {
      customerName: sanitize(fullName) || "Khách Hàng Q.BA",
      phoneNumber: sanitize(phone),
      customerEmail: sanitize(email) || undefined,
      notes: fullNote || undefined,
      items: product ? [{ productId: Number(product.id) || 2, quantity: 1 }] : [],
    };

    try {
      await quotationService.submitQuotation(payload);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 3000);
    } catch {
      // Handled in quotationService
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleZaloQuickQuote = async () => {
    if (!isValidPhone(phone)) {
      setPhoneError("Số điện thoại không hợp lệ. Vui lòng nhập từ 9-11 chữ số.");
      return;
    }
    setPhoneError("");
    const safeName = sanitize(fullName) || "Khách hàng";
    const safePhone = sanitize(phone);
    const safeNote = sanitize(note);
    const prodInfo = product 
      ? `[Báo giá: ${product.name} - Part No: ${product.partNumber}]`
      : "[Yêu cầu báo giá phụ tùng xe tải Q.BA]";

    // Submit to DB in background as well
    quotationService.submitQuotation({
      customerName: safeName,
      phoneNumber: safePhone,
      customerEmail: sanitize(email) || undefined,
      notes: `Chat Zalo: ${prodInfo} - Ghi chú: ${safeNote}`,
      items: product ? [{ productId: Number(product.id) || 2, quantity: 1 }] : [],
    });

    const message = encodeURIComponent(`Xin chào Q.BA, tôi là ${safeName} (SĐT: ${safePhone}). Tôi cần báo giá: ${prodInfo}. Ghi chú: ${safeNote}`);
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
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-800 hover:bg-red-600 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center shrink-0 shadow-lg">
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
            <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-900 block truncate max-w-xs">{product.name}</span>
              <span className="text-gray-500 font-mono">Part No: {product.partNumber}</span>
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
                Cảm ơn bạn! Đội ngũ tư vấn kỹ thuật Phụ Tùng Ô Tô Q.BA đã nhận được đơn báo giá và sẽ liên hệ qua SĐT/Zalo trong 5 phút.
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmitForm}>
              {/* Họ và tên */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Họ và tên</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
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
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError("");
                    }}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                  />
                </div>
                {phoneError && (
                  <p className="text-[11px] font-bold text-red-600 mt-1">{phoneError}</p>
                )}
              </div>

              {/* Email */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send size={16} />
                      GỬI YÊU CẦU BÁO GIÁ
                    </>
                  )}
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
