'use client';

import { useState, useEffect } from 'react';
import ToastNotification, { ToastMessage } from '@/components/ui/ToastNotification';
import {
  Building2,
  Globe,
  Save,
  ShieldCheck,
  BellRing,
  Loader2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AdminApiService } from '@/services/adminApiService';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastState, setToastState] = useState<ToastMessage | null>(null);

  // System Settings State
  const [settings, setSettings] = useState({
    hotlineZalo: '0903.588.167',
    phoneSales: '0903.588.167',
    emailContact: 'phutungotoqbadanang@gmail.com',
    warehouseAddress: '351 Điện Biên Phủ, Phường Hòa Khê, Quận Thanh Khê, TP. Đà Nẵng',
    workingHours: 'Thứ 2 - Chủ Nhật: 07:30 - 18:00',
    homeHeroSlogan: 'Nhập Khẩu & Phân Phối Phụ Tùng Xe Tải Nặng Trung Quốc Uy Tín 25 Năm Tại Đà Nẵng',
    noticeBarMessage: '🔥 Tổng kho Phụ Tùng Xe Tải Q.BA Đà Nẵng - Sẵn kho 10.000+ mã linh kiện HOWO, Weichai, Fast Gear. Hotline/Zalo: 0903.588.167',
    enableSoundAlert: 'true',
    autoRefreshInterval: '15',
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await AdminApiService.getSettings();
      if (res.ok && res.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error('Failed to fetch system settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChangeSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await AdminApiService.updateSettings(settings);
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Lưu Cấu Hình Thành Công',
          message: 'Đã lưu toàn bộ cấu hình hệ thống & thông tin liên hệ kho Q.BA vào CSDL!',
        });
      } else {
        alert(res.message || 'Lỗi khi lưu cấu hình');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Cấu Hình Hệ Thống & Hotline Q.BA
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
              Hoạt Động BÌNH THƯỜNG
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tùy chỉnh thông tin liên hệ Hotline Zalo kho Đà Nẵng, banner thông báo, âm thanh cảnh báo báo giá.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveSettings}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-md shadow-red-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto w-full sm:w-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Đang lưu CSDL...' : 'Lưu Cấu Hình Hệ Thống'}</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/80 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
          <p className="text-xs font-bold text-slate-600">Đang tải cấu hình hệ thống từ PostgreSQL...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left 2 Cols: Main Company & Hotline Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Info Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 className="w-5 h-5 text-red-600" />
                <h2 className="font-extrabold text-slate-900 text-base">
                  Thông Tin Hotline & Kho Phụ Tùng Q.BA Đà Nẵng
                </h2>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Hotline / Zalo OA Tư Vấn Kỹ Thuật (*)</label>
                    <input
                      type="text"
                      required
                      value={settings.hotlineZalo}
                      onChange={(e) => handleChangeSetting('hotlineZalo', e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-extrabold text-red-600 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Điện Thoại Bán Hàng & Kho Bãi (*)</label>
                    <input
                      type="text"
                      required
                      value={settings.phoneSales}
                      onChange={(e) => handleChangeSetting('phoneSales', e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Tiếp Nhận Đơn Báo Giá (*)</label>
                    <input
                      type="email"
                      required
                      value={settings.emailContact}
                      onChange={(e) => handleChangeSetting('emailContact', e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Giờ Làm Việc Kho Đà Nẵng</label>
                    <input
                      type="text"
                      value={settings.workingHours}
                      onChange={(e) => handleChangeSetting('workingHours', e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-900 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Địa Chỉ Tổng Kho Phụ Tùng Tại Đà Nẵng (*)</label>
                  <input
                    type="text"
                    required
                    value={settings.warehouseAddress}
                    onChange={(e) => handleChangeSetting('warehouseAddress', e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-900 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Banner & Notice Bar Config */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Globe className="w-5 h-5 text-red-600" />
                <h2 className="font-extrabold text-slate-900 text-base">Cấu Hình Slogan & Thanh Thông Báo Banner</h2>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Slogan Hero Khung Quảng Cáo Trang Chủ</label>
                  <input
                    type="text"
                    value={settings.homeHeroSlogan}
                    onChange={(e) => handleChangeSetting('homeHeroSlogan', e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-900 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nội Dung Thanh Chạy Thông Báo Đỉnh Trang (Notice Bar)</label>
                  <textarea
                    rows={3}
                    value={settings.noticeBarMessage}
                    onChange={(e) => handleChangeSetting('noticeBarMessage', e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-900 bg-slate-50 focus:bg-white"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Notification Sound & Auto Refresh System */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <BellRing className="w-5 h-5 text-red-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Thông Báo Âm Thanh & Auto Refresh
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Âm Thanh Báo Giá Real-time</span>
                    <span className="text-[10px] text-slate-500">Phát âm thanh C5-E5-G5 khi có đơn mới</span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleChangeSetting(
                        'enableSoundAlert',
                        settings.enableSoundAlert === 'true' ? 'false' : 'true'
                      )
                    }
                    className={`p-2 rounded-xl transition-all cursor-pointer font-bold text-xs flex items-center gap-1 ${
                      settings.enableSoundAlert === 'true'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {settings.enableSoundAlert === 'true' ? (
                      <>
                        <Volume2 className="w-4 h-4 text-emerald-600" />
                        <span>BẬT</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-4 h-4 text-slate-500" />
                        <span>TẮT</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <label className="font-bold text-slate-800 text-xs block">
                  Tần Số Tự Động Refresh Dashboard (Giây)
                </label>
                <select
                  value={settings.autoRefreshInterval}
                  onChange={(e) => handleChangeSetting('autoRefreshInterval', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs font-extrabold text-slate-900"
                >
                  <option value="5">Mỗi 5 giây (Hỏa tốc)</option>
                  <option value="15">Mỗi 15 giây (Tiêu chuẩn)</option>
                  <option value="30">Mỗi 30 giây</option>
                  <option value="60">Mỗi 60 giây (1 phút)</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block">Bảo Vệ An Toàn Dữ Liệu:</span>
                  Mọi thay đổi cấu hình sẽ được lưu trực tiếp vào CSDL PostgreSQL và đồng bộ toàn hệ thống.
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TOAST NOTIFICATION */}
      <ToastNotification toast={toastState} onClose={() => setToastState(null)} />
    </div>
  );
}
