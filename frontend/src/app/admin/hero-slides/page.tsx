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

interface HeroSlide {
  id: number;
  title: string;
  imageUrl: string;
  altText?: string | null;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [selectedSlideId, setSelectedSlideId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [linkUrl, setLinkUrl] = useState('/products');
  const [sortOrder, setSortOrder] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Custom Delete Modal State
  const [deleteConfirmSlide, setDeleteConfirmSlide] = useState<HeroSlide | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await AdminApiService.getHeroSlidesAdmin();
      if (res.ok && Array.isArray(res.data)) {
        setSlides(res.data);
        if (res.data.length > 0) {
          setSelectedSlideId((prev) =>
            prev && res.data.some((s: any) => s.id === prev) ? prev : res.data[0].id
          );
        } else {
          setSelectedSlideId(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch hero slides:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const selectedSlide = slides.find((s) => s.id === selectedSlideId) || slides[0] || null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePrevSlide = () => {
    if (slides.length === 0) return;
    const currentIndex = slides.findIndex((s) => s.id === selectedSlide?.id);
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    setSelectedSlideId(slides[prevIndex].id);
  };

  const handleNextSlide = () => {
    if (slides.length === 0) return;
    const currentIndex = slides.findIndex((s) => s.id === selectedSlide?.id);
    const nextIndex = (currentIndex + 1) % slides.length;
    setSelectedSlideId(slides[nextIndex].id);
  };

  const handleOpenAddModal = () => {
    setEditingSlide(null);
    setTitle('');
    setImageUrl('');
    setAltText('');
    setLinkUrl('/products');
    setSortOrder(slides.length + 1);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (s: HeroSlide) => {
    setEditingSlide(s);
    setTitle(s.title);
    setImageUrl(s.imageUrl);
    setAltText(s.altText || '');
    setLinkUrl(s.linkUrl || '/products');
    setSortOrder(s.sortOrder || 0);
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
          setErrorMsg(res.message || 'Upload ảnh slide thất bại');
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
      setErrorMsg('Vui lòng nhập tên tiêu đề chữ đỏ cho slide');
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMsg('Vui lòng tải ảnh banner slide lên');
      return;
    }

    setFormLoading(true);
    setErrorMsg(null);

    try {
      if (editingSlide) {
        const res = await AdminApiService.updateHeroSlide(editingSlide.id, {
          title: title.trim().toUpperCase(),
          imageUrl: imageUrl.trim(),
          altText: altText.trim() || undefined,
          linkUrl: linkUrl.trim() || '/products',
          sortOrder: Number(sortOrder) || 0,
        });

        if (res.ok) {
          showToast('Đã cập nhật slide banner thành công');
          setShowModal(false);
          fetchSlides();
        } else {
          setErrorMsg(res.message || 'Cập nhật thất bại');
        }
      } else {
        const res = await AdminApiService.createHeroSlide({
          title: title.trim().toUpperCase(),
          imageUrl: imageUrl.trim(),
          altText: altText.trim() || undefined,
          linkUrl: linkUrl.trim() || '/products',
          sortOrder: Number(sortOrder) || 0,
        });

        if (res.ok) {
          showToast('Đã thêm slide banner mới');
          setShowModal(false);
          fetchSlides();
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

  const handleToggleActive = async (s: HeroSlide) => {
    try {
      const res = await AdminApiService.updateHeroSlide(s.id, {
        isActive: !s.isActive,
      });
      if (res.ok) {
        showToast(s.isActive ? 'Đã ẩn slide' : 'Đã hiển thị slide');
        fetchSlides();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteSlide = async () => {
    if (!deleteConfirmSlide) return;
    setDeleteLoading(true);

    try {
      const res = await AdminApiService.deleteHeroSlide(deleteConfirmSlide.id);
      if (res.ok) {
        showToast('Đã xóa slide banner thành công');
        setDeleteConfirmSlide(null);
        fetchSlides();
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
              HERO SLIDER BANNER
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Quản Lý Slide Banner Đầu Trang Chủ
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý danh sách slide ở bên trái và xem trước giao diện trực tiếp ở bên phải.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-900/30 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Slide Banner Mới</span>
        </button>
      </div>

      {/* Main Master-Detail Content */}
      {loading ? (
        <div className="flex items-center justify-center p-20 bg-white rounded-2xl border border-slate-200">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <span className="text-xs font-bold text-slate-500">Đang tải danh sách slide banner...</span>
          </div>
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-2xl border border-slate-200 space-y-3">
          <Sliders className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Chưa Có Slide Banner Nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy bấm nút "Thêm Slide Banner Mới" ở trên để khởi tạo hình ảnh slide đầu tiên cho đầu Trang Chủ.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: LIST OF SLIDES (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-600" />
                <span>Danh Sách Slide ({slides.length})</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Chọn slide để xem trước ➔</span>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {slides.map((s) => {
                const isSelected = selectedSlide?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSlideId(s.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white flex items-center gap-3 relative overflow-hidden group ${
                      isSelected
                        ? 'border-red-500 shadow-md ring-2 ring-red-500/20 bg-red-50/10'
                        : s.isActive
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
                        src={formatImageUrl(s.imageUrl)}
                        alt={s.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-bold">
                        #{s.sortOrder}
                      </span>
                    </div>

                    {/* Slide Information */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-black text-red-600 italic text-sm uppercase truncate font-heading pr-3.5 inline-block">
                          {s.title}
                        </h4>
                        {s.isActive ? (
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
                        {s.altText || `Phụ tùng ${s.title}`}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono truncate">
                        <LinkIcon className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{s.linkUrl || '/products'}</span>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex flex-col gap-1.5 shrink-0 pl-2 border-l border-slate-100" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          s.isActive
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={s.isActive ? 'Tắt ẩn slide' : 'Hiển thị slide'}
                      >
                        {s.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(s)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                        title="Sửa slide"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmSlide(s)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                        title="Xóa slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE PREVIEW SLIDE (lg:col-span-7) */}
          <div className="lg:col-span-7 sticky top-20 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Preview Top Control Bar */}
              <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-red-500" />
                  <span className="font-extrabold text-xs tracking-wide">
                    XEM TRƯỚC SLIDE BANNER TẠI TRANG CHỦ
                  </span>
                </div>

                {selectedSlide && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      Slide {slides.findIndex((s) => s.id === selectedSlide.id) + 1} / {slides.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handlePrevSlide}
                        className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                        title="Slide trước"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleNextSlide}
                        className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                        title="Slide kế tiếp"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Slide Preview Viewport Box (Exact Homepage Look) */}
              {selectedSlide ? (
                <div className="relative h-[360px] sm:h-[440px] bg-slate-950 overflow-hidden group select-none">
                  {/* Background Image */}
                  <Image
                    src={formatImageUrl(selectedSlide.imageUrl)}
                    alt={selectedSlide.title}
                    fill
                    priority
                    className="object-cover"
                  />

                  {/* Gradient Shadow Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  {/* Hero Title - Exact Homepage Styling: "PHỤ TÙNG | [RED TEXT]" */}
                  <div className="absolute bottom-12 sm:bottom-16 left-6 sm:left-10 z-10">
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-wider font-heading leading-tight flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-1">
                      <span className="text-black drop-shadow-[0_2px_8px_rgba(255,255,255,0.7)] flex items-center gap-2.5 sm:gap-3">
                        <span>PHỤ TÙNG</span>
                        <span className="text-black font-light not-italic">|</span>
                      </span>

                      <span className="text-[#FF0000] drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)] whitespace-nowrap pr-4 inline-block">
                        {selectedSlide.title}
                      </span>
                    </h2>
                  </div>

                  {/* Bottom Center Pagination Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                    {slides.map((s) => (
                      <button
                        key={`dot-${s.id}`}
                        onClick={() => setSelectedSlideId(s.id)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          s.id === selectedSlide.id
                            ? 'w-7 bg-[#FF0000] shadow-md'
                            : 'w-2 bg-white/60 hover:bg-white'
                        }`}
                        title={`Xem slide: ${s.title}`}
                      />
                    ))}
                  </div>

                  {/* Left Arrow Button */}
                  <button
                    onClick={handlePrevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-slate-900/60 hover:bg-red-600 text-white backdrop-blur-md transition-all duration-300 border border-white/20 hover:border-red-600 shadow-lg cursor-pointer"
                    title="Slide trước"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Right Arrow Button */}
                  <button
                    onClick={handleNextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-slate-900/60 hover:bg-red-600 text-white backdrop-blur-md transition-all duration-300 border border-white/20 hover:border-red-600 shadow-lg cursor-pointer"
                    title="Slide kế tiếp"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="h-[360px] flex items-center justify-center text-slate-400 text-xs font-bold">
                  Vui lòng chọn 1 slide trong danh sách bên trái để xem trước.
                </div>
              )}

              {/* Bottom Quick Info & Status Bar */}
              {selectedSlide && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-bold">
                        Thứ tự: #{selectedSlide.sortOrder}
                      </span>

                      {selectedSlide.isActive ? (
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
                        onClick={() => handleToggleActive(selectedSlide)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          selectedSlide.isActive
                            ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            : 'bg-emerald-600 text-white shadow-xs'
                        }`}
                      >
                        {selectedSlide.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{selectedSlide.isActive ? 'Tắt Ẩn' : 'Bật Hiển Thị'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(selectedSlide)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Chỉnh Sửa</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11px]">
                    <div>
                      <span className="font-bold text-slate-700 block">Mô Tả / Alt Text:</span>
                      <span className="truncate block">{selectedSlide.altText || 'Chưa có mô tả'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block">Link Chuyển Hướng:</span>
                      <span className="font-mono text-red-600 truncate block">{selectedSlide.linkUrl || '/products'}</span>
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
                <span>{editingSlide ? 'Chỉnh Sửa Slide Banner' : 'Thêm Slide Banner Mới'}</span>
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
                  Tên Chữ Đỏ Nổi Bật Slide (Chủng Loại Phụ Tùng) (*)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="vd: XE BEN, HỘP SỐ, ĐỘNG CƠ MÁY PHÁT..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-red-600 font-black italic pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* Image Uploader & Preview Box */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-red-600" />
                  <span>Hình Ảnh Banner Slide (*)</span>
                </label>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  {imageUrl ? (
                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200">
                      <div className="w-20 h-20 relative rounded-md overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                        <Image
                          src={formatImageUrl(imageUrl)}
                          alt="Slide Preview"
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
                  Mô Tả Tóm Tắt (Alt Text)
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="vd: Phụ tùng xe ben chính hãng HOWO..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
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
                  <span>{formLoading ? 'Đang lưu...' : editingSlide ? 'Cập Nhật Slide' : 'Thêm Slide'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM LUXURIOUS DELETE CONFIRMATION MODAL */}
      {deleteConfirmSlide && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Header Icon & Title */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-100 border-4 border-red-50 text-red-600 flex items-center justify-center shadow-inner">
                <Trash2 className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Xác Nhận Xóa Slide Banner
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Bạn có chắc chắn muốn xóa vĩnh viễn slide banner bên dưới khỏi đầu trang chủ không?
                </p>
              </div>
            </div>

            {/* Target Item Thumbnail & Details */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shrink-0">
                <Image
                  src={formatImageUrl(deleteConfirmSlide.imageUrl)}
                  alt={deleteConfirmSlide.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-black text-red-600 italic text-sm uppercase truncate font-heading pr-3.5 inline-block">
                  {deleteConfirmSlide.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {deleteConfirmSlide.altText || 'Chưa có mô tả'}
                </p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  Thứ tự: #{deleteConfirmSlide.sortOrder}
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
                onClick={() => setDeleteConfirmSlide(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={confirmDeleteSlide}
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
                    <span>Xóa Slide</span>
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
