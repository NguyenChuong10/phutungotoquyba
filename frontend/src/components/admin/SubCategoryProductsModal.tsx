'use client';

import { useState, useMemo } from 'react';
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
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;
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

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const rawList = productsMock.filter(
      (p) =>
        p.subCategorySlug === activeSubModal.slug ||
        p.subCategoryName === activeSubModal.name ||
        (p as any).mainCategorySlug === activeSubModal.slug ||
        (p as any).mainCategory === activeSubModal.name
    );
    if (!q) return rawList;
    return rawList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q) ||
        p.internalCode.toLowerCase().includes(q) ||
        p.internalName.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  }, [activeSubModal, searchQuery, productsMock]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, page]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-6xl w-full h-[88vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-extrabold text-[10px] uppercase">
                DANH MỤC PHỤ CON (LAZY LOADED)
              </span>
              <h3 className="font-extrabold text-white text-lg sm:text-xl">
                {activeSubModal.name}
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Màn hình rộng max-w-6xl: Tự động Lazy Load danh sách sản phẩm giúp tối ưu tốc độ cho dữ liệu lớn.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Search Bar & Actions */}
        <div className="p-3.5 bg-slate-100/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo Mã Part No, Tên sản phẩm, Mã nội bộ Q.BA..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-900 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenAddProductModal}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-900/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Sản Phẩm Mới</span>
            </button>

            <Link
              href={`/admin/products?subCategory=${activeSubModal.slug}`}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Mở Trang Quản Lý Sản Phẩm ➔</span>
            </Link>
          </div>
        </div>

        {/* Widescreen Scrollable Product Table View */}
        <div className="overflow-y-scroll flex-1 custom-scrollbar pr-1">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-slate-50 m-4 rounded-2xl border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">
                Không tìm thấy phụ tùng phù hợp trong danh mục "{activeSubModal.name}"
              </h4>
              <p className="text-xs text-slate-400">Thử từ khóa khác hoặc bấm nút thêm sản phẩm bên trên.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse relative">
              <thead className="sticky top-0 z-10 shadow-2xs">
                <tr className="bg-slate-100/95 backdrop-blur-xs text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 pl-5">Ảnh SEO</th>
                  <th className="p-3.5">Mã Part No / Mã Q.BA</th>
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
                        onClick={() => setPreviewImage({ url: formatImageUrl(prod.image), title: `${prod.name} (Mã: ${prod.partNumber})` })}
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
                          className="object-cover group-hover:opacity-90"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono font-extrabold text-red-600 text-xs sm:text-sm">
                        {prod.partNumber}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">{prod.internalCode}</div>
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
                    <td className="p-3.5 font-bold text-slate-800">{prod.brand}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-900 font-extrabold text-xs">
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

        {/* Modal Pagination */}
        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs flex-shrink-0">
          <span className="text-xs text-slate-600 font-semibold">
            Hiển thị <strong className="text-slate-900">{paginatedProducts.length}</strong> / {filteredProducts.length} sản phẩm • Trang <strong className="text-red-600">{page}</strong> trên {totalPages} trang
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Trang Trước
            </button>
            <button
              disabled={page === totalPages}
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
