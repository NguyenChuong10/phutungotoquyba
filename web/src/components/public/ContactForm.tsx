"use client";

import React, { useState } from "react";
import { Send, Headphones, CheckCircle2 } from "lucide-react";

const vehicleBrands = [
  "HOWO Sinotruk",
  "Shacman",
  "FAW",
  "Dongfeng",
  "Chenglong",
  "Weichai / Yuchai / Cummins",
  "Fast Gear",
  "Rơ-Moóc / Xe Ben khác"
];

export default function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState(vehicleBrands[0]);
  const [partNo, setPartNo] = useState("");
  const [note, setNote] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Anti-XSS Sanitizer
  const sanitize = (str: string) => str.replace(/[<>'"&]/g, "").trim();

  // Vietnamese Phone Validator
  const isValidPhone = (num: string) => {
    const clean = num.replace(/\D/g, "");
    return clean.length >= 9 && clean.length <= 11;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setPhoneError("Số điện thoại không hợp lệ. Vui lòng nhập từ 9-11 chữ số.");
      return;
    }
    setPhoneError("");
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFullName("");
      setPhone("");
      setPartNo("");
      setNote("");
    }, 4000);
  };

  return (
    <div className="lg:col-span-7 bg-slate-900 text-white p-8 md:p-12 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-brand text-xs font-bold uppercase tracking-widest mb-3">
          <Headphones size={14} />
          Nhận Báo Giá Nhanh
        </div>
        <h2 className="text-2xl sm:text-4xl font-black font-heading uppercase text-white tracking-wide">
          GỬI YÊU CẦU <span className="text-brand">BÁO GIÁ PHỤ TÙNG</span>
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mt-2">
          Vui lòng để lại thông tin dòng xe và mã phụ tùng, đội ngũ kỹ thuật Q.BA sẽ liên hệ báo giá trong vòng 15 phút.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-center space-y-3 animate-fade-in">
          <CheckCircle2 size={48} className="text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white uppercase">Gửi Yêu Cầu Báo Giá Thành Công!</h3>
          <p className="text-sm text-emerald-200">
            Cảm ơn bạn! Kỹ thuật viên Phụ Tùng Ô Tô Q.BA sẽ kiểm tra kho và liên hệ qua SĐT/Zalo trong 15 phút.
          </p>
        </div>
      ) : (
        <form className="space-y-5 pt-2" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Họ và tên bác tài / Chủ xe</label>
              <input 
                type="text" 
                placeholder="Nguyễn Văn A" 
                value={fullName}
                onChange={(e) => setFullName(sanitize(e.target.value))}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Số điện thoại / Zalo *</label>
              <input 
                type="tel" 
                placeholder="0903.xxx.xxx" 
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) setPhoneError("");
                }}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-sm transition-colors"
                required
              />
              {phoneError && (
                <p className="text-[11px] font-bold text-red-400 mt-1">{phoneError}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Dòng xe vận tải *</label>
              <select 
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-brand text-sm transition-colors"
              >
                {vehicleBrands.map((brand, idx) => (
                  <option key={`brand-opt-${idx}`} value={brand} className="bg-slate-900 text-white">
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Mã phụ tùng (Part No.)</label>
              <input 
                type="text" 
                placeholder="Vd: VG1560080012, JS130T..." 
                value={partNo}
                onChange={(e) => setPartNo(sanitize(e.target.value))}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-sm transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Ghi chú chi tiết yêu cầu</label>
            <textarea 
              rows={4}
              placeholder="Mô tả cụ thể tên chi tiết phụ tùng, số lượng cần mua hoặc yêu cầu giao hàng..."
              value={note}
              onChange={(e) => setNote(sanitize(e.target.value))}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-sm transition-colors resize-none"
            ></textarea>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-brand to-red-700 hover:from-red-600 hover:to-brand text-white font-black py-4 px-8 rounded-xl uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_25px_rgba(217,4,41,0.4)] cursor-pointer"
          >
            <Send size={18} />
            GỬI YÊU CẦU BÁO GIÁ 1-CLICK
          </button>
        </form>
      )}
    </div>
  );
}
