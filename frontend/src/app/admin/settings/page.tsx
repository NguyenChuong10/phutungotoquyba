'use client';

import { useState } from 'react';
import {
  Building2,
  Globe,
  Save,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [companyName, setCompanyName] = useState('CÔNG TY TNHH CƠ KHÍ Ô TÔ Q.BA');
  const [hotline, setHotline] = useState('0903.588.167');
  const [email, setEmail] = useState('phutungotoqbadanang@gmail.com');
  const [address, setAddress] = useState(
    'Số 43-45-47 Đường Nguyễn Văn Tạo, Phường An Khê, Quận Thanh Khê, Đà Nẵng'
  );


  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Cấu Hình Hệ Thống Q.BA
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
              Hoạt Động BÌNH THƯỜNG
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tùy chỉnh thông tin liên hệ công ty, Hotline báo giá Zalo OA, thông tin SEO và chế độ bảo trì.
          </p>
        </div>

        <button
          onClick={() => alert('Đã lưu cấu hình hệ thống thành công!')}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto w-full sm:w-auto"
        >
          <Save className="w-4 h-4" />
          <span>Lưu Cấu Hình</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Main Company & Hotline Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-red-600" />
              <h2 className="font-bold text-slate-900 text-base">Thông Tin Doanh Nghiệp Q.BA</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Công Ty Công Khai (*)</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hotline Báo Giá (Zalo OA)</label>
                  <input
                    type="text"
                    value={hotline}
                    onChange={(e) => setHotline(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-bold text-red-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Tiếp Nhận Báo Giá</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Địa Chỉ Kho Hàng & Cửa Hàng Chinh</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* SEO Metadata Config */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Globe className="w-5 h-5 text-red-600" />
              <h2 className="font-bold text-slate-900 text-base">Cấu Hình SEO & Google Metadata</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu Đề Trang Chủ (SEO Title)</label>
                <input
                  type="text"
                  defaultValue="Phụ Tùng Ô Tô Q.BA - Giá tốt nhất | Tra Cứu 10.000+ Mã Linh Kiện Xe Tải"
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô Tả SEO (Meta Description)</label>
                <textarea
                  rows={3}
                  defaultValue="Công ty TNHH Cơ Khí Ô Tô Q.BA cung cấp phụ tùng xe tải nặng Trung Quốc HOWO, Shacman, FAW, Weichai chất lượng loại 1 tại Đà Nẵng và giao hàng toàn quốc."

                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-medium"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Maintenance & System Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              Trạng Thái Bảo Trì Hệ Thống
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 text-xs block">Chế Độ Bảo Trì Website</span>
                <span className="text-[10px] text-slate-400">Khóa giao diện bán hàng tạm thời</span>
              </div>

              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="cursor-pointer text-slate-800 transition-transform active:scale-95"
              >
                {maintenanceMode ? (
                  <ToggleRight className="w-8 h-8 text-red-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-400" />
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-start gap-2.5 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Hệ Thống An Toàn:</span> Máy chủ Next.js App Router đang hoạt động mượt mà với 0 cảnh báo.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
