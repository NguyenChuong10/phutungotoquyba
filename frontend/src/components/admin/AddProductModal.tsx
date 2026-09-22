'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import ImagePreviewModal from '@/components/ui/ImagePreviewModal';
import { Sparkles, FileText, ImageIcon, Upload, Loader2, Trash2, Star, ZoomIn, ChevronLeft, ChevronRight, GripVertical, Search, ChevronDown, Check, FolderOpen, X } from 'lucide-react';
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
  // Multi-Image Gallery State
  const initialImages: ProductImageItem[] = (() => {
    const rawImgs = editingProduct?.rawProduct?.images || (editingProduct as any)?.images;
    if (Array.isArray(rawImgs) && rawImgs.length > 0) {
      const items: ProductImageItem[] = rawImgs.map((img: any, idx: number) => ({
        imageUrl: typeof img === 'string' ? img : img.imageUrl,
        isPrimary: Boolean(typeof img === 'string' ? idx === 0 : (img.isPrimary ?? idx === 0)),
      }));
      const primaryIdx = items.findIndex((img) => img.isPrimary);
      if (primaryIdx > 0) {
        const [pItem] = items.splice(primaryIdx, 1);
        items.unshift(pItem);
      }
      return items.map((img, idx) => ({ ...img, isPrimary: idx === 0 }));
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

          const sinotrukBrand = list.find((b: any) =>
            b.name.toLowerCase().includes('sinotruk') ||
            b.name.toLowerCase().includes('sinotruck') ||
            b.name.toLowerCase().includes('howo')
          );
          const defaultBrandId = sinotrukBrand ? sinotrukBrand.id : list[0].id;

          if (editingProduct?.brandId) {
            setSelectedBrandId(editingProduct.brandId);
          } else if (editingProduct?.brand) {
            const matched = list.find((b: any) => b.name.toLowerCase() === editingProduct.brand.toLowerCase());
            if (matched) setSelectedBrandId(matched.id);
            else setSelectedBrandId(defaultBrandId);
          } else {
            setSelectedBrandId(defaultBrandId);
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
          const newImages: ProductImageItem[] = res.data.map((item: any) => ({
            imageUrl: item.imageUrl,
            isPrimary: false,
          }));
          setImageList((prev) => {
            const combined = [...prev, ...newImages];
            return combined.map((img, idx) => ({
              ...img,
              isPrimary: idx === 0,
            }));
          });
        } else {
          const rawMsg = res.message || 'Upload ảnh thất bại. Vui lòng thử lại.';
          const cleanMsg = (rawMsg.includes('is not valid JSON') || rawMsg.includes('Unexpected token'))
            ? 'Cần đăng nhập tài khoản Admin để upload ảnh sản phẩm.'
            : rawMsg;
          setErrorMsg(cleanMsg);
        }
      } catch (err: any) {
        setErrorMsg('Lỗi kết nối khi upload ảnh. Vui lòng kiểm tra lại backend.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageList((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      return next.map((img, idx) => ({
        ...img,
        isPrimary: idx === 0,
      }));
    });
  };

  const handleSetPrimaryImage = (indexToSet: number) => {
    setImageList((prev) => {
      if (indexToSet < 0 || indexToSet >= prev.length) return prev;
      const targetItem = prev[indexToSet];
      const remaining = prev.filter((_, idx) => idx !== indexToSet);
      const updated = [targetItem, ...remaining];
      return updated.map((img, idx) => ({
        ...img,
        isPrimary: idx === 0,
      }));
    });
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
      return next.map((img, idx) => ({
        ...img,
        isPrimary: idx === 0,
      }));
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
      return next.map((img, idx) => ({
        ...img,
        isPrimary: idx === 0,
      }));
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

    const sinotrukBrand = brandsList.find((b: any) =>
      b.name.toLowerCase().includes('sinotruk') ||
      b.name.toLowerCase().includes('sinotruck') ||
      b.name.toLowerCase().includes('howo')
    );
    const fallbackBrandId = sinotrukBrand ? sinotrukBrand.id : (brandsList[0]?.id || null);
    const finalBrandId = Number(selectedBrandId) > 0 ? Number(selectedBrandId) : fallbackBrandId;

    const payload = {
      name: publicName.trim(),
      partNumber: partNoVal,
      internalCode: internalCode.trim(),
      internalName: internalName.trim(),
      categoryId: Number(selectedCategoryId) || activeSubModal.id,
      brandId: finalBrandId,
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
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 cursor-pointer"
        onClick={onClose}
      >
      <div
        className="bg-white rounded-lg max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
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
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors"
            title="Đóng"
          >
            <X className="w-4 h-4 text-slate-500" />
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
                            <FolderOpen className="w-4 h-4 text-red-600 shrink-0" />
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

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-red-600" />
                <span className="font-extrabold text-slate-900 text-xs tracking-tight">
                  Bộ Ảnh Phụ Tùng Chuẩn SEO
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                  {imageList.length} Ảnh
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Kéo thả để đổi vị trí • ⭐ Ảnh chính hiển thị trên Web
              </span>
            </div>

            <div className="space-y-3">
              {/* Full-width Upload Banner Dropzone */}
              <label className="w-full py-3 px-4 rounded-md bg-white border-2 border-dashed border-red-300 hover:border-red-600 hover:bg-red-50/40 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs group">
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                )}
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-800 block">
                    {uploading ? 'Đang tải tệp ảnh lên máy chủ Express...' : '+ Tải Lên / Thêm Ảnh Phụ Tùng Mới'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Hỗ trợ tải không giới hạn số lượng ảnh PNG, JPG, WEBP
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Uploaded Images Clean Grid */}
              {imageList.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
                  {imageList.map((img, idx) => (
                    <div
                      key={`img-thumb-${idx}-${img.imageUrl}`}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(idx)}
                      onDragEnd={() => setDraggedIndex(null)}
                      className={`relative w-full aspect-square min-h-[72px] rounded-md bg-white border-2 overflow-hidden shadow-2xs transition-all group select-none ${
                        img.isPrimary
                          ? 'border-red-600 ring-2 ring-red-500/20'
                          : 'border-slate-200 hover:border-slate-400'
                      } ${draggedIndex === idx ? 'opacity-30 scale-95 border-dashed border-red-600' : ''}`}
                    >
                      <Image
                        src={formatImageUrl(img.imageUrl)}
                        alt={`Ảnh phụ tùng ${idx + 1}`}
                        fill
                        unoptimized
                        sizes="120px"
                        className="object-cover"
                      />

                      {/* Primary Badge Tag (Non-intrusive) */}
                      {img.isPrimary && (
                        <div className="absolute top-1 left-1 bg-red-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-sm z-10 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                          <span>Chính</span>
                        </div>
                      )}

                      {/* Sequence Order Tag (if not primary) */}
                      {!img.isPrimary && (
                        <div className="absolute top-1 left-1 bg-slate-900/70 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded z-10">
                          #{idx + 1}
                        </div>
                      )}

                      {/* Sleek Hover Action Controls Overlay */}
                      <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 z-20">
                        <div className="flex items-center justify-between">
                          {/* Set Primary Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetPrimaryImage(idx);
                            }}
                            title={img.isPrimary ? 'Đã là Ảnh Chính' : 'Bấm để đặt làm Ảnh Chính'}
                            className={`p-1 rounded transition-transform cursor-pointer ${
                              img.isPrimary
                                ? 'bg-amber-500 text-white'
                                : 'bg-white/20 text-white hover:bg-amber-500 hover:scale-110'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${img.isPrimary ? 'fill-white' : ''}`} />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            title="Xóa ảnh này"
                            className="p-1 rounded bg-white/20 text-white hover:bg-red-600 hover:scale-110 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-1">
                          {/* Shift Left */}
                          {idx > 0 ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveImage(idx, 'left');
                              }}
                              title="Di chuyển sang trái"
                              className="p-1 rounded bg-white/20 text-white hover:bg-red-600 cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          ) : <span className="w-3.5" />}

                          {/* Zoom Preview */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage({
                                url: formatImageUrl(img.imageUrl),
                                title: `Ảnh sản phẩm #${idx + 1}${img.isPrimary ? ' (Ảnh Chính)' : ''}`,
                              });
                            }}
                            title="Bấm để phóng to xem ảnh"
                            className="p-1 rounded bg-white/20 text-white hover:bg-slate-900 cursor-pointer"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>

                          {/* Shift Right */}
                          {idx < imageList.length - 1 ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveImage(idx, 'right');
                              }}
                              title="Di chuyển sang phải"
                              className="p-1 rounded bg-white/20 text-white hover:bg-red-600 cursor-pointer"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : <span className="w-3.5" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-900/30 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{saving ? 'Đang lưu...' : 'Lưu Phụ Tùng & Ảnh SEO'}</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Fullscreen Image Zoom Lightbox Modal */}
  <ImagePreviewModal
    isOpen={!!previewImage}
    imageUrl={previewImage?.url || null}
    title={previewImage?.title}
    onClose={() => setPreviewImage(null)}
  />
</>
);
}
