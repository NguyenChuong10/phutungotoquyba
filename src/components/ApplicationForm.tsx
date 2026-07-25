"use client";

import React, { useState } from "react";
import { Send, UserCheck, Briefcase, FileText, CheckCircle2 } from "lucide-react";

const positions = [
  "Nhân Viên Kinh Doanh Phụ Tùng Xe Tải",
  "Kỹ Thuật Viên Tra Catalog & Mã Phụ Tùng",
  "Thủ Kho & Quản Lý Kiện Hàng Phụ Tùng",
  "Vị trí khác (Nhân viên giao nhận / Phụ kho)"
];

const experienceLevels = [
  "Chưa có kinh nghiệm (Được đào tạo)",
  "Dưới 1 năm kinh nghiệm",
  "1 - 3 năm kinh nghiệm",
  "Trên 3 năm kinh nghiệm (Ưu tiên am hiểu xe tải Trung Quốc)"
];

export default function ApplicationForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="bg-slate-900 text-white p-8 md:p-12 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-brand text-xs font-bold uppercase tracking-widest mb-3">
          <Briefcase size={14} />
          Nộp Hồ Sơ Nhanh
        </div>
        <h2 className="text-2xl sm:text-4xl font-black font-heading uppercase text-white tracking-wide">
          ỨNG TUYỂN <span className="text-brand">TRỰC TUYẾN</span>
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mt-2">
          Điền thông tin bên dưới, bộ phận tuyển dụng Q.BA sẽ liên hệ phỏng vấn trong vòng 24-48 giờ làm việc.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-center space-y-3 animate-fade-in">
          <CheckCircle2 size={48} className="text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white uppercase">Nộp Hồ Sơ Thành Công!</h3>
          <p className="text-sm text-emerald-200">
            Cảm ơn bạn đã quan tâm ứng tuyển vào Phụ Tùng Ô Tô Q.BA. Chúng tôi sẽ liên hệ với bạn qua SĐT/Zalo sớm nhất.
          </p>
        </div>
      ) : (
        <form className="space-y-5 pt-2" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Họ và tên ứng viên *</label>
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
              <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Vị trí ứng tuyển *</label>
              <select className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-brand text-sm transition-colors">
                {positions.map((pos, idx) => (
                  <option key={`pos-opt-${idx}`} value={pos} className="bg-slate-900 text-white">
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Kinh nghiệm làm việc *</label>
              <select className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-brand text-sm transition-colors">
                {experienceLevels.map((exp, idx) => (
                  <option key={`exp-opt-${idx}`} value={exp} className="bg-slate-900 text-white">
                    {exp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Giới thiệu bản thân & Kinh nghiệm liên quan</label>
            <textarea 
              rows={4}
              placeholder="Mô tả tóm tắt kinh nghiệm làm việc trước đây, sự am hiểu về các dòng phụ tùng xe tải (HOWO, Weichai, Fast Gear...) hoặc lý do muốn gia nhập Q.BA..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-sm transition-colors resize-none"
            ></textarea>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-brand to-red-700 hover:from-red-600 hover:to-brand text-white font-black py-4 px-8 rounded-xl uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_25px_rgba(217,4,41,0.4)] cursor-pointer"
          >
            <Send size={18} />
            NỘP HỒ SƠ ỨNG TUYỂN 1-CLICK
          </button>
        </form>
      )}
    </div>
  );
}
