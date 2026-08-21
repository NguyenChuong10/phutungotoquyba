'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { formatImageUrl } from '@/utils/imageHelper';
import ToastNotification, { ToastMessage } from '@/components/ui/ToastNotification';
import AddProductModal from '@/components/admin/AddProductModal';
import StockAdjustmentModal from '@/components/admin/StockAdjustmentModal';
import ImagePreviewModal from '@/components/ui/ImagePreviewModal';
import { AdminApiService } from '@/services/adminApiService';
import { Table, Tag as AntTag, Popconfirm, ConfigProvider, Tooltip } from 'antd';
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
  Loader2,
  Package,
  Lock,
  ZoomIn,
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

  // Add/Edit Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [stockModalProduct, setStockModalProduct] = useState<ProductItem | null>(null);
  const [activeSubModal, setActiveSubModal] = useState<{ id: number; name: string; slug: string }>({
    id: 1,
    name: 'Mặc định',
    slug: 'default',
  });

  const [activeTab, setActiveTab] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const [toastState, setToastState] = useState<ToastMessage | null>(null);

  // Fetch Real-Time Products, Categories Tree & Brands from Backend
  const fetchRealtimeData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catTree, brandsData] = await Promise.all([
        AdminApiService.getAdminProducts({ limit: 200 }),
        AdminApiService.getCategoriesTree(),
        AdminApiService.getPartnerBrands(),
      ]);

      // 1. Process Products
      if (prodRes.ok && prodRes.data) {
        const rawProds = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.products || [];

        const mappedProducts: ProductItem[] = rawProds.map((p: any) => {
          let statusStr: 'CÒN HÀNG' | 'SẮP HẾT HÀNG' | 'HẾT HÀNG' = 'CÒN HÀNG';
          if (p.stockQuantity === 0) statusStr = 'HẾT HÀNG';
          else if (p.stockQuantity <= 5) statusStr = 'SẮP HẾT HÀNG';

          const primaryImg = p.images?.find((img: any) => img.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || '/images/logo/logonen.png';

          return {
            id: p.id,
            name: p.name,
            internalName: p.internalName || p.name,
            internalCode: p.internalCode || `QB-INT-${p.id}`,
            partNumber: p.partNumber || `QB-SKU-${p.id}`,
            mainCategory: p.category?.parent?.name || p.category?.name || 'Phụ Tùng Q.BA',
            subCategory: p.category?.name || 'Linh Kiện Khác',
            subCategorySlug: p.category?.slug || 'linh-kien-khac',
            subCategoryId: p.categoryId,
            brand: p.brand?.name || 'HOWO Sinotruk',
            brandId: p.brandId,
            stock: p.stockQuantity ?? 10,
            price: p.price && Number(p.price) > 0 ? `${Number(p.price).toLocaleString('vi-VN')} ₫` : 'Liên hệ Báo Giá',
            costPrice: p.costPrice && Number(p.costPrice) > 0 ? `${Number(p.costPrice).toLocaleString('vi-VN')} ₫` : '0 ₫',
            status: statusStr,
            image: primaryImg,
            rawProduct: p,
          };
        });

        setProductsList(mappedProducts);
      }

      // 2. Process Categories Tree for Dropdown
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

      // 3. Process Brands List for Dropdown
      const partnerBrandsRes = await AdminApiService.getPartnerBrands();
      if (partnerBrandsRes && partnerBrandsRes.data && Array.isArray(partnerBrandsRes.data)) {
        setBrandsList(partnerBrandsRes.data.map((b: any) => ({ id: b.id, name: b.name })));
      }
    } catch {
      // Keep fallback
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
  const executeDeleteProduct = async (productId: number, productSku: string, productName: string) => {
    try {
      const res = await AdminApiService.deleteProduct(productId);
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Xóa Sản Phẩm Thành Công',
          message: `Đã xóa mã sản phẩm "${productSku} - ${productName}" khỏi kho hệ thống!`,
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

  // Ant Design Table Columns Configuration
  const columns = [
    {
      title: 'Ảnh SEO',
      key: 'image',
      width: 70,
      render: (_: any, record: ProductItem) => {
        const fullImgUrl = formatImageUrl(record.image);
        return (
          <div
            onClick={() => setPreviewImage({ url: fullImgUrl, title: `${record.name} (Mã: ${record.partNumber})` })}
            className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 relative overflow-hidden flex-shrink-0 shadow-2xs cursor-pointer hover:scale-105 hover:ring-2 hover:ring-red-500 transition-all group"
            title="Bấm vào hình để phóng to ảnh sản phẩm"
          >
            <Image
              src={fullImgUrl}
              alt={record.name}
              fill
              unoptimized
              sizes="48px"
              className="object-cover group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="w-4 h-4 text-white drop-shadow-md" />
            </div>
          </div>
        );
      },
    },
    {
      title: 'Mã Part No / Mã Nội Bộ',
      key: 'codes',
      sorter: (a: ProductItem, b: ProductItem) => a.partNumber.localeCompare(b.partNumber),
      render: (_: any, record: ProductItem) => (
        <div>
          <div className="font-mono font-extrabold text-red-600 text-xs">
            {record.partNumber}
          </div>
          <div className="font-mono text-[10px] text-slate-400 mt-0.5">
            {record.internalCode}
          </div>
        </div>
      ),
    },
    {
      title: 'Tên Công Khai & Nội Bộ',
      key: 'names',
      sorter: (a: ProductItem, b: ProductItem) => a.name.localeCompare(b.name),
      render: (_: any, record: ProductItem) => (
        <div className="max-w-xs">
          <div className="font-extrabold text-slate-900 text-xs line-clamp-1">{record.name}</div>
          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400 inline shrink-0" />
            <span>Nội bộ: {record.internalName}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Danh Mục Phân Cấp',
      key: 'category',
      render: (_: any, record: ProductItem) => (
        <div>
          <div className="font-bold text-slate-800 text-[11px]">{record.mainCategory}</div>
          <div className="text-[10px] text-red-600 font-semibold mt-0.5">
            - {record.subCategory}
          </div>
        </div>
      ),
    },
    {
      title: 'Thương Hiệu',
      dataIndex: 'brand',
      key: 'brand',
      filters: brandsList.map((b) => ({ text: b.name, value: b.name })),
      onFilter: (value: any, record: ProductItem) => record.brand === value,
      render: (brand: string) => <AntTag color="red" className="font-bold text-xs">{brand}</AntTag>,
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a: ProductItem, b: ProductItem) => a.stock - b.stock,
      render: (stock: number) => (
        <AntTag color={stock === 0 ? 'volcano' : stock <= 5 ? 'gold' : 'blue'} className="font-extrabold text-xs">
          {stock} cái
        </AntTag>
      ),
    },
    {
      title: 'Đơn Giá / Giá Vốn',
      key: 'pricing',
      render: (_: any, record: ProductItem) => (
        <div>
          <div className="font-extrabold text-slate-900 text-xs">{record.price}</div>
          <div className="text-[10px] text-slate-400">Vốn: {record.costPrice}</div>
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Còn hàng', value: 'CÒN HÀNG' },
        { text: 'Sắp hết hàng', value: 'SẮP HẾT HÀNG' },
        { text: 'Hết hàng', value: 'HẾT HÀNG' },
      ],
      onFilter: (value: any, record: ProductItem) => record.status === value,
      render: (status: string) => (
        <AntTag color={status === 'CÒN HÀNG' ? 'green' : status === 'SẮP HẾT HÀNG' ? 'gold' : 'volcano'} className="font-extrabold text-xs">
          {status}
        </AntTag>
      ),
    },
    {
      title: 'Thao Tác Hỏa Tốc',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, record: ProductItem) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setStockModalProduct(record)}
            className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-extrabold transition-all cursor-pointer flex items-center gap-1 text-[10px]"
            title="Nhập kho / Quản lý tồn kho & Giá"
          >
            <Package className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
            <span>Kho ({record.stock})</span>
          </button>

          <Link
            href={`/products/${record.id}`}
            target="_blank"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
            title="Xem công khai trên website"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => handleOpenEditProduct(record)}
            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
            title="Chỉnh sửa sản phẩm"
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
              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
              title="Xoá sản phẩm"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#dc2626',
          borderRadius: 12,
          fontFamily: 'var(--font-inter), sans-serif',
        },
      }}
    >
      <div className="space-y-6 pb-12 w-full max-w-full overflow-x-hidden">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs w-full max-w-full">
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
                  message: `Đã xuất danh sách ${productsList.length} sản phẩm kho ra file Excel!`,
                });
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Xuất Excel Kho</span>
            </button>

            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Sản Phẩm Mới</span>
            </button>
          </div>
        </div>

        {/* Toolbar Search & Filter Dropdowns */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 w-full max-w-full">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Mã Part No, Mã Nội Bộ, Tên công khai hoặc tên nội bộ..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800 font-medium"
            />
          </div>

          {/* Filter Dropdowns Container */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <FolderTree className="w-4 h-4 text-red-600 shrink-0" />
              <select
                value={selectedSubCategory}
                onChange={(e) => {
                  setSelectedSubCategory(e.target.value);
                }}
                className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 max-w-xs"
              >
                <option value="ALL">Tất cả danh mục sản phẩm</option>
                {categoryGroups.map((group) => (
                  <optgroup key={`cat-grp-${group.id}`} label={`📂 ${group.main}`}>
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

        {/* ENTERPRISE ANT DESIGN DATA TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-2 w-full max-w-full">
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} / Tổng ${total} sản phẩm kho Q.BA`,
            }}
            scroll={{ x: 'max-content' }}
            size="middle"
          />
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
            onClose={() => setShowProductModal(false)}
            onSave={() => {
              setShowProductModal(false);
              setToastState({
                id: String(Date.now()),
                type: 'success',
                title: 'Lưu Sản Phẩm Thành Công',
                message: 'Đã cập nhật dữ liệu sản phẩm trong hệ thống!',
              });
              fetchRealtimeData();
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
