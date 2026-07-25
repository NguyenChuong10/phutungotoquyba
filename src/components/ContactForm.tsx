"use client";

import React from "react";
import { Send, Headphones } from "lucide-react";

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

      <form className="space-y-5 pt-2" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Họ và tên bác tài / Chủ xe *</label>
            <input 
              type="text" 
              placeholder="Nguyễn Văn A" 
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-sm transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Số điện thoại / Zalo *</label>
            <input 
              type="tel" 
              placeholder="0903.xxx.xxx" 
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-sm transition-colors"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Dòng xe vận tải *</label>
            <select className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-brand text-sm transition-colors">
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
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-sm transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Ghi chú chi tiết yêu cầu *</label>
          <textarea 
            rows={4}
            placeholder="Mô tả cụ thể tên chi tiết phụ tùng, số lượng cần mua hoặc yêu cầu giao hàng..."
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-sm transition-colors resize-none"
            required
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
    </div>
  );
}
