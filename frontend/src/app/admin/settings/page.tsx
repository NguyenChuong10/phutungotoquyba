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
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { AdminApiService } from '@/services/adminApiService';

interface PartnerBrand {
  id: number;
  name: string;
  logoUrl: string;
  sortOrder?: number;
}

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
    noticeBarMessage: 'Tổng kho Phụ Tùng Xe Tải Q.BA Đà Nẵng - Sẵn kho 10.000+ mã linh kiện HOWO, Weichai, Fast Gear. Hotline/Zalo: 0903.588.167',
    enableSoundAlert: 'true',
    autoRefreshInterval: '15',
  });

  // Real Database Partner Brands State
  const [partnerBrands, setPartnerBrands] = useState<PartnerBrand[]>([]);

  // Brand Partner Modal State
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<PartnerBrand | null>(null);
  const [brandName, setBrandName] = useState('');
  const [brandBg, setBrandBg] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchSettingsAndBrands = async () => {
    setLoading(true);
    try {
      const [resSettings, resBrands] = await Promise.all([
        AdminApiService.getSettings(),
        AdminApiService.getPartnerBrands(),
      ]);

      if (resSettings.ok && resSettings.data) {
        setSettings((prev) => ({ ...prev, ...resSettings.data }));
      }

      if (resBrands.ok && resBrands.data) {
        setPartnerBrands(resBrands.data);
      }
    } catch (err) {
      console.error('Failed to fetch system settings & brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndBrands();
  }, []);

  const handleChangeSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await AdminApiService.updateSettings(settings);
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Lưu Cấu Hình Thành Công',
          message: 'Đã lưu toàn bộ cấu hình hệ thống kho Q.BA thành công!',
        });
      } else {
        setToastState({
          id: String(Date.now()),
          type: 'error',
          title: 'Lưu Thất Bại',
          message: res.message || 'Lỗi khi lưu cấu hình hệ thống',
        });
      }
    } catch (err) {
      setToastState({
        id: String(Date.now()),
        type: 'error',
        title: 'Lỗi Kết Nối',
        message: 'Không thể kết nối máy chủ khi lưu cấu hình',
      });
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  // Open Brand Modal
  const handleOpenBrandModal = (brand?: PartnerBrand) => {
    if (brand) {
      setEditingBrand(brand);
      setBrandName(brand.name);
      setBrandBg(brand.logoUrl);
    } else {
      setEditingBrand(null);
      setBrandName('');
      setBrandBg('');
    }
    setIsBrandModalOpen(true);
  };

  // Upload Brand Image
  const handleUploadBrandImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await AdminApiService.uploadImage(file);
      const uploadedUrl = res.data?.imageUrl || res.url;
      if (res.ok && uploadedUrl) {
        setBrandBg(uploadedUrl);
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Upload Ảnh Thành Công',
          message: `Đã tải ảnh ${file.name} lên máy chủ Q.BA thành công!`,
        });
      } else {
        setToastState({
          id: String(Date.now()),
          type: 'error',
          title: 'Upload Thất Bại',
          message: res.message || 'Lỗi tải ảnh lên máy chủ.',
        });
      }
    } catch {
      setToastState({
        id: String(Date.now()),
        type: 'error',
        title: 'Lỗi Tải Ảnh',
        message: 'Không thể tải ảnh lên máy chủ.',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Delete Brand Confirm Modal State
  const [deletingBrand, setDeletingBrand] = useState<PartnerBrand | null>(null);
  const [isDeletingBrand, setIsDeletingBrand] = useState(false);

  // Save Brand Partner to PostgreSQL Database
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      setToastState({
        id: String(Date.now()),
        type: 'error',
        title: 'Thiếu Tên Thương Hiệu',
        message: 'Vui lòng nhập tên thương hiệu đối tác.',
      });
      return;
    }
    if (!brandBg.trim()) {
      setToastState({
        id: String(Date.now()),
        type: 'error',
        title: 'Thiếu Logo',
        message: 'Vui lòng tải ảnh logo thương hiệu.',
      });
      return;
    }

    try {
      if (editingBrand) {
        const res = await AdminApiService.updatePartnerBrand(editingBrand.id, {
          name: brandName.trim(),
          logoUrl: brandBg.trim(),
        });
        if (res.ok && res.data) {
          setPartnerBrands((prev) =>
            prev.map((b) => (b.id === editingBrand.id ? res.data : b))
          );
          setToastState({
            id: String(Date.now()),
            type: 'success',
            title: 'Cập Nhật Thành Công',
            message: `Đã cập nhật thương hiệu "${res.data.name}" thành công!`,
          });
        } else {
          setToastState({
            id: String(Date.now()),
            type: 'error',
            title: 'Cập Nhật Thất Bại',
            message: res.message || 'Không thể cập nhật thương hiệu.',
          });
        }
      } else {
        const res = await AdminApiService.createPartnerBrand({
          name: brandName.trim(),
          logoUrl: brandBg.trim(),
        });
        if (res.ok && res.data) {
          setPartnerBrands((prev) => [...prev, res.data]);
          setToastState({
            id: String(Date.now()),
            type: 'success',
            title: 'Thêm Mới Thành Công',
            message: `Đã thêm thương hiệu "${res.data.name}" thành công!`,
          });
        } else {
          setToastState({
            id: String(Date.now()),
            type: 'error',
            title: 'Thêm Mới Thất Bại',
            message: res.message || 'Không thể tạo thương hiệu mới.',
          });
        }
      }
      setIsBrandModalOpen(false);
    } catch {
      setToastState({
        id: String(Date.now()),
        type: 'error',
        title: 'Lỗi Kết Nối',
        message: 'Lỗi khi lưu dữ liệu thương hiệu.',
      });
    }
  };

  // Delete Brand Partner permanently from PostgreSQL Database
  const handleConfirmDeleteBrand = async () => {
    if (!deletingBrand) return;
    setIsDeletingBrand(true);
    try {
      const res = await AdminApiService.deletePartnerBrand(deletingBrand.id);
      if (res.ok) {
        setPartnerBrands((prev) => prev.filter((b) => b.id !== deletingBrand.id));
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Đã Xóa Thành Công',
          message: `Thương hiệu "${deletingBrand.name}" đã được xóa vĩnh viễn khỏi hệ thống!`,
        });
        setDeletingBrand(null);
      } else {
        setToastState({
          id: String(Date.now()),
          type: 'error',
          title: 'Xóa Thất Bại',
          message: res.message || 'Không thể xóa thương hiệu.',
        });
      }
    } catch {
      setToastState({
        id: String(Date.now()),
        type: 'error',
        title: 'Lỗi Kết Nối',
        message: 'Lỗi kết nối máy chủ khi xóa thương hiệu.',
      });
    } finally {
      setIsDeletingBrand(false);
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
            Tùy chỉnh thông tin liên hệ Hotline Zalo kho Đà Nẵng, logo đối tác thương hiệu, âm thanh cảnh báo.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => handleSaveSettings()}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-md shadow-red-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto w-full sm:w-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Đang lưu...' : 'Lưu Cấu Hình Hệ Thống'}</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/80 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
          <p className="text-xs font-bold text-slate-600">Đang tải cấu hình hệ thống & thương hiệu...</p>
        </div>
      ) : (
        <div className="space-y-6">
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
                      className={`p-2 rounded-xl transition-all cursor-pointer font-bold text-xs flex items-center gap-1 ${settings.enableSoundAlert === 'true'
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



                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block">Bảo Vệ An Toàn Dữ Liệu:</span>
                    Mọi thay đổi cấu hình sẽ được lưu trực tiếp và đồng bộ toàn hệ thống.
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* REAL DATABASE PARTNER BRANDS MANAGEMENT SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-slate-900 text-base">
                      Quản Lý Đối Tác Thương Hiệu
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                      {partnerBrands.length} Thương Hiệu
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dữ liệu được lưu trữ và cập nhật trực tiếp trên hệ thống khi thêm/xóa.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenBrandModal()}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-red-500" />
                <span>Thêm Thương Hiệu Mới</span>
              </button>
            </div>

            {/* Grid display of Brand Partner Cards */}
            {partnerBrands.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-500">Chưa có thương hiệu đối tác nào trong hệ thống.</p>
                <button
                  type="button"
                  onClick={() => handleOpenBrandModal()}
                  className="mt-3 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
                >
                  Thêm thương hiệu đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {partnerBrands.map((brand) => (
                  <div
                    key={brand.id}
                    className="group relative bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-between transition-all hover:border-red-500/50 hover:shadow-md hover:bg-white"
                  >
                    <div className="relative w-full h-20 bg-white rounded-xl border border-slate-100 p-2 flex items-center justify-center overflow-hidden mb-2">
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
                        }}
                      />
                    </div>

                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider text-center truncate w-full mb-2">
                      {brand.name}
                    </span>

                    {/* Actions overlay / buttons */}
                    <div className="flex items-center gap-1.5 w-full pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenBrandModal(brand)}
                        className="flex-1 py-1.5 px-2 bg-slate-200 hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingBrand(brand)}
                        className="py-1.5 px-2 bg-slate-200 hover:bg-red-600 hover:text-white text-slate-700 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                        title="Xóa thương hiệu vĩnh viễn"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BRAND PARTNER ADD / EDIT MODAL */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">
                  {editingBrand ? 'Chỉnh Sửa Thương Hiệu Đối Tác' : 'Thêm Thương Hiệu Đối Tác Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveBrand} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên Thương Hiệu Đối Tác (*)
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Nhập tên thương hiệu (Ví dụ: WEICHAI, HOWO, BOSCH...)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  Tải Ảnh Logo / Hình Ảnh Thương Hiệu (*)
                </label>

                <div className="space-y-3">
                  {/* File Upload Button */}
                  <div className="relative border-2 border-dashed border-slate-200 hover:border-red-500/50 rounded-2xl p-4 text-center bg-slate-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadBrandImage}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                      {uploadingImage ? (
                        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                      ) : (
                        <Upload className="w-6 h-6 text-slate-400" />
                      )}
                      <span className="font-bold text-slate-700 text-xs">
                        {uploadingImage ? 'Đang tải ảnh lên...' : 'Bấm vào đây để chọn ảnh từ máy tính'}
                      </span>
                      <span className="text-[10px] text-slate-400">Hỗ trợ PNG, JPG, WEBP (Tối đa 5MB)</span>
                    </div>
                  </div>

                  {/* Manual URL Input */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">
                      Hoặc nhập đường dẫn URL ảnh / Preset ảnh sẵn có:
                    </span>
                    <input
                      type="text"
                      required
                      value={brandBg}
                      onChange={(e) => setBrandBg(e.target.value)}
                      placeholder="/images/pioneer-section/hopsoxetai.png"
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 bg-slate-50 focus:bg-white"
                    />
                  </div>

                  {/* Image Preview Box */}
                  {brandBg && (
                    <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 flex items-center gap-3">
                      <div className="relative w-16 h-12 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={brandBg}
                          alt="Preview"
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Xem trước ảnh hợp lệ
                        </span>
                        <p className="text-[10px] text-slate-500 truncate">{brandBg}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-md shadow-red-900/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingBrand ? 'Cập Nhật Thương Hiệu' : 'Lưu Thương Hiệu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE BRAND MODAL */}
      <ConfirmModal
        isOpen={Boolean(deletingBrand)}
        title="Xác Nhận Xóa Thương Hiệu"
        message="Bạn có chắc chắn muốn xóa vĩnh viễn thương hiệu"
        itemName={deletingBrand?.name}
        confirmText="Xóa Vĩnh Viễn"
        cancelText="Hủy Bỏ"
        type="danger"
        isLoading={isDeletingBrand}
        onConfirm={handleConfirmDeleteBrand}
        onCancel={() => setDeletingBrand(null)}
      />

      {/* TOAST NOTIFICATION */}
      <ToastNotification toast={toastState} onClose={() => setToastState(null)} />
    </div>
  );
}
