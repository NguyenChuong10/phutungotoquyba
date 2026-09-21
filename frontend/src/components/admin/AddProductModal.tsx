'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import ImagePreviewModal from '@/components/ui/ImagePreviewModal';
import { Sparkles, FileText, ImageIcon, Upload, Loader2, Trash2, Star, ZoomIn, ChevronLeft, ChevronRight, GripVertical, Search, ChevronDown, Check } from 'lucide-react';
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
  
  const [brandsList, setBrandsList] = useState<{ id: number; name: string }[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number>(editingProduct?.brandId || 0);

  const [categoriesTree, setCategoriesTree] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(
    editingProduct?.rawProduct?.categoryId || activeSubModal?.id || 0
  );

  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [catSearchQuery, setCatSearchQuery] = useState('');

  const selectedCatInfo = useMemo(() => {
    for (const main of categoriesTree) {
      if (main.children && main.children.length > 0) {
        const found = main.children.find((sub: any) => sub.id === Number(selectedCategoryId));
        if (found) {
          return {
            subName: found.name,
            mainName: main.name,
            fullLabel: `${main.name} ➔ ${found.name}`,
          };
        }
      }
    }
    return null;
  }, [categoriesTree, selectedCategoryId]);

  const filteredCategoriesTree = useMemo(() => {
    const q = catSearchQuery.toLowerCase().trim();
    if (!q) return categoriesTree;

    return categoriesTree
      .map((main: any) => {
        const mainMatches = main.name.toLowerCase().includes(q);
        const matchingChildren = (main.children || []).filter((sub: any) =>
          sub.name.toLowerCase().includes(q)
        );

        if (mainMatches || matchingChildren.length > 0) {
          return {
            ...main,
            children: mainMatches ? main.children : matchingChildren,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [categoriesTree, catSearchQuery]);

  const [stock, setStock] = useState<number>(
    editingProduct?.stock ?? editingProduct?.rawProduct?.stockQuantity ?? 0
  );
  const [qualityStandard, setQualityStandard] = useState(
    editingProduct?.rawProduct?.qualityStandard ??
      editingProduct?.qualityStandard ??
      ''
  );
  const [material, setMaterial] = useState(
    editingProduct?.material ||
      editingProduct?.specifications?.['Chất liệu'] ||
      editingProduct?.specifications?.['Chất liệu đúc/sản xuất'] ||
      ''
  );
  const [description, setDescription] = useState(editingProduct?.description || '');

  // Multi-Image Gallery State
  const initialImages: ProductImageItem[] = (() => {
    const rawImgs = editingProduct?.rawProduct?.images || (editingProduct as any)?.images;
    if (Array.isArray(rawImgs) && rawImgs.length > 0) {
      const mapped = rawImgs.map((img: any, idx: number) => ({
        imageUrl: typeof img === 'string' ? img : img.imageUrl,
        isPrimary: Boolean(typeof img === 'string' ? idx === 0 : (img.isPrimary ?? idx === 0)),
      }));
      if (!mapped.some((m) => m.isPrimary) && mapped.length > 0) {
        mapped[0].isPrimary = true;
      }
      return mapped;
    }
    if (editingProduct?.image) {
      return [{ imageUrl: editingProduct.image, isPrimary: true }];
    }
    return [{ imageUrl: '/images/logo/logonen.png', isPrimary: true }];
  })();

  const [imageList, setImageList] = useState<ProductImageItem[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [brandsRes, catData] = await Promise.all([
          AdminApiService.getBrands(),
          AdminApiService.getCategoriesTree(),
        ]);

        const rawList = brandsRes?.data && Array.isArray(brandsRes.data) ? brandsRes.data : [];
        const list = rawList.map((b: any) => ({ id: b.id, name: b.name }));

        if (list.length > 0) {
          setBrandsList(list);
          if (editingProduct?.brandId) {
            setSelectedBrandId(editingProduct.brandId);
          } else if (editingProduct?.brand) {
            const matched = list.find((b: any) => b.name.toLowerCase() === editingProduct.brand.toLowerCase());
            if (matched) setSelectedBrandId(matched.id);
            else setSelectedBrandId(0);
          } else {
            setSelectedBrandId(0);
          }
        }

        if (catData && catData.length > 0) {
          setCategoriesTree(catData);

          const validSubIds: number[] = [];
          catData.forEach((main: any) => {
            if (main.children && main.children.length > 0) {
              main.children.forEach((sub: any) => validSubIds.push(sub.id));
            }
          });

          if (editingProduct?.rawProduct?.categoryId && validSubIds.includes(editingProduct.rawProduct.categoryId)) {
            setSelectedCategoryId(editingProduct.rawProduct.categoryId);
          } else if (activeSubModal?.id && validSubIds.includes(activeSubModal.id)) {
            setSelectedCategoryId(activeSubModal.id);
          } else if (validSubIds.length > 0) {
            setSelectedCategoryId(validSubIds[0]);
          }
        }
      } catch {}
    }
    loadData();
  }, [editingProduct, activeSubModal]);

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
          const rawMsg = res.message || 'Upload ảnh thất bại. Vui lòng thử lại.';
          const cleanMsg = (rawMsg.includes('is not valid JSON') || rawMsg.includes('Unexpected token'))
            ? 'Dung lượng các tệp ảnh quá lớn (vượt quá 10MB) hoặc không đúng định dạng. Vui lòng chọn các tệp ảnh nhẹ hơn!'
            : rawMsg;
          setErrorMsg(cleanMsg);
        }
      } catch (err: any) {
        const rawMsg = err?.message || '';
        const cleanMsg = (rawMsg.includes('is not valid JSON') || rawMsg.includes('Unexpected token'))
          ? 'Dung lượng các tệp ảnh quá lớn (vượt quá 10MB) hoặc không đúng định dạng. Vui lòng chọn các tệp ảnh nhẹ hơn!'
          : 'Không thể tải ảnh lên máy chủ Express backend.';
        setErrorMsg(cleanMsg);
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

  // Reorder / Drag & Drop Image Handlers
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleMoveImage = (fromIndex: number, direction: 'left' | 'right') => {
    setDraggedIndex(null);
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= imageList.length) return;

    setImageList((prev) => {
      const next = [...prev];
      const temp = next[fromIndex];
      next[fromIndex] = next[toIndex];
      next[toIndex] = temp;
      return next;
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    setImageList((prev) => {
      const next = [...prev];
      const [draggedItem] = next.splice(draggedIndex, 1);
      next.splice(index, 0, draggedItem);
      return next;
    });
    setDraggedIndex(null);
  };

  const handleSaveProduct = async () => {
    if (!publicName.trim() || !internalCode.trim() || !internalName.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ 3 trường bắt buộc (*): Tên sản phẩm công khai, Tên phụ tùng nội bộ kho, và Mã nội bộ Q.BA!');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const partNoVal = partNo.trim();

    const specsObject: Record<string, string> = {};
    if (partNoVal) {
      specsObject['Mã Phụ Tùng'] = partNoVal;
    }
    if (material.trim()) {
      specsObject['Chất liệu'] = material.trim();
    }

    const formattedImagesPayload = imageList.length > 0
      ? imageList.map((img, idx) => ({
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary,
          sortOrder: idx,
        }))
      : [{ imageUrl: '/images/logo/logonen.png', isPrimary: true, sortOrder: 0 }];

    const payload = {
      name: publicName.trim(),
      partNumber: partNoVal,
      internalCode: internalCode.trim(),
      internalName: internalName.trim(),
      categoryId: Number(selectedCategoryId) || activeSubModal.id,
      brandId: Number(selectedBrandId) > 0 ? Number(selectedBrandId) : null,
      price: 0,
      costPrice: 0,
      stockQuantity: Number(stock) || 0,
      inStock: Number(stock) > 0,
      qualityStandard: qualityStandard.trim(),
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
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể lưu sản phẩm. Vui lòng kiểm tra lại kết nối.');
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
          {/* Searchable Category Selector */}
          {categoriesTree.length > 0 && (
            <div className="relative">
              <label className="font-bold text-slate-700 block mb-1">
                Danh Mục Phụ Con (* Bạn có thể gõ từ khóa để tìm danh mục)
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={
                    isCatDropdownOpen
                      ? catSearchQuery
                      : selectedCatInfo
                      ? `📁 ${selectedCatInfo.fullLabel}`
                      : ''
                  }
                  onFocus={() => {
                    setIsCatDropdownOpen(true);
                    setCatSearchQuery('');
                  }}
                  onChange={(e) => {
                    setCatSearchQuery(e.target.value);
                    if (!isCatDropdownOpen) setIsCatDropdownOpen(true);
                  }}
                  placeholder="Gõ từ khóa để tìm danh mục phụ (VD: bi, phớt, cab, động cơ...)..."
                  className="w-full p-2.5 pr-10 border border-slate-200 rounded-xl font-bold bg-white text-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs shadow-2xs cursor-pointer"
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400" />
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCatDropdownOpen ? 'rotate-180 text-red-600' : ''}`} />
                </div>
              </div>

              {/* Search Dropdown Popup */}
              {isCatDropdownOpen && (
                <>
                  {/* Backdrop overlay to close when clicking outside */}
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => {
                      setIsCatDropdownOpen(false);
                      setCatSearchQuery('');
                    }}
                  />

                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {filteredCategoriesTree.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 font-semibold">
                        Không tìm thấy danh mục nào phù hợp với &quot;{catSearchQuery}&quot;
                      </div>
                    ) : (
                      filteredCategoriesTree.map((main: any) => (
                        <div key={`cat-grp-${main.id}`} className="py-1">
                          {/* Main category header */}
                          <div className="px-3 py-1.5 font-black text-slate-800 bg-slate-50 text-[11px] uppercase tracking-wider flex items-center gap-1.5 sticky top-0 border-b border-slate-100">
                            <span className="text-red-600">📂</span>
                            <span>{main.name}</span>
                          </div>

                          {/* Sub categories */}
                          <div className="py-0.5">
                            {(main.children || []).map((sub: any) => {
                              const isSelected = sub.id === Number(selectedCategoryId);
                              return (
                                <button
                                  type="button"
                                  key={`cat-opt-${sub.id}`}
                                  onClick={() => {
                                    setSelectedCategoryId(sub.id);
                                    setIsCatDropdownOpen(false);
                                    setCatSearchQuery('');
                                  }}
                                  className={`w-full text-left px-4 py-2 font-extrabold flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-red-50 text-red-600 font-black'
                                      : 'hover:bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  <span className="truncate">└─ {sub.name}</span>
                                  {isSelected && <Check className="w-4 h-4 text-red-600 shrink-0 ml-2" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Mã OE / Part No (Không bắt buộc)
              </label>
              <input
                type="text"
                value={partNo}
                onChange={(e) => setPartNo(e.target.value)}
                placeholder="Mã phụ tùng chính hãng nhà máy (VD: 612600080277)"
                className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold focus:ring-2 focus:ring-red-500/20"
              />
              <span className="text-[10px] text-slate-400 font-medium block mt-1">
                Mã do nhà máy sản xuất dập trên linh kiện
              </span>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1 text-red-600">
                Mã SKU Kho Q.BA (*)
              </label>
              <input
                type="text"
                required
                value={internalCode}
                onChange={(e) => setInternalCode(e.target.value)}
                placeholder="Mã quản lý kho nội bộ (VD: QB-SKU-102934)"
                className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold bg-slate-50 focus:ring-2 focus:ring-red-500/20"
              />
              <span className="text-[10px] text-slate-400 font-medium block mt-1">
                Mã quản lý tồn kho & kiểm kê nội bộ Q.BA
              </span>
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
            <label className="font-bold text-slate-700 block mb-1">Tên Phụ Tùng Nội Bộ Kho (*)</label>
            <input
              type="text"
              required
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
                className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-red-500/20"
              >
                <option value={0}>-- Không có thương hiệu (Không) --</option>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Chất Liệu Phụ Tùng (Không bắt buộc)</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Thép rèn đúc AC16, Viton chịu nhiệt, Gang đúc xám..."
                className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-red-500/20"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tiêu Chuẩn Chất Lượng (Badge góc ảnh)
              </label>
              <input
                type="text"
                value={qualityStandard}
                onChange={(e) => setQualityStandard(e.target.value)}
                placeholder="Ví dụ: Chính Hãng Nhà Máy, Loại 1 Cao Cấp, Hàng OEM..."
                className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-red-500/20"
              />
            </div>
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
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-red-600" />
                <span>Bộ Ảnh Phụ Tùng Chuẩn SEO ({imageList.length}/5 Ảnh)</span>
              </label>
              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> Kéo thả / Bấm nút ‹ › để đổi vị trí ảnh • Icon Sao để chọn Ảnh Chính
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Upload Button */}
              {imageList.length < 5 && (
                <label className="h-24 w-24 rounded-xl bg-white border-2 border-dashed border-red-400 hover:border-red-600 text-red-600 font-bold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs">
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
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={() => setDraggedIndex(null)}
                  className={`relative h-24 w-24 rounded-xl bg-white border-2 overflow-hidden flex-shrink-0 shadow-2xs transition-all group ${
                    img.isPrimary ? 'border-red-600 ring-2 ring-red-500/20' : 'border-slate-300'
                  } ${draggedIndex === idx ? 'opacity-40 scale-95 border-dashed border-red-500' : ''}`}
                >
                  <Image
                    src={formatImageUrl(img.imageUrl)}
                    alt={`Preview ${idx + 1}`}
                    fill
                    unoptimized
                    sizes="96px"
                    className="object-cover"
                  />

                  {/* Primary Star Badge (Top-Left) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetPrimaryImage(idx);
                    }}
                    title={img.isPrimary ? 'Ảnh chính hiển thị đầu tiên' : 'Bấm để đặt làm Ảnh Chính'}
                    className={`absolute top-1 left-1 p-1 rounded-md text-[9px] font-bold flex items-center gap-0.5 shadow-md transition-all cursor-pointer z-10 ${
                      img.isPrimary
                        ? 'bg-red-600 text-white ring-1 ring-amber-400'
                        : 'bg-slate-900/80 text-slate-200 hover:bg-red-600 hover:text-white opacity-90 group-hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <Star className={`w-3 h-3 ${img.isPrimary ? 'fill-amber-300 text-amber-300' : ''}`} />
                  </button>

                  {/* Sequence Order Badge (#1, #2...) (Top-Center) */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10 pointer-events-none">
                    #{idx + 1}
                  </div>

                  {/* Delete Button (Top-Right) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                    }}
                    title="Xóa ảnh này"
                    className="absolute top-1 right-1 p-1 rounded-md bg-slate-900/80 hover:bg-red-600 text-white transition-all opacity-90 group-hover:opacity-100 hover:scale-105 cursor-pointer z-10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {/* Zoom Preview Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewImage({ url: formatImageUrl(img.imageUrl), title: `Ảnh sản phẩm #${idx + 1}` })}
                    title="Bấm vào để phóng to xem ảnh (Hoặc kéo thả để đổi vị trí)"
                    className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-grab active:cursor-grabbing"
                  >
                    <ZoomIn className="w-5 h-5 text-white drop-shadow-md" />
                  </button>

                  {/* Reorder Controls Footer Bar */}
                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-xs px-1 py-0.5 flex items-center justify-between z-10">
                    {idx > 0 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveImage(idx, 'left');
                        }}
                        title="Đẩy ảnh sang trái (Lên trước)"
                        className="p-0.5 rounded text-white hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="w-3.5" />
                    )}

                    {img.isPrimary ? (
                      <span className="text-[8px] font-black text-amber-300 uppercase tracking-tight truncate">Ảnh Chính</span>
                    ) : (
                      <span className="text-[8px] font-bold text-slate-300 truncate">Vị trí #{idx + 1}</span>
                    )}

                    {idx < imageList.length - 1 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveImage(idx, 'right');
                        }}
                        title="Đẩy ảnh sang phải (Xuống sau)"
                        className="p-0.5 rounded text-white hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="w-3.5" />
                    )}
                  </div>
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

      {/* Fullscreen Image Zoom Lightbox Modal */}
      <ImagePreviewModal
        isOpen={!!previewImage}
        imageUrl={previewImage?.url || null}
        title={previewImage?.title}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}
