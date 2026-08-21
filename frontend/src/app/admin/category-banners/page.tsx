'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Upload,
  ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Check,
} from 'lucide-react';
import { AdminApiService } from '@/services/adminApiService';
import { formatImageUrl } from '@/utils/imageHelper';

interface CategoryBanner {
  id: number;
  title: string;
  imageUrl: string;
  description?: string | null;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function CategoryBannersPage() {
  const [banners, setBanners] = useState<CategoryBanner[]>([]);
  const [selectedBannerId, setSelectedBannerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<CategoryBanner | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('/products');
  const [sortOrder, setSortOrder] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Custom Delete Modal State
  const [deleteConfirmBanner, setDeleteConfirmBanner] = useState<CategoryBanner | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await AdminApiService.getCategoryBannersAdmin();
      if (res.ok && Array.isArray(res.data)) {
        setBanners(res.data);
        if (res.data.length > 0) {
          setSelectedBannerId((prev) =>
            prev && res.data.some((b: any) => b.id === prev) ? prev : res.data[0].id
          );
        } else {
          setSelectedBannerId(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const selectedBanner = banners.find((b) => b.id === selectedBannerId) || banners[0] || null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePrevBanner = () => {
    if (banners.length === 0) return;
    const currentIndex = banners.findIndex((b) => b.id === selectedBanner?.id);
    const prevIndex = (currentIndex - 1 + banners.length) % banners.length;
    setSelectedBannerId(banners[prevIndex].id);
  };

  const handleNextBanner = () => {
    if (banners.length === 0) return;
    const currentIndex = banners.findIndex((b) => b.id === selectedBanner?.id);
    const nextIndex = (currentIndex + 1) % banners.length;
    setSelectedBannerId(banners[nextIndex].id);
  };

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setImageUrl('');
    setDescription('');
    setLinkUrl('/products');
    setSortOrder(banners.length + 1);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (b: CategoryBanner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setImageUrl(b.imageUrl);
    setDescription(b.description || '');
    setLinkUrl(b.linkUrl || '/products');
    setSortOrder(b.sortOrder || 0);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploading(true);
      setErrorMsg(null);

      try {
        const res = await AdminApiService.uploadImage(file);
        const uploadedUrl = res.data?.imageUrl || res.imageUrl || res.url;
        if (res.ok && uploadedUrl) {
          setImageUrl(uploadedUrl);
        } else {
          setErrorMsg(res.message || 'Upload ảnh quảng cáo thất bại');
        }
      } catch (err: any) {
        console.error('Upload error:', err);
        setErrorMsg(err?.message || 'Lỗi kết nối khi tải ảnh lên máy chủ.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên danh mục quảng cáo');
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMsg('Vui lòng tải ảnh quảng cáo lên');
      return;
    }

    setFormLoading(true);
    setErrorMsg(null);

    try {
      if (editingBanner) {
        const res = await AdminApiService.updateCategoryBanner(editingBanner.id, {
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          description: description.trim() || undefined,
          linkUrl: linkUrl.trim() || '/products',
          sortOrder: Number(sortOrder) || 0,
        });

        if (res.ok) {
          showToast('Đã cập nhật banner quảng cáo thành công');
          setShowModal(false);
          fetchBanners();
        } else {
          setErrorMsg(res.message || 'Cập nhật thất bại');
        }
      } else {
        const res = await AdminApiService.createCategoryBanner({
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          description: description.trim() || undefined,
          linkUrl: linkUrl.trim() || '/products',
          sortOrder: Number(sortOrder) || 0,
        });

        if (res.ok) {
          showToast('Đã thêm banner quảng cáo mới');
          setShowModal(false);
          fetchBanners();
        } else {
          setErrorMsg(res.message || 'Tạo mới thất bại');
        }
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (b: CategoryBanner) => {
    try {
      const res = await AdminApiService.updateCategoryBanner(b.id, {
        isActive: !b.isActive,
      });
      if (res.ok) {
        showToast(b.isActive ? 'Đã ẩn banner' : 'Đã hiển thị banner');
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteBanner = async () => {
    if (!deleteConfirmBanner) return;
    setDeleteLoading(true);

    try {
      const res = await AdminApiService.deleteCategoryBanner(deleteConfirmBanner.id);
      if (res.ok) {
        showToast('Đã xóa banner quảng cáo thành công');
        setDeleteConfirmBanner(null);
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
              MARKETING SLIDER
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Quản Lý Banner Quảng Cáo Trang Chủ
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý danh sách banner quảng cáo ở bên trái và xem trước giao diện trực tiếp ở bên phải.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-900/30 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Banner Quảng Cáo Mới</span>
        </button>
      </div>

      {/* Main Master-Detail Content */}
      {loading ? (
        <div className="flex items-center justify-center p-20 bg-white rounded-2xl border border-slate-200">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <span className="text-xs font-bold text-slate-500">Đang tải danh sách banner...</span>
          </div>
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-2xl border border-slate-200 space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Chưa Có Banner Quảng Cáo Nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy bấm nút "Thêm Banner Quảng Cáo Mới" ở trên để khởi tạo thẻ banner đầu tiên cho Trang Chủ.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: LIST OF BANNERS (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-600" />
                <span>Danh Sách Banner Quảng Cáo ({banners.length})</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Chọn banner để xem trước ➔</span>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {banners.map((b) => {
                const isSelected = selectedBanner?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBannerId(b.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white flex items-center gap-3 relative overflow-hidden group ${
                      isSelected
                        ? 'border-red-500 shadow-md ring-2 ring-red-500/20 bg-red-50/10'
                        : b.isActive
                        ? 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                        : 'border-slate-200 opacity-60 bg-slate-50'
                    }`}
                  >
                    {/* Active Selected Left Accent Pill */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>
                    )}

                    {/* Thumbnail Image */}
                    <div className="w-20 h-16 relative rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shrink-0">
                      <Image
                        src={formatImageUrl(b.imageUrl)}
                        alt={b.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-bold">
                        #{b.sortOrder}
                      </span>
                    </div>

                    {/* Banner Information */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase truncate font-heading">
                          {b.title}
                        </h4>
                        {b.isActive ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold shrink-0 flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Bật
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-extrabold shrink-0 flex items-center gap-0.5">
                            <EyeOff className="w-2.5 h-2.5" /> Ẩn
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-1">
                        {b.description || 'Chưa có mô tả'}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono truncate">
                        <LinkIcon className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{b.linkUrl || '/products'}</span>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex flex-col gap-1.5 shrink-0 pl-2 border-l border-slate-100" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleActive(b)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          b.isActive
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={b.isActive ? 'Tắt ẩn banner' : 'Hiển thị banner'}
                      >
                        {b.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(b)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                        title="Sửa banner"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmBanner(b)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                        title="Xóa banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE HOMEPAGE BANNER PREVIEW (lg:col-span-7) */}
          <div className="lg:col-span-7 sticky top-20 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Preview Top Control Bar */}
              <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-red-500" />
                  <span className="font-extrabold text-xs tracking-wide">
                    XEM TRƯỚC BANNER QUẢNG CÁO TẠI TRANG CHỦ
                  </span>
                </div>

                {selectedBanner && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      Banner {banners.findIndex((b) => b.id === selectedBanner.id) + 1} / {banners.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handlePrevBanner}
                        className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                        title="Banner trước"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleNextBanner}
                        className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                        title="Banner kế tiếp"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Exact Homepage Category Banner Viewport */}
              {selectedBanner ? (
                <div className="relative bg-[#111317] p-6 sm:p-10 flex flex-col items-center justify-center overflow-hidden select-none min-h-[460px]">
                  {/* Background Truck Image Overlay */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src="/images/vehicle-category/baxe.png"
                      alt="Vehicles Background"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/65"></div>
                  </div>

                  {/* Content Container */}
                  <div className="relative z-10 flex flex-col items-center w-full max-w-xl space-y-6">
                    {/* Section Title */}
                    <h2 className="text-2xl sm:text-4xl font-heading font-black text-white uppercase tracking-wider text-center drop-shadow-lg">
                      Danh mục <span className="text-[#D90429]">Phụ tùng</span>
                    </h2>

                    {/* Exact Card Design from VehicleCategory.tsx */}
                    <div className="w-[260px] sm:w-[280px] h-[360px] sm:h-[400px] rounded-xl shadow-2xl overflow-hidden border-2 border-[#D90429] bg-gray-900 relative group transition-transform duration-300">
                      <Image
                        src={formatImageUrl(selectedBanner.imageUrl)}
                        alt={selectedBanner.title}
                        fill
                        priority
                        className="object-cover"
                      />

                      {/* Header Title Gradient Overlay */}
                      <div className="absolute top-0 left-0 w-full pt-5 pb-10 px-3 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none z-10">
                        <h3 className="text-[#EF233C] text-base sm:text-lg font-bold font-heading uppercase text-center tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-snug">
                          {selectedBanner.title}
                        </h3>
                      </div>

                      {/* Hover Hint Overlay */}
                      <div className="absolute inset-0 bg-[#D90429]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 z-10">
                        <span className="text-white font-bold uppercase tracking-widest border-2 border-white px-5 py-1.5 rounded-full text-xs">
                          Xem chi tiết
                        </span>
                      </div>
                    </div>

                    {/* Bottom CTA Button */}
                    <div className="pt-2">
                      <span className="bg-[#D90429] text-white uppercase font-bold tracking-wider py-3 px-8 rounded-full shadow-[0_0_20px_rgba(217,4,41,0.4)] text-xs inline-block">
                        Khám phá thêm
                      </span>
                    </div>
                  </div>

                  {/* Left Navigation Arrow */}
                  <button
                    onClick={handlePrevBanner}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-slate-900/70 hover:bg-red-600 text-white backdrop-blur-md transition-all duration-300 border border-white/20 hover:border-red-600 shadow-lg cursor-pointer"
                    title="Banner trước"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Right Navigation Arrow */}
                  <button
                    onClick={handleNextBanner}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-slate-900/70 hover:bg-red-600 text-white backdrop-blur-md transition-all duration-300 border border-white/20 hover:border-red-600 shadow-lg cursor-pointer"
                    title="Banner kế tiếp"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="h-[360px] flex items-center justify-center text-slate-400 text-xs font-bold">
                  Vui lòng chọn 1 banner trong danh sách bên trái để xem trước.
                </div>
              )}

              {/* Bottom Quick Info & Status Bar */}
              {selectedBanner && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-bold">
                        Thứ tự: #{selectedBanner.sortOrder}
                      </span>

                      {selectedBanner.isActive ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đang Hiển Thị Trang Chủ
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 text-[11px] font-extrabold flex items-center gap-1">
                          <EyeOff className="w-3.5 h-3.5" /> Đang Ẩn
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(selectedBanner)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          selectedBanner.isActive
                            ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            : 'bg-emerald-600 text-white shadow-xs'
                        }`}
                      >
                        {selectedBanner.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{selectedBanner.isActive ? 'Tắt Ẩn' : 'Bật Hiển Thị'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(selectedBanner)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Chỉnh Sửa</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11px]">
                    <div>
                      <span className="font-bold text-slate-700 block">Mô Tả Quảng Cáo / Ghi Chú:</span>
                      <span className="truncate block">{selectedBanner.description || 'Chưa có mô tả'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block">Link Chuyển Hướng:</span>
                      <span className="font-mono text-red-600 truncate block">{selectedBanner.linkUrl || '/products'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-600" />
                <span>{editingBanner ? 'Chỉnh Sửa Banner Quảng Cáo' : 'Thêm Banner Quảng Cáo Mới'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên Tiêu Đề Quảng Cáo (*)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="vd: ĐỘNG CƠ & MÁY PHÁT"
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* Image Uploader & Preview Box */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-red-600" />
                  <span>Hình Ảnh Banner Quảng Cáo (*)</span>
                </label>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  {imageUrl ? (
                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200">
                      <div className="w-20 h-20 relative rounded-md overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                        <Image
                          src={formatImageUrl(imageUrl)}
                          alt="Banner Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block font-bold text-slate-800 truncate text-[11px]">{imageUrl}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">Đã lưu tệp ảnh</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-red-500 rounded-xl cursor-pointer bg-white transition-colors">
                      {uploading ? (
                        <div className="flex items-center gap-2 text-red-600 font-bold">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Đang tải ảnh lên...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-400 mb-1" />
                          <span className="font-bold text-slate-700 text-xs">Tải Ảnh Mới Lên</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP (Tối đa 5MB)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mô Tả Quảng Cáo / Ghi Chú
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập câu giới thiệu quảng cáo sản phẩm phụ tùng..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Đường Dẫn Chuyển Hướng (Link)
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="/products"
                    className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Thứ Tự Ưu Tiên (Sort Order)
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formLoading || uploading}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-900/30 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{formLoading ? 'Đang lưu...' : editingBanner ? 'Cập Nhật Banner' : 'Thêm Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM LUXURIOUS DELETE CONFIRMATION MODAL */}
      {deleteConfirmBanner && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Header Icon & Title */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-100 border-4 border-red-50 text-red-600 flex items-center justify-center shadow-inner">
                <Trash2 className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Xác Nhận Xóa Banner Quảng Cáo
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Bạn có chắc chắn muốn xóa vĩnh viễn banner quảng cáo bên dưới khỏi hệ thống và trang chủ không?
                </p>
              </div>
            </div>

            {/* Target Item Thumbnail & Details */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shrink-0">
                <Image
                  src={formatImageUrl(deleteConfirmBanner.imageUrl)}
                  alt={deleteConfirmBanner.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase truncate">
                  {deleteConfirmBanner.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {deleteConfirmBanner.description || 'Chưa có mô tả'}
                </p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  Thứ tự: #{deleteConfirmBanner.sortOrder}
                </span>
              </div>
            </div>

            {/* Warning Alert Note */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-800 text-[11px] font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Hành động xóa này không thể hoàn tác. Các dữ liệu liên quan sẽ bị loại bỏ.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmBanner(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={confirmDeleteBanner}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang Xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa Banner</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
