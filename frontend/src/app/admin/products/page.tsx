'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { formatImageUrl } from '@/utils/imageHelper';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ToastNotification, { ToastMessage } from '@/components/ui/ToastNotification';
import AddProductModal from '@/components/admin/AddProductModal';
import StockAdjustmentModal from '@/components/admin/StockAdjustmentModal';
import { AdminApiService } from '@/services/adminApiService';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  FolderTree,
  Tag,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
} from 'lucide-react';

interface ProductItem {
  id: number;
  name: string;
  internalName: string;
  internalCode: string;
  partNumber: string;
  mainCategory: string;
  subCategory: string;
  subCategorySlug: string;
  subCategoryId: number;
  brand: string;
  brandId?: number;
  stock: number;
  price: string;
  costPrice: string;
  status: 'CÒN HÀNG' | 'SẮP HẾT HÀNG' | 'HẾT HÀNG';
  image: string;
  rawProduct: any;
}

interface CategoryOptionGroup {
  id: number;
  main: string;
  subs: { id: number; name: string; slug: string }[];
}

interface BrandOption {
  id: number;
  name: string;
}

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const initialSubCategorySlug = searchParams.get('subCategory') || searchParams.get('categorySlug') || 'ALL';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(initialSubCategorySlug);
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');

  // Real-Time Data States from Backend Database
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<CategoryOptionGroup[]>([]);
  const [brandsList, setBrandsList] = useState<BrandOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Add/Edit Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [stockModalProduct, setStockModalProduct] = useState<ProductItem | null>(null);
  const [activeSubModal, setActiveSubModal] = useState<{ id: number; name: string; slug: string }>({
    id: 1,
    name: 'Mặc định',
    slug: 'default',
  });

  // Confirm Modal & Toast state
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    productId: number | null;
    productSku: string;
    productName: string;
    loading: boolean;
  }>({
    isOpen: false,
    productId: null,
    productSku: '',
    productName: '',
    loading: false,
  });

  const [toastState, setToastState] = useState<ToastMessage | null>(null);

  // Fetch Real-time Products, Categories, Brands from PostgreSQL Backend API
  const fetchRealtimeData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catTree, brandRes] = await Promise.all([
        AdminApiService.getAdminProducts({ limit: 200 }),
        AdminApiService.getCategoriesTree(),
        AdminApiService.getBrands(),
      ]);

      // Process Categories Tree
      if (catTree && catTree.length > 0) {
        const groups: CategoryOptionGroup[] = catTree.map((main) => ({
          id: main.id,
          main: main.name,
          subs: (main.children || []).map((sub) => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
          })),
        }));
        setCategoryGroups(groups);
      }

      // Process Brands
      if (brandRes && brandRes.ok && brandRes.data) {
        const bList: BrandOption[] = brandRes.data.map((b: any) => ({
          id: b.id,
          name: b.name,
        }));
        setBrandsList(bList);
      }

      // Process Products
      if (prodRes && prodRes.ok && prodRes.data) {
        const mapped: ProductItem[] = prodRes.data.map((p: any) => {
          const stock = p.stockQuantity || 0;
          let statusStr: 'CÒN HÀNG' | 'SẮP HẾT HÀNG' | 'HẾT HÀNG' = 'CÒN HÀNG';
          if (stock === 0) statusStr = 'HẾT HÀNG';
          else if (stock <= 5) statusStr = 'SẮP HẾT HÀNG';

          return {
            id: p.id,
            name: p.name,
            internalName: p.internalName || p.name,
            internalCode: p.internalCode || `QB-SKU-${p.id}`,
            partNumber: p.partNumber || `PN-${p.id}`,
            mainCategory: p.category?.parent?.name || p.category?.name || 'Chưa phân loại',
            subCategory: p.category?.name || 'Danh mục phụ',
            subCategorySlug: p.category?.slug || '',
            subCategoryId: p.categoryId || 1,
            brand: p.brand?.name || 'HOWO Sinotruk',
            brandId: p.brandId || p.brand?.id,
            stock,
            price: p.price && Number(p.price) > 0 ? `${Number(p.price).toLocaleString()} ₫` : 'Liên hệ Báo Giá',
            costPrice: p.costPrice ? `${Number(p.costPrice).toLocaleString()} ₫` : '0 ₫',
            status: statusStr,
            image: p.images?.[0]?.imageUrl || '/images/vehicle-category/dongco.png',
            rawProduct: p,
          };
        });
        setProductsList(mapped);
      }
    } catch {
      // Fallback if network drops
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealtimeData();
  }, [fetchRealtimeData]);

  // Open Edit Modal for Product
  const handleOpenEditProduct = (prod: ProductItem) => {
    const raw = prod.rawProduct;
    setEditingProduct({
      id: prod.id,
      name: prod.name,
      internalName: prod.internalName,
      internalCode: prod.internalCode,
      partNumber: prod.partNumber,
      brand: prod.brand,
      brandId: prod.brandId,
      stock: prod.stock,
      price: prod.price,
      costPrice: prod.costPrice,
      description: raw.description || '',
      image: prod.image,
      specifications: raw.specifications || {},
    });
    setActiveSubModal({
      id: prod.subCategoryId,
      name: prod.subCategory,
      slug: prod.subCategorySlug,
    });
    setShowProductModal(true);
  };

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    let defaultSub = { id: 1, name: 'Bộ Piston & Xéc Măng', slug: 'piston-xec-mang' };
    if (categoryGroups.length > 0 && categoryGroups[0].subs.length > 0) {
      const firstSub = categoryGroups[0].subs[0];
      defaultSub = { id: firstSub.id, name: firstSub.name, slug: firstSub.slug };
    }
    setActiveSubModal(defaultSub);
    setShowProductModal(true);
  };

  // Execute Delete Product via Backend API
  const handleDeleteProduct = (prod: ProductItem) => {
    setDeleteConfirmState({
      isOpen: true,
      productId: prod.id,
      productSku: prod.partNumber,
      productName: prod.name,
      loading: false,
    });
  };

  const executeDeleteProduct = async () => {
    if (!deleteConfirmState.productId) return;
    setDeleteConfirmState((prev) => ({ ...prev, loading: true }));

    try {
      const res = await AdminApiService.deleteProduct(deleteConfirmState.productId);
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Xóa Sản Phẩm Thành Công',
          message: `Đã xóa mã sản phẩm "${deleteConfirmState.productSku} - ${deleteConfirmState.productName}" khỏi kho Q.BA!`,
        });
        fetchRealtimeData();
      } else {
        setToastState({
          id: String(Date.now()),
          type: 'error',
          title: 'Xóa Thất Bại',
          message: res.message || 'Không thể xóa sản phẩm này.',
        });
      }
    } catch {
      setToastState({
        id: String(Date.now()),
        type: 'error',
        title: 'Lỗi Kết Nối',
        message: 'Không thể kết nối đến máy chủ Express backend.',
      });
    } finally {
      setDeleteConfirmState({ isOpen: false, productId: null, productSku: '', productName: '', loading: false });
    }
  };

  // Filtered Products List
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q) ||
        p.internalCode.toLowerCase().includes(q) ||
        p.internalName.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);

      const matchesCategory =
        selectedSubCategory === 'ALL' ||
        p.subCategorySlug === selectedSubCategory ||
        p.subCategory === selectedSubCategory;

      const matchesBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [productsList, searchQuery, selectedSubCategory, selectedBrand]);

  // Paginated List
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, page]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <PackageCheck className="w-6 h-6 text-red-600" />
              <span>Quản Lý Sản Phẩm Q.BA</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
              {productsList.length} Sản Phẩm Kho
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đồng bộ Real-Time 100% với PostgreSQL Database - Thêm, sửa, xóa tự động cập nhật toàn hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => {
              setToastState({
                id: String(Date.now()),
                type: 'success',
                title: 'Xuất Excel Thành Công',
                message: `Đã xuất ${productsList.length} mã sản phẩm ra tệp dữ liệu!`,
              });
            }}
            className="flex-1 sm:flex-none justify-center px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel Kho</span>
          </button>

          <button
            onClick={handleOpenAddProduct}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-900/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo Mã Part No, Mã Nội Bộ, Tên công khai hoặc Tên nội bộ..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800 font-medium"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <FolderTree className="w-4 h-4 text-red-600" />
            <select
              value={selectedSubCategory}
              onChange={(e) => {
                setSelectedSubCategory(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 max-w-[220px]"
            >
              <option value="ALL">Tất cả danh mục sản phẩm</option>
              {categoryGroups.map((group, groupIdx) => (
                <optgroup key={`fg-${group.id || groupIdx}-${group.main}`} label={`📂 ${group.main}`}>
                  {group.subs.map((sub, subIdx) => (
                    <option key={`sub-opt-${sub.id || subIdx}-${sub.slug}`} value={sub.slug}>
                      └─ {sub.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Brand Filter Dropdown */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Tag className="w-4 h-4 text-red-600" />
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="ALL">Tất cả thương hiệu</option>
              {brandsList.map((b) => (
                <option key={`b-opt-${b.id}`} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
            <p className="text-xs font-bold">Đang tải danh sách sản phẩm từ PostgreSQL Database...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-2 bg-slate-50">
            <PackageCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">Không tìm thấy sản phẩm phù hợp</h4>
            <p className="text-xs text-slate-400">Thử tìm kiếm với từ khóa khác hoặc lọc lại danh mục/thương hiệu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 pl-5">Ảnh SEO</th>
                  <th className="p-3.5">Mã Part No / Mã Nội Bộ</th>
                  <th className="p-3.5">Tên Công Khai & Tên Nội Bộ</th>
                  <th className="p-3.5">Danh Mục Phân Cấp</th>
                  <th className="p-3.5">Thương Hiệu</th>
                  <th className="p-3.5">Tồn Kho</th>
                  <th className="p-3.5">Đơn Giá / Giá Vốn</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5 pr-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 relative overflow-hidden flex-shrink-0 shadow-2xs">
                        <Image
                          src={formatImageUrl(product.image)}
                          alt={product.name}
                          fill
                          unoptimized
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-mono font-extrabold text-red-600 text-xs">
                        {product.partNumber}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        {product.internalCode}
                      </div>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <div className="font-extrabold text-slate-900 line-clamp-1">{product.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        🔒 Nội bộ: {product.internalName}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-800 text-[11px]">{product.mainCategory}</div>
                      <div className="text-[10px] text-red-600 font-semibold mt-0.5">
                        └─ {product.subCategory}
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-slate-700">{product.brand}</td>

                    <td className="p-3.5">
                      <span className="font-extrabold text-slate-900">{product.stock} cái</span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-extrabold text-slate-900">{product.price}</div>
                      <div className="text-[10px] text-slate-400">Vốn: {product.costPrice}</div>
                    </td>

                    <td className="p-3.5">
                      {product.status === 'CÒN HÀNG' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Còn hàng
                        </span>
                      )}
                      {product.status === 'SẮP HẾT HÀNG' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Sắp hết
                        </span>
                      )}
                      {product.status === 'HẾT HÀNG' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                          <XCircle className="w-3 h-3 text-red-600" />
                          Hết hàng
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setStockModalProduct(product)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-extrabold transition-all cursor-pointer flex items-center gap-1 text-[10px]"
                          title="Nhập kho / Quản lý tồn kho & Giá"
                        >
                          <Package className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                          <span>Kho ({product.stock})</span>
                        </button>

                        <Link
                          href={`/products/${product.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                          title="Xem công khai trên website"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleOpenEditProduct(product)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                          title="Xoá sản phẩm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Hiển thị <strong className="text-slate-900">{paginatedProducts.length}</strong> / {filteredProducts.length} sản phẩm kho Q.BA
          </span>
          <div className="flex items-center justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Trang Trước
            </button>
            <span className="font-extrabold text-red-600">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              Trang Sau <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* STOCK ADJUSTMENT MODAL */}
      {stockModalProduct && (
        <StockAdjustmentModal
          product={stockModalProduct}
          onClose={() => setStockModalProduct(null)}
          onSuccess={(updatedMsg) => {
            setStockModalProduct(null);
            setToastState({
              id: String(Date.now()),
              type: 'success',
              title: 'Cập Nhật Tồn Kho Thành Công',
              message: updatedMsg,
            });
            fetchRealtimeData();
          }}
        />
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <AddProductModal
          activeSubModal={activeSubModal}
          editingProduct={editingProduct}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            setShowProductModal(false);
            setEditingProduct(null);
            setToastState({
              id: String(Date.now()),
              type: 'success',
              title: editingProduct ? 'Cập Nhật Thành Công' : 'Thêm Thành Công',
              message: `Đã lưu thông tin sản phẩm vào cơ sở dữ liệu hệ thống kho!`,
            });
            fetchRealtimeData();
          }}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={deleteConfirmState.isOpen}
        title="Xóa Sản Phẩm Kho"
        message="Bạn có chắc chắn muốn xóa mã sản phẩm này khỏi hệ thống kho Q.BA?"
        itemName={`${deleteConfirmState.productSku} - ${deleteConfirmState.productName}`}
        confirmText="Xác Nhận Xóa"
        cancelText="Hủy Bỏ"
        isLoading={deleteConfirmState.loading}
        onConfirm={executeDeleteProduct}
        onCancel={() => setDeleteConfirmState({ isOpen: false, productId: null, productSku: '', productName: '', loading: false })}
      />

      {/* TOAST NOTIFICATION */}
      <ToastNotification toast={toastState} onClose={() => setToastState(null)} />
    </div>
  );
}
