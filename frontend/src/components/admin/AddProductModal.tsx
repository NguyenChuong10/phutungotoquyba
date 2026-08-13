'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, FileText, ImageIcon, Upload, Loader2, Trash2, Star } from 'lucide-react';
import { AdminApiService } from '@/services/adminApiService';
import { formatImageUrl } from '@/utils/imageHelper';

interface SubCategory {
  id: number;
  name: string;
  slug: string;
}

interface ProductItem {
  id: number;
  name: string;
  internalName: string;
  internalCode: string;
  partNumber: string;
  brand: string;
  brandId?: number;
  stock: number;
  price: string;
  costPrice: string;
  description: string;
  image: string;
  material?: string;
  qualityStandard?: string;
  specifications?: Record<string, string>;
  rawProduct?: any;
}

interface AddProductModalProps {
  activeSubModal: SubCategory;
  editingProduct: ProductItem | null;
  onClose: () => void;
  onSave: () => void;
}

interface ProductImageItem {
  imageUrl: string;
  isPrimary: boolean;
}

export default function AddProductModal({
  activeSubModal,
  editingProduct,
  onClose,
  onSave,
}: AddProductModalProps) {
  const [partNo, setPartNo] = useState(editingProduct?.partNumber || '');
  const [publicName, setPublicName] = useState(editingProduct?.name || '');
  const [internalCode, setInternalCode] = useState(
    editingProduct?.internalCode || `QB-SKU-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [internalName, setInternalName] = useState(editingProduct?.internalName || '');
  
  const [brandsList, setBrandsList] = useState<{ id: number; name: string }[]>([
    { id: 55, name: 'HOWO Sinotruk' },
    { id: 2, name: 'Weichai Power' },
    { id: 57, name: 'Fast Gear' },
    { id: 58, name: 'Shacman' },
    { id: 10, name: 'FAW Group' },
    { id: 11, name: 'Dongfeng Commercial' },
    { id: 12, name: 'Yuchai Machinery' },
  ]);
  const [selectedBrandId, setSelectedBrandId] = useState<number>(editingProduct?.brandId || 55);

  const [stock, setStock] = useState(editingProduct?.stock || 10);
  const [material, setMaterial] = useState(
    editingProduct?.material ||
      editingProduct?.specifications?.['Chất liệu'] ||
      editingProduct?.specifications?.['Chất liệu đúc/sản xuất'] ||
      ''
  );
  const [description, setDescription] = useState(editingProduct?.description || '');

  // Multi-Image Gallery State
  const initialImages: ProductImageItem[] = editingProduct?.rawProduct?.images?.map((img: any, idx: number) => ({
    imageUrl: img.imageUrl,
    isPrimary: img.isPrimary ?? idx === 0,
  })) || [
    { imageUrl: editingProduct?.image || '/images/vehicle-category/dongco.png', isPrimary: true }
  ];

  const [imageList, setImageList] = useState<ProductImageItem[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadBrands() {
      try {
        const res = await AdminApiService.getBrands();
        if (res.ok && res.data && res.data.length > 0) {
          const list = res.data.map((b: any) => ({ id: b.id, name: b.name }));
          setBrandsList(list);
          if (editingProduct?.brandId) {
            setSelectedBrandId(editingProduct.brandId);
          } else if (editingProduct?.brand) {
            const matched = list.find((b: any) => b.name.toLowerCase() === editingProduct.brand.toLowerCase());
            if (matched) setSelectedBrandId(matched.id);
            else if (list[0]) setSelectedBrandId(list[0].id);
          } else if (list[0]) {
            setSelectedBrandId(list[0].id);
          }
        }
      } catch {}
    }
    loadBrands();
  }, [editingProduct]);

  // Handle Multi-file Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setUploading(true);
      setErrorMsg(null);

      try {
        const res = await AdminApiService.uploadMultipleProductImages(files);
        if (res.ok && res.data && res.data.length > 0) {
          const newImages: ProductImageItem[] = res.data.map((item: any, idx: number) => ({
            imageUrl: item.imageUrl,
            isPrimary: imageList.length === 0 && idx === 0,
          }));
          setImageList((prev) => {
            const combined = [...prev, ...newImages].slice(0, 5); // Limit max 5 images
            if (!combined.some((img) => img.isPrimary) && combined.length > 0) {
              combined[0].isPrimary = true;
            }
            return combined;
          });
        } else {
          setErrorMsg(res.message || 'Upload ảnh thất bại. Vui lòng thử lại.');
        }
      } catch {
        setErrorMsg('Không thể tải ảnh lên máy chủ Express backend.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageList((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setImageList((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }))
    );
  };

  const handleSaveProduct = async () => {
    if (!partNo.trim() || !publicName.trim() || !internalCode.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ các trường (*)');
      return;
    }

    if (imageList.length === 0) {
      setErrorMsg('Vui lòng upload ít nhất 1 hình ảnh phụ tùng!');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const specsObject: Record<string, string> = {
      'Mã Phụ Tùng (Part No.)': partNo.trim(),
      'Chất liệu': material.trim() || 'Thép đúc hợp kim cao cấp',
    };

    const formattedImagesPayload = imageList.map((img, idx) => ({
      imageUrl: img.imageUrl,
      isPrimary: img.isPrimary,
      sortOrder: idx,
    }));

    const payload = {
      name: publicName.trim(),
      partNumber: partNo.trim(),
      internalCode: internalCode.trim(),
      internalName: internalName.trim() || publicName.trim(),
      categoryId: activeSubModal.id,
      brandId: Number(selectedBrandId) || brandsList[0]?.id || 55,
      price: 0,
      costPrice: 0,
      stockQuantity: Number(stock) || 0,
      inStock: Number(stock) > 0,
      qualityStandard: 'Loại 1 Cao Cấp',
      specifications: specsObject,
      description: description.trim() || undefined,
      images: formattedImagesPayload,
    };

    try {
      if (editingProduct) {
        const res = await AdminApiService.updateProduct(editingProduct.id, payload);
        if (res.ok) {
          onSave();
        } else {
          const detailErr = res.error?.message || res.message || 'Cập nhật sản phẩm thất bại';
          setErrorMsg(detailErr);
        }
      } else {
        const res = await AdminApiService.createProduct(payload);
        if (res.ok) {
          onSave();
        } else {
          const detailErr = res.error?.message || res.message || 'Thêm sản phẩm mới thất bại';
          setErrorMsg(detailErr);
        }
      }
    } catch {
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>{editingProduct ? 'Chỉnh Sửa Sản Phẩm & Ảnh SEO' : 'Thêm Sản Phẩm Mới'}</span>
            </h3>
            <p className="text-xs text-red-600 font-bold mt-0.5">
              Danh mục phụ: {activeSubModal.name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mã Part No. (*)</label>
              <input
                type="text"
                required
                value={partNo}
                onChange={(e) => setPartNo(e.target.value)}
                placeholder="HW19710-TB01"
                className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold focus:ring-2 focus:ring-red-500/20"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mã Nội Bộ Q.BA (*)</label>
              <input
                type="text"
                required
                value={internalCode}
                onChange={(e) => setInternalCode(e.target.value)}
                placeholder="QB-TB-19710-01"
                className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold bg-slate-50 focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tên Sản Phẩm Công Khai (*)</label>
            <input
              type="text"
              required
              value={publicName}
              onChange={(e) => setPublicName(e.target.value)}
              placeholder="Tên khách hàng xem trên web..."
              className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tên Phụ Tùng Nội Bộ (Kho)</label>
            <input
              type="text"
              value={internalName}
              onChange={(e) => setInternalName(e.target.value)}
              placeholder="Tên thợ kho gọi..."
              className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Thương Hiệu</label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold bg-white"
              >
                {brandsList.map((b) => (
                  <option key={`brand-opt-${b.id}`} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Số Lượng Tồn Kho (≥ 0)</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Chất Liệu Phụ Tùng (*)</label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="Thép rèn đúc AC16, Viton chịu nhiệt, Gang đúc xám, Nhôm đúc..."
              className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-red-600" />
              <span>Mô Tả Chi Tiết Phụ Tùng</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập thông số kỹ thuật, chất liệu đúc, ứng dụng dòng xe, xuất xứ nhà máy..."
              className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-red-600" />
                <span>Bộ Ảnh Phụ Tùng Chuẩn SEO ({imageList.length}/5 Ảnh)</span>
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">
                ⭐ Click icon Sao để chọn Ảnh Chính
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Upload Button */}
              {imageList.length < 5 && (
                <label className="h-20 w-24 rounded-xl bg-white border-2 border-dashed border-red-400 hover:border-red-600 text-red-600 font-bold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{uploading ? 'Đang Upload...' : '+ Chọn Nhiều Ảnh'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              {/* Uploaded Images Thumbnails Grid */}
              {imageList.map((img, idx) => (
                <div
                  key={`img-thumb-${idx}-${img.imageUrl}`}
                  className={`relative h-20 w-20 rounded-xl bg-white border-2 overflow-hidden flex-shrink-0 shadow-2xs transition-all group ${
                    img.isPrimary ? 'border-red-600 ring-2 ring-red-500/20' : 'border-slate-300'
                  }`}
                >
                  <Image
                    src={formatImageUrl(img.imageUrl)}
                    alt={`Preview ${idx + 1}`}
                    fill
                    unoptimized
                    sizes="80px"
                    className="object-cover"
                  />

                  {/* Primary Star Badge */}
                  <button
                    type="button"
                    onClick={() => handleSetPrimaryImage(idx)}
                    title={img.isPrimary ? 'Ảnh chính hiển thị đầu tiên' : 'Bấm để đặt làm Ảnh Chính'}
                    className={`absolute top-1 left-1 p-1 rounded-md text-[9px] font-bold flex items-center gap-0.5 shadow-sm transition-all cursor-pointer ${
                      img.isPrimary
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-900/70 text-slate-300 hover:bg-red-600 hover:text-white opacity-80 group-hover:opacity-100'
                    }`}
                  >
                    <Star className={`w-3 h-3 ${img.isPrimary ? 'fill-amber-300 text-amber-300' : ''}`} />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    title="Xóa ảnh này"
                    className="absolute top-1 right-1 p-1 rounded-md bg-slate-900/80 hover:bg-red-700 text-white shadow-sm transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {/* Primary Footer Badge */}
                  {img.isPrimary && (
                    <div className="absolute bottom-0 inset-x-0 bg-red-600 text-white text-[8px] font-black text-center py-0.5 uppercase tracking-wider">
                      ★ Ảnh Chính
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveProduct}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-900/30 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{saving ? 'Đang lưu...' : 'Lưu Phụ Tùng & Ảnh SEO'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
