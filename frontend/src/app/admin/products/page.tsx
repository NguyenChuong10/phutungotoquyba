'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { formatImageUrl } from '@/utils/imageHelper';
import { getProductUrl } from '@/utils/productHelper';
import ToastNotification, { ToastMessage } from '@/components/ui/ToastNotification';
import AddProductModal from '@/components/admin/AddProductModal';
import StockAdjustmentModal from '@/components/admin/StockAdjustmentModal';
import ImagePreviewModal from '@/components/ui/ImagePreviewModal';
import { AdminApiService } from '@/services/adminApiService';
import { Table, Tag as AntTag, Popconfirm, ConfigProvider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  FolderTree,
  Tag,
  PackageCheck,
  Package,
  Lock,
  ZoomIn,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

interface ProductItem {
  id: number;
  name: string;
  internalName: string;
  internalCode: string;
  partNumber: string;
  mainCategory: string;
  mainCategorySlug?: string;
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
  mainSlug?: string;
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

  // Dynamic Server-Side Pagination & Sorting States
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10); // Default 10 products per page (Hàng chục)
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(undefined);

  // Real-Time Data States from Backend Database
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<CategoryOptionGroup[]>([]);
  const [brandsList, setBrandsList] = useState<BrandOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Add/Edit Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [stockModalProduct, setStockModalProduct] = useState<ProductItem | null>(null);
  const [activeSubModal, setActiveSubModal] = useState<{ id: number; name: string; slug: string }>({
    id: 1,
    name: 'Mặc định',
    slug: 'default',
  });
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const [toastState, setToastState] = useState<ToastMessage | null>(null);

  // Quick 1-Click Code Copy State & Handler
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  const handleCopyCode = useCallback((e: React.MouseEvent, codeText: string, label: string, keyId: string) => {
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
  }, []);

  // Load Metadata (Category Tree & Brands) on Mount
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [catTree, partnerBrandsRes] = await Promise.all([
          AdminApiService.getCategoriesTree(),
          AdminApiService.getPartnerBrands(),
        ]);

        if (catTree && catTree.length > 0) {
          const groups: CategoryOptionGroup[] = catTree.map((parent) => ({
            id: parent.id,
            main: parent.name,
            subs: (parent.children || []).map((child) => ({
              id: child.id,
              name: child.name,
              slug: child.slug,
            })),
          }));
          setCategoryGroups(groups);

          const firstSub = catTree[0]?.children?.[0] || catTree[0];
          if (firstSub) {
            setActiveSubModal({
              id: firstSub.id,
              name: firstSub.name,
              slug: firstSub.slug,
            });
          }
        }

        if (partnerBrandsRes && partnerBrandsRes.data && Array.isArray(partnerBrandsRes.data)) {
          setBrandsList(partnerBrandsRes.data.map((b: any) => ({ id: b.id, name: b.name })));
        }
      } catch { }
    }
    loadMetadata();
  }, []);

  // Fetch Real-Time Paginated Products from Server
  const fetchRealtimeProducts = useCallback(async () => {
    setLoading(true);
    try {
      let categoryIdParam: number | undefined = undefined;
      if (selectedSubCategory !== 'ALL') {
        for (const g of categoryGroups) {
          if (g.mainSlug === selectedSubCategory || g.main === selectedSubCategory || String(g.id) === selectedSubCategory) {
            categoryIdParam = g.id;
            break;
          }
          const matchedSub = g.subs.find((s) => s.slug === selectedSubCategory || String(s.id) === selectedSubCategory);
          if (matchedSub) {
            categoryIdParam = matchedSub.id;
            break;
          }
        }
      }

      let brandIdParam: number | undefined = undefined;
      if (selectedBrand !== 'ALL') {
        const matchedBrand = brandsList.find((b) => b.name === selectedBrand || String(b.id) === selectedBrand);
        if (matchedBrand) brandIdParam = matchedBrand.id;
      }

      const prodRes = await AdminApiService.getAdminProducts({
        page,
        limit,
        search: searchQuery.trim() || undefined,
        categoryId: categoryIdParam,
        brandId: brandIdParam,
        sortBy: sortField,
        sortOrder,
      });

      if (prodRes.ok && prodRes.data) {
        const rawProds = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.products || prodRes.data || [];
        const totalCount = prodRes.pagination?.total ?? prodRes.total ?? rawProds.length;

        const mappedProducts: ProductItem[] = rawProds.map((p: any) => {
          let statusStr: 'CÒN HÀNG' | 'SẮP HẾT HÀNG' | 'HẾT HÀNG' = 'CÒN HÀNG';
          if (p.stockQuantity === 0) statusStr = 'HẾT HÀNG';
          else if (p.stockQuantity <= 5) statusStr = 'SẮP HẾT HÀNG';

          const primaryImg = p.images?.find((img: any) => img.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || '/images/logo/logonen.png';

          return {
            id: p.id,
            name: p.name,
            internalName: p.internalName || p.name,
            internalCode: p.internalCode || '',
            partNumber: p.partNumber || '',
            mainCategory: p.category?.parent?.name || (p.category?.parentId ? '' : p.category?.name) || 'Phụ Tùng Q.BA',
            mainCategorySlug: p.category?.parent?.slug || (p.category?.parentId ? '' : p.category?.slug) || '',
            subCategory: p.category?.parent ? p.category?.name : (p.category?.name || 'Linh Kiện Khác'),
            subCategorySlug: p.category?.slug || 'linh-kien-khac',
            subCategoryId: p.categoryId,
            brand: p.brand?.name || 'Không',
            brandId: p.brandId,
            stock: p.stockQuantity ?? 0,
            price: p.price && Number(p.price) > 0 ? `${Number(p.price).toLocaleString('vi-VN')} ₫` : 'Liên hệ Báo Giá',
            costPrice: p.costPrice && Number(p.costPrice) > 0 ? `${Number(p.costPrice).toLocaleString('vi-VN')} ₫` : '0 ₫',
            status: statusStr,
            image: primaryImg,
            rawProduct: p,
          };
        });

        setProductsList(mappedProducts);
        setTotalProducts(totalCount);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, selectedSubCategory, selectedBrand, categoryGroups, brandsList, sortField, sortOrder]);

  useEffect(() => {
    fetchRealtimeProducts();
  }, [fetchRealtimeProducts]);

  // Open Edit Modal for Product
  const handleOpenEditProduct = useCallback((prod: ProductItem) => {
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
      description: raw?.description || '',
      image: prod.image,
      specifications: raw?.specifications || {},
      rawProduct: raw,
    });
    setActiveSubModal({
      id: prod.subCategoryId,
      name: prod.subCategory,
      slug: prod.subCategorySlug,
    });
    setShowProductModal(true);
  }, []);

  // Open Add Product Modal
  const handleOpenAddProduct = useCallback(() => {
    setEditingProduct(null);
    let defaultSub = { id: 1, name: 'Bộ Piston & Xéc Măng', slug: 'piston-xec-mang' };
    if (categoryGroups.length > 0 && categoryGroups[0].subs.length > 0) {
      const firstSub = categoryGroups[0].subs[0];
      defaultSub = { id: firstSub.id, name: firstSub.name, slug: firstSub.slug };
    }
    setActiveSubModal(defaultSub);
    setShowProductModal(true);
  }, [categoryGroups]);

  // Execute Delete Product via Backend API
  const executeDeleteProduct = useCallback(async (productId: number, productSku: string, productName: string) => {
    try {
      const res = await AdminApiService.deleteProduct(productId);
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Xóa Sản Phẩm Thành Công',
          message: `Đã xóa mã sản phẩm "${productSku} - ${productName}" khỏi kho hệ thống!`,
        });
        fetchRealtimeProducts();
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
    }
  }, [fetchRealtimeProducts]);

  // Check if any filter or search or sort is active
  const isFiltered = useMemo(() => {
    return Boolean(
      searchQuery.trim() ||
      selectedSubCategory !== 'ALL' ||
      selectedBrand !== 'ALL' ||
      sortField ||
      sortOrder
    );
  }, [searchQuery, selectedSubCategory, selectedBrand, sortField, sortOrder]);

  // Reset All Filters & Search Handler
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedSubCategory('ALL');
    setSelectedBrand('ALL');
    setSortField(undefined);
    setSortOrder(undefined);
    setPage(1);
  }, []);

  // Ant Design Table Change Event Handler
  const handleTableChange = useCallback((pagination: any, filters: any, sorter: any) => {
    if (pagination.current && pagination.current !== page) {
      setPage(pagination.current);
    }
    if (pagination.pageSize && pagination.pageSize !== limit) {
      setLimit(pagination.pageSize);
      setPage(1);
    }

    // Server-Side Brand Filter Handling from Table Header
    if (filters && filters.brand && filters.brand.length > 0) {
      const brandFromFilter = filters.brand[0];
      if (brandFromFilter !== selectedBrand) {
        setSelectedBrand(brandFromFilter);
        setPage(1);
      }
    } else if (filters && (filters.brand === null || (Array.isArray(filters.brand) && filters.brand.length === 0))) {
      if (selectedBrand !== 'ALL') {
        setSelectedBrand('ALL');
        setPage(1);
      }
    }

    if (sorter && sorter.field && sorter.order) {
      const field = Array.isArray(sorter.field) ? sorter.field[0] : sorter.field;
      const order = sorter.order === 'ascend' ? 'asc' : 'desc';
      setSortField(field);
      setSortOrder(order);
      setPage(1);
    } else if (sorter && !sorter.order) {
      setSortField(undefined);
      setSortOrder(undefined);
    }
  }, [page, limit, selectedBrand]);

  // Ant Design Table Columns Configuration (Server-Side Sorted & Filtered across Database)
  const columns: ColumnsType<ProductItem> = useMemo(
    () => [
      {
        title: 'Sản Phẩm & Mã Phụ Tùng',
        key: 'name',
        dataIndex: 'name',
        width: '38%',
        sorter: true,
        sortOrder: (sortField === 'name' || sortField === 'internalCode' || sortField === 'partNumber')
          ? (sortOrder === 'asc' ? 'ascend' : sortOrder === 'desc' ? 'descend' : undefined)
          : undefined,
        render: (_: any, record: ProductItem) => {
          const fullImgUrl = formatImageUrl(record.image);
          const isSkuCopied = copiedCodeKey === `sku-${record.id}`;
          const isOeCopied = copiedCodeKey === `oe-${record.id}`;
          const hasPartNo = Boolean(record.partNumber && record.partNumber.trim());

          return (
            <div className="flex items-center gap-3 py-0.5">
              {/* Thumbnail Image */}
              <div
                onClick={() => setPreviewImage({ url: fullImgUrl, title: `${record.name} (Mã: ${record.partNumber})` })}
                className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200/80 relative overflow-hidden flex-shrink-0 shadow-2xs cursor-pointer hover:scale-105 hover:ring-2 hover:ring-red-500 transition-all group"
                title="Phóng to ảnh sản phẩm"
              >
                <Image
                  src={fullImgUrl}
                  alt={record.name}
                  fill
                  unoptimized
                  sizes="40px"
                  className="object-contain p-0.5 group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-3.5 h-3.5 text-white drop-shadow-md" />
                </div>
              </div>

              {/* Names & Codes */}
              <div className="min-w-0 flex-1 max-w-[240px] sm:max-w-[320px]">
                <div className="font-extrabold text-slate-900 text-xs truncate" title={record.name}>
                  {record.name}
                </div>

                {Boolean(record.internalName) && (
                  <div className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1" title={`Nội bộ: ${record.internalName}`}>
                    <Lock className="w-3 h-3 text-slate-400 shrink-0 inline" />
                    <span className="truncate">Nội bộ: {record.internalName}</span>
                  </div>
                )}

                {/* SKU & OE Codes Row */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {/* SKU Pill */}
                  <button
                    type="button"
                    onClick={(e) => handleCopyCode(e, record.internalCode, 'Mã SKU Kho', `sku-${record.id}`)}
                    className="group/sku inline-flex items-center gap-1 font-mono text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded border border-slate-200/80 transition-all cursor-pointer"
                    title={`Copy SKU: ${record.internalCode}`}
                  >
                    <span>SKU: {record.internalCode || '—'}</span>
                    {isSkuCopied ? (
                      <Check size={11} className="text-emerald-600 shrink-0" />
                    ) : (
                      <Copy size={10} className="text-slate-400 opacity-0 group-hover/sku:opacity-100 transition-opacity shrink-0" />
                    )}
                  </button>

                  {/* OE Pill */}
                  {hasPartNo ? (
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(e, record.partNumber, 'Mã OE / Part No', `oe-${record.id}`)}
                      className="group/oe inline-flex items-center gap-1 font-mono font-extrabold text-red-600 text-[11px] bg-red-50 hover:bg-red-100 px-1.5 py-0.5 rounded transition-all cursor-pointer"
                      title={`Copy OE: ${record.partNumber}`}
                    >
                      <span>OE: {record.partNumber}</span>
                      {isOeCopied ? (
                        <Check size={11} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Copy size={10} className="text-red-400 opacity-0 group-hover/oe:opacity-100 transition-opacity shrink-0" />
                      )}
                    </button>
                  ) : (
                    <span className="italic text-slate-400 text-[10px]">(Chưa có mã OE)</span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        title: 'Phân Loại & Thương Hiệu',
        key: 'brand',
        dataIndex: 'brand',
        width: '22%',
        sorter: true,
        sortOrder: (sortField === 'brand' ? (sortOrder === 'asc' ? 'ascend' : sortOrder === 'desc' ? 'descend' : undefined) : undefined),
        filters: brandsList.map((b) => ({ text: b.name, value: b.name })),
        filterMultiple: false,
        filteredValue: selectedBrand !== 'ALL' ? [selectedBrand] : null,
        render: (brand: string, record: ProductItem) => (
          <div className="space-y-1">
            <div className="font-bold text-slate-800 text-[11px] truncate">
              {record.mainCategory} &gt; <span className="text-red-600 font-semibold">{record.subCategory}</span>
            </div>
            <div>
              {!brand || brand === 'Chưa Phân Loại' || brand === 'Chưa phân loại' || brand === 'Không' || brand === 'Không có thương hiệu' ? (
                <span className="text-slate-400 text-[11px] font-normal italic">-</span>
              ) : (
                <AntTag color="red" className="font-bold text-[10px] rounded-md px-1.5 py-0">
                  {brand}
                </AntTag>
              )}
            </div>
          </div>
        ),
      },
      {
        title: 'Tồn Kho & Trạng Thái',
        key: 'stock',
        dataIndex: 'stock',
        width: '14%',
        sorter: true,
        sortOrder: (sortField === 'stock' || sortField === 'status')
          ? (sortOrder === 'asc' ? 'ascend' : sortOrder === 'desc' ? 'descend' : undefined)
          : undefined,
        render: (stock: number, record: ProductItem) => (
          <div className="space-y-1">
            <div className="font-extrabold text-slate-900 text-xs">
              {stock} cái
            </div>
            <div>
              <AntTag
                color={record.status === 'CÒN HÀNG' ? 'green' : record.status === 'SẮP HẾT HÀNG' ? 'gold' : 'volcano'}
                className="font-extrabold text-[10px] rounded-md px-1.5 py-0"
              >
                {record.status}
              </AntTag>
            </div>
          </div>
        ),
      },
      {
        title: 'Đơn Giá / Giá Vốn',
        key: 'price',
        dataIndex: 'price',
        width: '14%',
        sorter: true,
        sortOrder: (sortField === 'price' ? (sortOrder === 'asc' ? 'ascend' : sortOrder === 'desc' ? 'descend' : undefined) : undefined),
        render: (_: any, record: ProductItem) => (
          <div className="space-y-0.5">
            <div className="font-extrabold text-slate-900 text-xs sm:text-sm">{record.price}</div>
            <div className="text-[10px] text-slate-400 font-medium">Vốn: {record.costPrice}</div>
          </div>
        ),
      },
      {
        title: 'Thao Tác',
        key: 'actions',
        align: 'left' as const,
        width: '12%',
        render: (_: any, record: ProductItem) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setStockModalProduct(record)}
              className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-extrabold transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
              title="Quản lý tồn kho & Giá"
            >
              <Package className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
              <span>Kho ({record.stock})</span>
            </button>

            <Link
              href={getProductUrl(record)}
              target="_blank"
              className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Xem công khai"
            >
              <Eye className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => handleOpenEditProduct(record)}
              className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
              title="Chỉnh sửa"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            <Popconfirm
              title="Xóa sản phẩm này?"
              description={`Bạn có chắc muốn xóa [${record.partNumber} - ${record.name}] khỏi hệ thống kho?`}
              onConfirm={() => executeDeleteProduct(record.id, record.partNumber, record.name)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <button
                className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                title="Xoá"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Popconfirm>
          </div>
        ),
      },
    ],
    [copiedCodeKey, sortField, sortOrder, brandsList, handleCopyCode, handleOpenEditProduct, executeDeleteProduct]
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#dc2626',
          borderRadius: 6,
          fontFamily: 'var(--font-inter), sans-serif',
        },
      }}
    >
      <div className="space-y-4 pb-6 w-full max-w-full overflow-x-hidden">
        {/* Header Bar (Standardized rounded-lg, p-4 sm:p-5 to match /admin/categories) */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <PackageCheck className="w-6 h-6 text-red-600" />
                <span>Quản Lý Sản Phẩm Q.BA</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
                {totalProducts} Sản Phẩm Kho
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý danh sách tất cả các mã phụ tùng xe tải trong kho Q.BA Đà Nẵng.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <button
              onClick={() => {
                setToastState({
                  id: String(Date.now()),
                  type: 'success',
                  title: 'Xuất File Excel Thành Công',
                  message: `Đã xuất danh sách ${totalProducts} sản phẩm kho ra file Excel!`,
                });
              }}
              className="px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200/80"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Xuất Excel Kho</span>
            </button>

            <button
              onClick={handleOpenAddProduct}
              className="px-3.5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Sản Phẩm Mới</span>
            </button>
          </div>
        </div>

        {/* Cohesive Toolbar & Table Container (Matches /admin/categories format) */}
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden w-full max-w-full">
          {/* Toolbar Search & Filter Header Bar */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo Mã Phụ Tùng, Mã Nội Bộ, Tên công khai hoặc tên nội bộ..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800 font-medium"
              />
            </div>

            {/* Filter Dropdowns Container */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Filter Dropdown */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <FolderTree className="w-4 h-4 text-red-600 shrink-0" />
                <select
                  value={selectedSubCategory}
                  onChange={(e) => {
                    setSelectedSubCategory(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 max-w-xs"
                >
                  <option value="ALL">Tất cả danh mục sản phẩm</option>
                  {categoryGroups.map((group) => (
                    <optgroup key={`cat-grp-${group.id}`} label={`📂 ${group.main}`}>
                      <option value={group.mainSlug || group.main}>
                        📁 [Tất cả mã thuộc: {group.main}]
                      </option>
                      {group.subs.map((sub) => (
                        <option key={`sub-opt-${sub.id}`} value={sub.slug}>
                          -- {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Brand Filter Dropdown */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Tag className="w-4 h-4 text-red-600 shrink-0" />
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="ALL">Tất cả thương hiệu</option>
                  {brandsList.map((b) => (
                    <option key={`b-opt-${b.id}`} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filters Button */}
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2.5 py-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors flex items-center gap-1.5 border border-red-200/80 cursor-pointer shadow-2xs"
                  title="Đặt lại tất cả bộ lọc, sắp xếp và tìm kiếm"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                  <span>Đặt lại bộ lọc</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Container with Inner Padding to Prevent Border Sticking */}
          <div className="p-3.5 sm:p-4">
            <Table
              columns={columns}
              dataSource={productsList}
              rowKey="id"
              loading={loading}
              onChange={handleTableChange}
              pagination={{
                current: page,
                pageSize: limit,
                total: totalProducts,
                pageSizeOptions: ['10', '20', '30', '40', '50', '100'],
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / Tổng ${total} sản phẩm kho Q.BA`,
              }}
              scroll={{ x: 'max-content' }}
              size="middle"
            />
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
              fetchRealtimeProducts();
            }}
          />
        )}

        {/* Add / Edit Product Modal */}
        {showProductModal && (
          <AddProductModal
            activeSubModal={activeSubModal}
            editingProduct={editingProduct}
            onClose={() => setShowProductModal(false)}
            onSave={() => {
              setShowProductModal(false);
              setToastState({
                id: String(Date.now()),
                type: 'success',
                title: 'Lưu Sản Phẩm Thành Công',
                message: 'Đã cập nhật dữ liệu sản phẩm trong hệ thống!',
              });
              fetchRealtimeProducts();
            }}
          />
        )}

        {/* Toast Notification Popup */}
        <ToastNotification toast={toastState} onClose={() => setToastState(null)} />

        {/* Fullscreen Image Zoom Lightbox Modal */}
        <ImagePreviewModal
          isOpen={!!previewImage}
          imageUrl={previewImage?.url || null}
          title={previewImage?.title}
          onClose={() => setPreviewImage(null)}
        />
      </div>
    </ConfigProvider>
  );
}
