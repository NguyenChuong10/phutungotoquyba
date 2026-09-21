"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AdminApiService } from "@/services/adminApiService";
import { Plus, Trash2, Save, GripVertical, Image as ImageIcon, Upload, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import ToastNotification, { ToastMessage } from "@/components/ui/ToastNotification";
import { formatImageUrl } from "@/utils/imageHelper";

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title: string;
  desc: string;
}

export default function AboutGalleryAdminPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [toastState, setToastState] = useState<ToastMessage | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await AdminApiService.getSettings();
      if (res.ok && res.data?.aboutGalleryImages) {
        const parsed = JSON.parse(res.data.aboutGalleryImages);
        setImages(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
      setToastState({
        id: Date.now().toString(),
        type: "error",
        title: "Lỗi Tải Dữ Liệu",
        message: "Không thể tải danh sách hình ảnh từ máy chủ.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (customImages?: GalleryImage[]) => {
    const dataToSave = customImages || images;
    try {
      setSaving(true);
      const res = await AdminApiService.updateSettings({
        aboutGalleryImages: JSON.stringify(dataToSave),
      });

      if (res.ok) {
        setToastState({
          id: Date.now().toString(),
          type: "success",
          title: "Lưu Thành Công",
          message: "Đã cập nhật bộ sưu tập hình ảnh trang Giới Thiệu.",
        });
      } else {
        throw new Error(res.message || "Lỗi lưu cấu hình");
      }
    } catch (error: any) {
      setToastState({
        id: Date.now().toString(),
        type: "error",
        title: "Lỗi Lưu Cấu Hình",
        message: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = () => {
    const newImage: GalleryImage = {
      id: `img-${Date.now()}`,
      src: "",
      alt: "Hình ảnh kho hàng Q.BA",
      title: "Tiêu đề mới",
      desc: "Mô tả chi tiết hình ảnh",
    };
    setImages([...images, newImage]);
  };

  const handleDeleteImage = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa hình ảnh này khỏi bộ sưu tập?")) {
      setImages(images.filter((img) => img.id !== id));
    }
  };

  const handleMoveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    if (direction === "up" && index > 0) {
      const temp = newImages[index];
      newImages[index] = newImages[index - 1];
      newImages[index - 1] = temp;
    } else if (direction === "down" && index < newImages.length - 1) {
      const temp = newImages[index];
      newImages[index] = newImages[index + 1];
      newImages[index + 1] = temp;
    }
    setImages(newImages);
  };

  const handleUpdateImage = (id: string, field: keyof GalleryImage, value: string) => {
    setImages(images.map((img) => (img.id === id ? { ...img, [field]: value } : img)));
  };

  const handleUploadImage = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingId(id);
      const res = await AdminApiService.uploadImage(file);
      const uploadedUrl = res.data?.imageUrl || res.url || res.data?.url;
      
      if (res.ok && uploadedUrl) {
        const nextImages = images.map((img) => (img.id === id ? { ...img, src: uploadedUrl } : img));
        setImages(nextImages);
        await handleSave(nextImages);
      } else {
        throw new Error(res.message || "Lỗi upload ảnh");
      }
    } catch (err: any) {
      setToastState({
        id: Date.now().toString(),
        type: "error",
        title: "Lỗi Upload",
        message: err.message,
      });
    } finally {
      setUploadingId(null);
      e.target.value = ""; // Reset input
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-sm">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <ToastNotification toast={toastState} onClose={() => setToastState(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <ImageIcon className="text-[#D90429] w-7 h-7" />
            Quản Lý Ảnh Giới Thiệu
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Tùy chỉnh danh sách hình ảnh tại phần "Năng lực thực tế" trên trang Khách Hàng.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleAddImage}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
          >
            <Plus size={18} />
            Thêm Ảnh
          </button>
          
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#D90429] hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/20 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
            {saving ? "Đang Lưu..." : "Lưu Thay Đổi"}
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img, index) => (
          <div key={img.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group">
            
            {/* Image Preview & Upload Container */}
            <div className="relative aspect-[4/3] bg-slate-100 flex-shrink-0 group-hover:bg-slate-200 transition-colors">
              {img.src ? (
                <Image
                  src={formatImageUrl(img.src)}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-xs font-bold uppercase tracking-widest">Chưa có ảnh</span>
                </div>
              )}

              {/* Upload Overlay (Hover) */}
              <label className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer z-10">
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                  onChange={(e) => handleUploadImage(img.id, e)}
                  disabled={uploadingId === img.id}
                />
                {uploadingId === img.id ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-white" />
                    <span className="text-sm font-bold">Đang tải lên...</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">Tải Ảnh Lên</span>
                  </>
                )}
              </label>

              {/* Toolbar */}
              <div className="absolute top-3 right-3 left-3 flex justify-between items-center z-20 pointer-events-none">
                <div className="flex gap-1.5 pointer-events-auto">
                  <button
                    onClick={() => handleMoveImage(index, "up")}
                    disabled={index === 0}
                    className="w-8 h-8 rounded-lg bg-white/90 text-slate-700 hover:bg-white hover:text-red-600 flex items-center justify-center shadow-sm disabled:opacity-30 transition-colors"
                    title="Di chuyển lên"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => handleMoveImage(index, "down")}
                    disabled={index === images.length - 1}
                    className="w-8 h-8 rounded-lg bg-white/90 text-slate-700 hover:bg-white hover:text-red-600 flex items-center justify-center shadow-sm disabled:opacity-30 transition-colors"
                    title="Di chuyển xuống"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="w-8 h-8 rounded-lg bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-sm transition-colors pointer-events-auto"
                  title="Xóa hình ảnh"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="p-4 space-y-3 flex-1 flex flex-col">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Tiêu đề ảnh (Hiển thị to)</label>
                <input
                  type="text"
                  value={img.title}
                  onChange={(e) => handleUpdateImage(img.id, "title", e.target.value)}
                  placeholder="Nhập tiêu đề..."
                  className="w-full text-sm font-bold text-slate-900 border-b-2 border-slate-100 focus:border-red-500 focus:outline-none py-1.5 transition-colors bg-transparent"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Mô tả ngắn (Hiển thị nhỏ)</label>
                <textarea
                  value={img.desc}
                  onChange={(e) => handleUpdateImage(img.id, "desc", e.target.value)}
                  placeholder="Nhập mô tả..."
                  rows={2}
                  className="w-full text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Thẻ ALT (Dùng cho SEO)</label>
                <input
                  type="text"
                  value={img.alt}
                  onChange={(e) => handleUpdateImage(img.id, "alt", e.target.value)}
                  placeholder="Văn bản thay thế..."
                  className="w-full text-xs text-slate-600 font-medium border-b border-slate-100 focus:border-red-500 focus:outline-none py-1 transition-colors bg-transparent"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add New Placeholder */}
        <button
          onClick={handleAddImage}
          className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-slate-400 hover:text-[#D90429] hover:border-[#D90429] hover:bg-red-50/50 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-white border border-slate-200 group-hover:border-red-200 flex items-center justify-center shadow-xs mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-bold uppercase tracking-wider text-sm">Thêm Hình Ảnh</span>
        </button>
      </div>
    </div>
  );
}
