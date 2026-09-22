'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Plus,
  Package,
  X,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Copy,
  Check,
  Filter,
  RotateCcw,
  Tag,
  Boxes,
  Layers,
} from 'lucide-react';
import ImagePreviewModal from '@/components/ui/ImagePreviewModal';
import { AdminApiService } from '@/services/adminApiService';
import { formatImageUrl } from '@/utils/imageHelper';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ToastNotification, { ToastMessage } from '@/components/ui/ToastNotification';

interface SubCategory {
  id: number;
  name: string;
  slug: string;
  productCount: number;
  description: string;
}

interface ProductItem {
  id: number;
  name: string;
  internalName: string;
  internalCode: string;
  partNumber: string;
  subCategorySlug: string;
  subCategoryName: string;
  brand: string;
  brandId?: number;
  stock: number;
  price: string;
  costPrice: string;
  description: string;
  image: string;
  rawProduct?: any;
}

interface SubCategoryProductsModalProps {
  activeSubModal: SubCategory;
  onClose: () => void;
  productsMock: ProductItem[];
  onOpenAddProductModal: () => void;
  onEditProduct: (prod: ProductItem) => void;
  onRefreshProducts?: () => void;
}

export default function SubCategoryProductsModal({
  activeSubModal,
  onClose,
  productsMock,
  onOpenAddProductModal,
  onEditProduct,
  onRefreshProducts,
}: SubCategoryProductsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedStockFilter, setSelectedStockFilter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('default');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [page, setPage] = useState(1);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const [deleteProdConfirm, setDeleteProdConfirm] = useState<{
    isOpen: boolean;
    prod: ProductItem | null;
    loading: boolean;
  }>({
    isOpen: false,
    prod: null,
    loading: false,
  });

  const [toastState, setToastState] = useState<ToastMessage | null>(null);

  // Quick 1-Click Code Copy State & Handler
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  const handleCopyCode = (e: React.MouseEvent, codeText: string, label: string, keyId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!codeText || codeText === '—') return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(codeText);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = codeText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopiedCodeKey(keyId);
    setTimeout(() => setCopiedCodeKey(null), 1500);

    setToastState({
      id: String(Date.now()),
      type: 'success',
      title: 'Đã Sao Chép Mã!',
      message: `Đã sao chép ${label} [${codeText}] vào bộ nhớ tạm!`,
    });
  };

  const handleDeleteProduct = (prod: ProductItem) => {
    setDeleteProdConfirm({
      isOpen: true,
      prod,
      loading: false,
    });
  };

  const executeDeleteProduct = async () => {
    if (!deleteProdConfirm.prod) return;
    setDeleteProdConfirm((prev) => ({ ...prev, loading: true }));

    try {
      const res = await AdminApiService.deleteProduct(deleteProdConfirm.prod.id);
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Xóa Phụ Tùng Thành Công',
          message: `Đã xóa phụ tùng [${deleteProdConfirm.prod.partNumber}] - ${deleteProdConfirm.prod.name} khỏi hệ thống kho!`,
        });
        if (onRefreshProducts) onRefreshProducts();
      } else {
        setToastState({
          id: String(Date.now()),
          type: 'error',
          title: 'Xóa Thất Bại',
          message: res.message || 'Xóa phụ tùng thất bại',
        });
      }
    } catch {
      setToastState({
        id: String(Date.now()),
        type: 'error',
        title: 'Lỗi Kết Nối',
        message: 'Không thể xóa phụ tùng. Vui lòng kiểm tra lại kết nối API.',
      });
    } finally {
      setDeleteProdConfirm({ isOpen: false, prod: null, loading: false });
    }
  };

  const [modalProducts, setModalProducts] = useState<ProductItem[]>([]);

  // Load Real-Time SubCategory Products directly by Category ID from Backend API
  useEffect(() => {
    async function loadSubCategoryProducts() {
      if (!activeSubModal?.id) return;
      try {
        const res = await AdminApiService.getAdminProducts({
          categoryId: activeSubModal.id,
          limit: 5000,
        });
        if (res.ok && res.data) {
          const rawProds = Array.isArray(res.data) ? res.data : res.data.products || [];
          const mapped: ProductItem[] = rawProds.map((p: any) => ({
            id: p.id,
            name: p.name,
            internalName: p.internalName || p.name,
            internalCode: p.internalCode || '',
            partNumber: p.partNumber || '',
            subCategorySlug: p.category?.slug || '',
            subCategoryName: p.category?.name || '',
            brand: p.brand?.name || 'HOWO Sinotruk',
            brandId: p.brandId || p.brand?.id,
            stock: p.stockQuantity || 0,
            price: p.price && Number(p.price) > 0 ? `${Number(p.price).toLocaleString()} ₫` : 'Liên hệ Báo Giá',
            costPrice: p.costPrice ? `${Number(p.costPrice).toLocaleString()} ₫` : '0 ₫',
            description: p.description || '',
            image: p.images?.[0]?.imageUrl || '/images/logo/logonen.png',
            rawProduct: p,
          }));
          setModalProducts(mapped);
        }
      } catch {}
    }
    loadSubCategoryProducts();
  }, [activeSubModal]);

  // Base list for active subcategory (uses direct API products or fallback to productsMock)
  const rawCategoryProducts = useMemo(() => {
    const listToFilter = modalProducts.length > 0 ? modalProducts : productsMock;
    return listToFilter.filter(
      (p) =>
        (p as any).subCategoryId === activeSubModal.id ||
        (p as any).rawProduct?.categoryId === activeSubModal.id ||
        (p as any).categoryId === activeSubModal.id ||
        p.subCategorySlug === activeSubModal.slug ||
        p.subCategoryName === activeSubModal.name ||
        (p as any).mainCategorySlug === activeSubModal.slug ||
        (p as any).mainCategory === activeSubModal.name
    );
  }, [modalProducts, productsMock, activeSubModal]);

  // Extract unique brands present in this subcategory
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    rawCategoryProducts.forEach((p) => {
      if (p.brand && p.brand !== 'Chưa Phân Loại' && p.brand !== 'Không có thương hiệu' && p.brand !== 'Không') {
        brandSet.add(p.brand);
      }
    });
    return Array.from(brandSet).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [rawCategoryProducts]);

  // Multi-Criteria Filtering
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = rawCategoryProducts;

    // Search query filter
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.partNumber.toLowerCase().includes(q) ||
          p.internalCode.toLowerCase().includes(q) ||
          p.internalName.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    // Brand filter
    if (selectedBrand !== 'ALL') {
      if (selectedBrand === 'UNBRANDED') {
        result = result.filter((p) => !p.brand || p.brand === 'Chưa Phân Loại' || p.brand === 'Không có thương hiệu' || p.brand === 'Không');
      } else {
        result = result.filter((p) => p.brand === selectedBrand);
      }
    }

    // Stock status filter
    if (selectedStockFilter === 'IN_STOCK') {
      result = result.filter((p) => p.stock > 0);
    } else if (selectedStockFilter === 'OUT_OF_STOCK') {
      result = result.filter((p) => p.stock === 0);
    }

    // Apply Sorting
    result = [...result];
    if (sortOption === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sortOption === 'name_desc') {
      result.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
    } else if (sortOption === 'part_asc') {
      result.sort((a, b) => a.partNumber.localeCompare(b.partNumber, 'vi'));
    } else if (sortOption === 'internal_asc') {
      result.sort((a, b) => a.internalCode.localeCompare(b.internalCode, 'vi'));
    } else if (sortOption === 'stock_desc') {
      result.sort((a, b) => b.stock - a.stock);
    } else if (sortOption === 'stock_asc') {
      result.sort((a, b) => a.stock - b.stock);
    }

    return result;
  }, [rawCategoryProducts, searchQuery, selectedBrand, selectedStockFilter, sortOption]);

  const isFilterActive =
    Boolean(searchQuery) ||
    selectedBrand !== 'ALL' ||
    selectedStockFilter !== 'ALL' ||
    sortOption !== 'default';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('ALL');
    setSelectedStockFilter('ALL');
    setSortOption('default');
    setPage(1);
  };

  const effectiveLimit = itemsPerPage === 999999 ? (filteredProducts.length || 1) : itemsPerPage;
  const totalPages = Math.ceil(filteredProducts.length / effectiveLimit) || 1;

  const paginatedProducts = useMemo(() => {
    if (itemsPerPage === 999999) return filteredProducts;
    const start = (page - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, page, itemsPerPage]);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-6xl w-full h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3" />
                DANH MỤC PHỤ CON
              </span>
              <h3 className="font-extrabold text-white text-lg sm:text-xl tracking-tight">
                {activeSubModal.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 font-extrabold text-xs border border-white/15">
                {filteredProducts.length} / {rawCategoryProducts.length} Phụ Tùng
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Quản lý chi tiết tất cả linh kiện thuộc danh mục <strong>"{activeSubModal.name}"</strong> với bộ lọc đa tiêu chuẩn thông minh.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enhanced Multi-Filter Toolbar */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 flex flex-col gap-2.5 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1 max-w-lg w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo Tên sản phẩm, Mã PartNo, Mã SKU, Mã nội bộ..."
                className="w-full pl-10 pr-9 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-900 font-semibold shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Actions Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onOpenAddProductModal}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Phụ Tùng Mới</span>
              </button>

              <Link
                href={`/admin/products?subCategory=${activeSubModal.slug}`}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Package className="w-4 h-4" />
                <span>Trang Quản Lý Sản Phẩm ➔</span>
              </Link>
            </div>
          </div>

          {/* Secondary Filter Controls Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 text-xs">
            {/* Filter Brand Dropdown */}
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <Tag className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">Thương hiệu: Tất cả ({rawCategoryProducts.length})</option>
                <option value="UNBRANDED">Không có thương hiệu / Không</option>
                {availableBrands.map((b) => (
                  <option key={`sub-brand-opt-${b}`} value={b}>
                    Hãng: {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Stock Dropdown */}
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <Boxes className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <select
                value={selectedStockFilter}
                onChange={(e) => {
                  setSelectedStockFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tồn kho: Tất cả trạng thái</option>
                <option value="IN_STOCK">Còn hàng (Tồn &gt; 0)</option>
                <option value="OUT_OF_STOCK">Hết hàng (Tồn = 0)</option>
              </select>
            </div>

            {/* Sort Option Dropdown */}
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value="default">Sắp xếp: Mặc định</option>
                <option value="name_asc">Tên sản phẩm: A ➔ Z</option>
                <option value="name_desc">Tên sản phẩm: Z ➔ A</option>
                <option value="part_asc">Mã Phụ Tùng (OE): A ➔ Z</option>
                <option value="internal_asc">Mã SKU Kho: A ➔ Z</option>
                <option value="stock_desc">Tồn kho: Cao ➔ Thấp</option>
                <option value="stock_asc">Tồn kho: Thấp ➔ Cao</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {isFilterActive && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer border border-red-200"
                title="Đặt lại tất cả bộ lọc về mặc định"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </div>
        </div>

        {/* Widescreen Scrollable Product Table View */}
        <div className="overflow-y-scroll flex-1 custom-scrollbar pr-1">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-slate-50 m-4 rounded-2xl border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">
                Không tìm thấy phụ tùng phù hợp với tiêu chí lọc trong danh mục "{activeSubModal.name}"
              </h4>
              <p className="text-xs text-slate-400">Thử bấm "Xóa bộ lọc" hoặc sử dụng từ khóa tìm kiếm khác.</p>
              {isFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Xóa tất cả bộ lọc</span>
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse relative">
              <thead className="sticky top-0 z-10 shadow-2xs">
                <tr className="bg-slate-100/95 backdrop-blur-xs text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 pl-5">Ảnh SEO</th>
                  <th className="p-3.5">Mã SKU Kho (*)</th>
                  <th className="p-3.5">Mã OE / Part No</th>
                  <th className="p-3.5">Tên Sản Phẩm & Tên Kho</th>
                  <th className="p-3.5">Mô Tả Chi Tiết Phụ Tùng</th>
                  <th className="p-3.5">Thương Hiệu</th>
                  <th className="p-3.5">Tồn Kho</th>
                  <th className="p-3.5">Đơn Giá / Giá Vốn</th>
                  <th className="p-3.5 pr-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProducts.map((prod) => (
                  <tr key={`prod-modal-${prod.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div
                        onClick={() => setPreviewImage({ url: formatImageUrl(prod.image), title: `${prod.name} (${prod.internalCode || prod.partNumber})` })}
                        className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 relative overflow-hidden flex-shrink-0 shadow-2xs cursor-pointer hover:scale-105 hover:ring-2 hover:ring-red-500 transition-all group"
                        title="Bấm vào hình để phóng to ảnh sản phẩm"
                      >
                        <Image
                          src={formatImageUrl(prod.image)}
                          alt={prod.name}
                          fill
                          loading="lazy"
                          unoptimized
                          sizes="100vw"
                          className="object-contain p-0.5 group-hover:opacity-90"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono">
                      {(() => {
                        const isSkuCopied = copiedCodeKey === `sku-${prod.id}`;
                        return (
                          <button
                            type="button"
                            onClick={(e) => handleCopyCode(e, prod.internalCode, 'Mã SKU Kho', `sku-${prod.id}`)}
                            className="group/sku flex items-center gap-1 font-mono text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded border border-slate-200/80 transition-all cursor-pointer text-left"
                            title={`Bấm vào để copy nhanh mã SKU Kho [${prod.internalCode}]`}
                          >
                            <span className="group-hover/sku:underline">{prod.internalCode || '—'}</span>
                            {isSkuCopied ? (
                              <Check size={12} className="text-emerald-600 shrink-0" />
                            ) : (
                              <Copy size={11} className="text-slate-400 opacity-0 group-hover/sku:opacity-100 transition-opacity shrink-0" />
                            )}
                          </button>
                        );
                      })()}
                    </td>
                    <td className="p-3.5 font-mono">
                      {(() => {
                        const hasPartNo = Boolean(prod.partNumber && prod.partNumber.trim());
                        const isOeCopied = copiedCodeKey === `oe-${prod.id}`;

                        if (!hasPartNo) {
                          return <span className="italic text-slate-400 font-sans text-[11px]">(Chưa có mã)</span>;
                        }

                        return (
                          <button
                            type="button"
                            onClick={(e) => handleCopyCode(e, prod.partNumber, 'Mã OE / Part No', `oe-${prod.id}`)}
                            className="group/oe flex items-center gap-1 font-mono font-extrabold text-red-600 text-xs leading-snug hover:bg-red-50 px-1.5 py-0.5 rounded transition-all cursor-pointer text-left"
                            title={`Bấm vào để copy nhanh mã OE / Part No [${prod.partNumber}]`}
                          >
                            <span className="group-hover/oe:underline">{prod.partNumber}</span>
                            {isOeCopied ? (
                              <Check size={12} className="text-emerald-600 shrink-0" />
                            ) : (
                              <Copy size={11} className="text-red-400 opacity-0 group-hover/oe:opacity-100 transition-opacity shrink-0" />
                            )}
                          </button>
                        );
                      })()}
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1">
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">
                        Nội bộ: {prod.internalName}
                      </div>
                    </td>
                    <td className="p-3.5 max-w-sm">
                      <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                        {prod.description || 'Chưa cập nhật mô tả chi tiết.'}
                      </p>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold inline-block ${
                          !prod.brand || prod.brand === 'Chưa Phân Loại' || prod.brand === 'Không có thương hiệu' || prod.brand === 'Không'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-red-50 text-red-700 font-extrabold border border-red-200'
                        }`}
                      >
                        {!prod.brand || prod.brand === 'Chưa Phân Loại' || prod.brand === 'Không có thương hiệu' ? 'Không' : prod.brand}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-extrabold inline-block ${
                          prod.stock === 0
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : prod.stock <= 5
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {prod.stock} cái
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-extrabold text-slate-900">{prod.price}</div>
                      <div className="text-[10px] text-slate-400">Vốn: {prod.costPrice}</div>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditProduct(prod)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          title="Chỉnh sửa chi tiết sản phẩm & upload ảnh"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          disabled={deleteProdConfirm.loading && deleteProdConfirm.prod?.id === prod.id}
                          onClick={() => handleDeleteProduct(prod)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Enhanced Modal Pagination Bar */}
        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-slate-600 font-semibold">
              Hiển thị <strong className="text-slate-900">{paginatedProducts.length}</strong> / {filteredProducts.length} sản phẩm • Trang <strong className="text-red-600">{page}</strong> trên {totalPages} trang
            </span>

            {/* Items Per Page Switcher */}
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold">Hiển thị:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
                <option value={999999}>Hiển thị tất cả</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Trang Trước
            </button>
            <button
              disabled={page === totalPages || itemsPerPage === 999999}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              Trang Sau <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM DELETE PRODUCT MODAL */}
      <ConfirmModal
        isOpen={deleteProdConfirm.isOpen}
        title="Xóa Phụ Tùng Kho"
        message="Bạn có chắc chắn muốn xóa phụ tùng này khỏi kho hàng?"
        itemName={deleteProdConfirm.prod ? `[${deleteProdConfirm.prod.partNumber}] - ${deleteProdConfirm.prod.name}` : ''}
        confirmText="Xác Nhận Xóa"
        cancelText="Hủy Bỏ"
        isLoading={deleteProdConfirm.loading}
        onConfirm={executeDeleteProduct}
        onCancel={() => setDeleteProdConfirm({ isOpen: false, prod: null, loading: false })}
      />

      {/* TOAST NOTIFICATION */}
      <ToastNotification toast={toastState} onClose={() => setToastState(null)} />

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
