'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Layers,
  Truck,
  Plus,
  Edit,
  Trash2,
  Search,
  ShieldCheck,
  ChevronRight,
  FolderTree,
  FolderOpen,
  CornerDownRight,
  Package,
  ArrowRight,
  Eye,
  ChevronLeft,
} from 'lucide-react';
import { AdminApiService } from '@/services/adminApiService';
import AddCategoryModal from '@/components/admin/AddCategoryModal';
import SubCategoryProductsModal from '@/components/admin/SubCategoryProductsModal';
import AddProductModal from '@/components/admin/AddProductModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ToastNotification, { ToastMessage } from '@/components/ui/ToastNotification';

interface SubCategory {
  id: number;
  name: string;
  slug: string;
  productCount: number;
  description: string;
}

interface MainCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  subCategories: SubCategory[];
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

interface BrandItem {
  id: number;
  name: string;
  origin: string;
  status: string;
  logo: string;
}

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'BRANDS'>('CATEGORIES');
  const [searchMainQuery, setSearchMainQuery] = useState('');
  const [searchSubQuery, setSearchSubQuery] = useState('');

  // Selected Main Category ID (Master-Detail selection)
  const [selectedMainId, setSelectedMainId] = useState<number | null>(null);

  // Pagination States for Level 1 & Level 2 (7 items fill container height before paginating)
  const [mainCategoryPage, setMainCategoryPage] = useState<number>(1);
  const mainCategoriesPerPage = 7;

  const [subCategoryPage, setSubCategoryPage] = useState<number>(1);
  const subCategoriesPerPage = 7;

  // Real-Time Database Categories Tree State
  const [categoriesListState, setCategoriesListState] = useState<MainCategory[]>([]);

  // Sub-Category Products Modal State (Lazy Loaded)
  const [activeSubModal, setActiveSubModal] = useState<SubCategory | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Category Add/Edit Modal States
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [parentForSubCategory, setParentForSubCategory] = useState<{ id: number; name: string } | null>(null);
  const [editingCategoryData, setEditingCategoryData] = useState<{
    id: number;
    name: string;
    description?: string;
    parentId?: number | null;
  } | null>(null);

  // Real-Time Products State from PostgreSQL Database
  const [liveProductsList, setLiveProductsList] = useState<ProductItem[]>([]);

  // Brands Real-Time State & Modal Form States
  const [brandsListState, setBrandsListState] = useState<BrandItem[]>([]);
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [editingBrandData, setEditingBrandData] = useState<BrandItem | null>(null);
  const [brandNameInput, setBrandNameInput] = useState('');
  const [brandOriginInput, setBrandOriginInput] = useState('Trung Quốc');
  const [brandStatusInput, setBrandStatusInput] = useState('Hợp Tác Trực Tiếp');

  // Confirm Modal & Toast States
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    catId: number | null;
    catName: string;
    isSub: boolean;
    type?: 'CATEGORY' | 'BRAND';
    loading: boolean;
  }>({
    isOpen: false,
    catId: null,
    catName: '',
    isSub: false,
    type: 'CATEGORY',
    loading: false,
  });

  const [toastState, setToastState] = useState<ToastMessage | null>(null);

  // Load Real-Time Categories from Backend API
  const fetchRealtimeCategories = useCallback(async () => {
    try {
      const data = await AdminApiService.getCategoriesTree();
      if (data && data.length > 0) {
        const mappedList: MainCategory[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description || 'Chủng loại phụ tùng xe tải nặng Q.BA',
          subCategories: (item.children || []).map((sub) => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            productCount: sub._count?.products || 0,
            description: sub.description || 'Danh mục phụ con',
          })),
        }));
        setCategoriesListState(mappedList);
      }
    } catch {
      // API fetch fail
    }
  }, []);

  // Load Real-Time Products from Backend API
  const fetchRealtimeProducts = useCallback(async () => {
    try {
      const res = await AdminApiService.getAdminProducts({ limit: 100 });
      if (res.ok && res.data) {
        const mapped: ProductItem[] = res.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          internalName: p.internalName || p.name,
          internalCode: p.internalCode || `QB-SKU-${p.id}`,
          partNumber: p.partNumber || `PN-${p.id}`,
          subCategorySlug: p.category?.slug || '',
          subCategoryName: p.category?.name || '',
          brand: p.brand?.name || 'HOWO Sinotruk',
          brandId: p.brandId || p.brand?.id,
          stock: p.stockQuantity || 0,
          price: p.price && Number(p.price) > 0 ? `${Number(p.price).toLocaleString()} ₫` : 'Liên hệ Báo Giá',
          costPrice: p.costPrice ? `${Number(p.costPrice).toLocaleString()} ₫` : '0 ₫',
          description: p.description || '',
          image: p.images?.[0]?.imageUrl || '/images/vehicle-category/dongco.png',
        }));
        setLiveProductsList(mapped);
      }
    } catch {
      // API fetch fail
    }
  }, []);

  // Load Real-Time Brands from Backend API
  const fetchRealtimeBrands = useCallback(async () => {
    try {
      const res = await AdminApiService.getBrands();
      if (res.ok && res.data && res.data.length > 0) {
        const mapped: BrandItem[] = res.data.map((b: any) => ({
          id: b.id,
          name: b.name,
          origin: b.origin || 'Trung Quốc',
          status: b.status || 'Hợp Tác Trực Tiếp',
          logo: b.logoUrl || '/images/logo/logonen.png',
        }));
        setBrandsListState(mapped);
      }
    } catch {
      // API fetch fail
    }
  }, []);

  useEffect(() => {
    fetchRealtimeCategories();
    fetchRealtimeProducts();
    fetchRealtimeBrands();
  }, [fetchRealtimeCategories, fetchRealtimeProducts, fetchRealtimeBrands]);

  // Currently Active Main Category
  const activeMainCategory = useMemo(() => {
    return (
      categoriesListState.find((c) => c.id === selectedMainId) ||
      categoriesListState[0] ||
      null
    );
  }, [selectedMainId, categoriesListState]);

  // Filter Main Categories
  const filteredMainCategories = useMemo(() => {
    const q = searchMainQuery.toLowerCase().trim();
    if (!q) return categoriesListState;
    return categoriesListState.filter(
      (m) => m.name.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q)
    );
  }, [searchMainQuery, categoriesListState]);

  // Paginated Main Categories (Level 1 Pagination)
  const totalMainPages = Math.ceil(filteredMainCategories.length / mainCategoriesPerPage) || 1;
  const paginatedMainCategories = useMemo(() => {
    const start = (mainCategoryPage - 1) * mainCategoriesPerPage;
    return filteredMainCategories.slice(start, start + mainCategoriesPerPage);
  }, [filteredMainCategories, mainCategoryPage]);

  // Filter Sub Categories of active main category
  const filteredSubCategories = useMemo(() => {
    const q = searchSubQuery.toLowerCase().trim();
    if (!activeMainCategory || !activeMainCategory.subCategories) return [];
    if (!q) return activeMainCategory.subCategories;
    return activeMainCategory.subCategories.filter(
      (sub) => sub.name.toLowerCase().includes(q) || sub.slug.toLowerCase().includes(q)
    );
  }, [activeMainCategory, searchSubQuery]);

  // Paginated Sub Categories (Level 2 Pagination)
  const totalSubPages = Math.ceil(filteredSubCategories.length / subCategoriesPerPage) || 1;
  const paginatedSubCategories = useMemo(() => {
    const start = (subCategoryPage - 1) * subCategoriesPerPage;
    return filteredSubCategories.slice(start, start + subCategoriesPerPage);
  }, [filteredSubCategories, subCategoryPage]);

  const totalMainCategories = categoriesListState.length;
  const totalSubCategories = categoriesListState.reduce(
    (acc, cur) => acc + (cur.subCategories ? cur.subCategories.length : 0),
    0
  );

  // Real-Time Delete Category Handler
  const handleDeleteCategory = (cat: { id: number; name: string }, isSub: boolean) => {
    setDeleteConfirmState({
      isOpen: true,
      catId: cat.id,
      catName: cat.name,
      isSub,
      type: 'CATEGORY',
      loading: false,
    });
  };

  const handleDeleteBrand = (brand: { id: number; name: string }) => {
    setDeleteConfirmState({
      isOpen: true,
      catId: brand.id,
      catName: brand.name,
      isSub: false,
      type: 'BRAND',
      loading: false,
    });
  };

  const executeDeleteConfirm = async () => {
    if (!deleteConfirmState.catId) return;
    setDeleteConfirmState((prev) => ({ ...prev, loading: true }));

    if (deleteConfirmState.type === 'BRAND') {
      try {
        if (deleteConfirmState.catId) {
          await AdminApiService.deleteBrand(deleteConfirmState.catId);
        }
      } catch {
        // Fallback UI delete
      }

      setBrandsListState((prev) => prev.filter((b) => b.id !== deleteConfirmState.catId));
      setToastState({
        id: String(Date.now()),
        type: 'success',
        title: 'Xóa Thành Công',
        message: `Đã xóa thương hiệu "${deleteConfirmState.catName}" khỏi danh sách đối tác Q.BA!`,
      });
      setDeleteConfirmState({ isOpen: false, catId: null, catName: '', isSub: false, type: 'CATEGORY', loading: false });
      return;
    }

    const targetId = deleteConfirmState.catId;
    const isSub = deleteConfirmState.isSub;

    try {
      const res = await AdminApiService.deleteCategory(targetId);
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Xóa Thành Công',
          message: `Đã xóa ${isSub ? 'danh mục phụ' : 'danh mục chính'} "${deleteConfirmState.catName}" khỏi cơ sở dữ liệu!`,
        });

        // Optimistic UI state update & automatic page index adjustment
        setCategoriesListState((prev) => {
          if (isSub) {
            return prev.map((cat) => ({
              ...cat,
              subCategories: cat.subCategories ? cat.subCategories.filter((s) => s.id !== targetId) : [],
            }));
          } else {
            const nextList = prev.filter((cat) => cat.id !== targetId);
            const newTotalPages = Math.max(1, Math.ceil(nextList.length / mainCategoriesPerPage));
            setMainCategoryPage((curr) => Math.min(curr, newTotalPages));
            if (selectedMainId === targetId) {
              setSelectedMainId(nextList[0]?.id || null);
            }
            return nextList;
          }
        });

        // Sync with backend DB
        fetchRealtimeCategories();
      } else {
        setToastState({
          id: String(Date.now()),
          type: 'error',
          title: 'Xóa Thất Bại',
          message: res.error?.message || res.message || 'Không thể xóa danh mục này.',
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
      setDeleteConfirmState({ isOpen: false, catId: null, catName: '', isSub: false, type: 'CATEGORY', loading: false });
    }
  };

  const handleSaveBrand = async () => {
    if (!brandNameInput.trim()) return;

    if (editingBrandData) {
      try {
        await AdminApiService.updateBrand(editingBrandData.id, { name: brandNameInput.trim() });
      } catch { }

      setBrandsListState((prev) =>
        prev.map((b) =>
          b.id === editingBrandData.id
            ? { ...b, name: brandNameInput.trim(), origin: brandOriginInput, status: brandStatusInput }
            : b
        )
      );
      setToastState({
        id: String(Date.now()),
        type: 'success',
        title: 'Cập Nhật Thành Công',
        message: `Đã cập nhật thông tin thương hiệu "${brandNameInput.trim()}"!`,
      });
    } else {
      let createdId = Date.now();
      try {
        const res = await AdminApiService.createBrand({ name: brandNameInput.trim() });
        if (res.ok && res.data) {
          createdId = res.data.id;
        }
      } catch { }

      const newBrand: BrandItem = {
        id: createdId,
        name: brandNameInput.trim(),
        origin: brandOriginInput,
        status: brandStatusInput,
        logo: '/images/logo/logonen.png',
      };
      setBrandsListState((prev) => [newBrand, ...prev]);
      setToastState({
        id: String(Date.now()),
        type: 'success',
        title: 'Thêm Thành Công',
        message: `Đã thêm thương hiệu mới "${brandNameInput.trim()}" vào hệ thống!`,
      });
    }

    setShowAddBrandModal(false);
    setEditingBrandData(null);
    setBrandNameInput('');
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FolderTree className="w-6 h-6 text-red-600" />
              <span>Quản Lý Danh Mục & Thương Hiệu (Real-Time Database)</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
              {totalMainCategories} Danh Mục Chính • {totalSubCategories} Danh Mục Phụ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý cấu trúc danh mục phụ tùng xe tải và danh sách các thương hiệu nhà máy sản xuất.
          </p>
        </div>
      </div>

      {/* Master-Detail Split Panel View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel (Col 4): List of Main Categories with Level 1 Pagination */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[630px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 space-y-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-red-600" />
                  <span>DANH MỤC CHÍNH ({totalMainCategories})</span>
                </h3>
                <button
                  onClick={() => {
                    setParentForSubCategory(null);
                    setEditingCategoryData(null);
                    setShowAddCategoryModal(true);
                  }}
                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  title="Tạo danh mục chính mới"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo Chính</span>
                </button>
              </div>

              {/* Quick Filter Input */}
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchMainQuery}
                  onChange={(e) => {
                    setSearchMainQuery(e.target.value);
                    setMainCategoryPage(1);
                  }}
                  placeholder="Lọc danh mục chính..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800"
                />
              </div>
            </div>

            {/* Paginated Main Category List */}
            <div className="divide-y divide-slate-100 flex-1">
              {paginatedMainCategories.map((mainCat) => {
                const isSelected = mainCat.id === selectedMainId;
                const totalSub = mainCat.subCategories ? mainCat.subCategories.length : 0;
                const totalProds = mainCat.subCategories
                  ? mainCat.subCategories.reduce((acc, c) => acc + c.productCount, 0)
                  : 0;

                return (
                  <div
                    key={`main-item-${mainCat.id}`}
                    onClick={() => {
                      setSelectedMainId(mainCat.id);
                      setSubCategoryPage(1);
                    }}
                    className={`p-3.5 transition-all cursor-pointer flex items-center justify-between border-l-4 ${isSelected
                        ? 'border-l-red-600 bg-red-50/50 shadow-2xs'
                        : 'border-l-transparent hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <h4
                          className={`font-extrabold text-xs sm:text-sm truncate ${isSelected ? 'text-red-600' : 'text-slate-900'
                            }`}
                        >
                          {mainCat.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono truncate">/{mainCat.slug}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                      <div className="text-right hidden sm:block">
                        <span className="block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {totalSub} mục phụ
                        </span>
                        <span className="block text-[9px] font-mono text-slate-400 mt-0.5">
                          {totalProds} mã SP
                        </span>
                      </div>

                      {/* Action Buttons for Main Category */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setParentForSubCategory(null);
                            setEditingCategoryData(mainCat);
                            setShowAddCategoryModal(true);
                          }}
                          className="p-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                          title="Sửa danh mục chính"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(mainCat, false)}
                          className="p-1 rounded-md bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                          title="Xoá danh mục chính"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${isSelected ? 'text-red-600 translate-x-0.5' : 'text-slate-300'
                          }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Level 1 Pagination Bar for Main Categories */}
            <div className="p-2.5 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs flex-shrink-0">
              <span className="text-[11px] text-slate-500 font-semibold">
                Trang <strong className="text-slate-900">{mainCategoryPage}</strong> / {totalMainPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={mainCategoryPage === 1}
                  onClick={() => setMainCategoryPage((p) => Math.max(p - 1, 1))}
                  className="p-1 rounded-md bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-700" />
                </button>
                <button
                  disabled={mainCategoryPage === totalMainPages}
                  onClick={() => setMainCategoryPage((p) => Math.min(p + 1, totalMainPages))}
                  className="p-1 rounded-md bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel (Col 8): Sub Categories & Products of Selected Main Category */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[630px]">
            {/* Panel Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-extrabold text-[10px] uppercase">
                      DANH MỤC CHÍNH ĐANG CHỌN
                    </span>
                    <h2 className="font-extrabold text-slate-900 text-lg">
                      {activeMainCategory?.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-xl">
                    {activeMainCategory?.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => {
                    setParentForSubCategory({ id: activeMainCategory.id, name: activeMainCategory.name });
                    setEditingCategoryData(null);
                    setShowAddCategoryModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-900/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Mục Phụ</span>
                </button>
              </div>
            </div>

            {/* Sub Categories Filter Bar & Direct Product Link */}
            <div className="p-3 bg-slate-100/60 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchSubQuery}
                  onChange={(e) => {
                    setSearchSubQuery(e.target.value);
                    setSubCategoryPage(1);
                  }}
                  placeholder="Tìm tên danh mục phụ con..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500">
                  Hiển thị: <strong className="text-red-600">{filteredSubCategories.length}</strong> danh mục phụ
                </span>
                <Link
                  href={`/admin/products?categorySlug=${activeMainCategory?.slug}`}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-red-600 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Package className="w-3.5 h-3.5 text-red-600" />
                  <span>Quản Lý Tất Cả Sản Phẩm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Sub Categories Data Table View with Always-Visible Red Scrollbar */}
            <div className="max-h-[390px] overflow-y-scroll flex-1 custom-scrollbar pr-1">
              {paginatedSubCategories.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-600">Chưa có danh mục phụ phù hợp trong nhóm này</h4>
                  <button
                    onClick={() => {
                      setParentForSubCategory({ id: activeMainCategory.id, name: activeMainCategory.name });
                      setEditingCategoryData(null);
                      setShowAddCategoryModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Thêm danh mục phụ đầu tiên
                  </button>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse relative">
                  <thead className="sticky top-0 z-10 shadow-2xs">
                    <tr className="bg-slate-100/95 backdrop-blur-xs text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3 pl-5">Tên Danh Mục Phụ Con</th>
                      <th className="p-3">Đường Dẫn Slug</th>
                      <th className="p-3">Mô Tả Phụ Tùng</th>
                      <th className="p-3">Số Lượng Kho</th>
                      <th className="p-3 pr-5 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedSubCategories.map((sub) => (
                      <tr key={`sub-row-${sub.id}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 pl-5">
                          <div className="flex items-center gap-2">
                            <CornerDownRight className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                              {sub.name}
                            </span>
                          </div>
                        </td>

                        <td className="p-3 font-mono text-slate-500 font-semibold">/{sub.slug}</td>

                        <td className="p-3 text-slate-500 max-w-xs">
                          <p className="line-clamp-1 leading-snug">{sub.description}</p>
                        </td>

                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold border border-emerald-200/80 cursor-default">
                            <Package className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{sub.productCount} mã SP</span>
                          </span>
                        </td>

                        <td className="p-3 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActiveSubModal(sub)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="Xem danh sách sản phẩm & upload ảnh của danh mục phụ này"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem SP</span>
                            </button>

                            <button
                              onClick={() => {
                                setParentForSubCategory({ id: activeMainCategory.id, name: activeMainCategory.name });
                                setEditingCategoryData({ id: sub.id, name: sub.name, description: sub.description, iconUrl: sub.iconUrl, parentId: activeMainCategory.id });
                                setShowAddCategoryModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                              title="Sửa danh mục phụ"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteCategory(sub, true)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                              title="Xoá danh mục phụ"
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

            {/* Level 2 Pagination Bar for Sub Categories */}
            <div className="p-3 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs flex-shrink-0">
              <span className="text-xs text-slate-500 font-semibold">
                Hiển thị trang <strong className="text-slate-900">{subCategoryPage}</strong> trên tổng số {totalSubPages} trang danh mục phụ
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={subCategoryPage === 1}
                  onClick={() => setSubCategoryPage((p) => Math.max(p - 1, 1))}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors font-bold cursor-pointer"
                >
                  Trang Trước
                </button>
                <button
                  disabled={subCategoryPage === totalSubPages}
                  onClick={() => setSubCategoryPage((p) => Math.min(p + 1, totalSubPages))}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors font-bold cursor-pointer"
                >
                  Trang Sau
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {showAddCategoryModal && (
        <AddCategoryModal
          parentCategory={parentForSubCategory}
          editingCategory={editingCategoryData}
          onClose={() => {
            setShowAddCategoryModal(false);
            setEditingCategoryData(null);
            setParentForSubCategory(null);
          }}
          onSuccess={() => {
            setShowAddCategoryModal(false);
            setEditingCategoryData(null);
            setParentForSubCategory(null);
            fetchRealtimeCategories();
          }}
        />
      )}

      {/* WIDESCREEN PRODUCT MODAL */}
      {activeSubModal && (
        <SubCategoryProductsModal
          activeSubModal={activeSubModal}
          onClose={() => setActiveSubModal(null)}
          productsMock={liveProductsList}
          onOpenAddProductModal={() => {
            setEditingProduct(null);
            setShowAddProductModal(true);
          }}
          onEditProduct={(prod) => {
            setEditingProduct(prod);
            setShowAddProductModal(true);
          }}
          onRefreshProducts={() => {
            fetchRealtimeCategories();
            fetchRealtimeProducts();
          }}
        />
      )}

      {/* ADD / EDIT PRODUCT & SEO IMAGE MODAL */}
      {showAddProductModal && activeSubModal && (
        <AddProductModal
          activeSubModal={activeSubModal}
          editingProduct={editingProduct}
          onClose={() => {
            setShowAddProductModal(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            setShowAddProductModal(false);
            setEditingProduct(null);
            fetchRealtimeCategories();
            fetchRealtimeProducts();
          }}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={deleteConfirmState.isOpen}
        title={
          deleteConfirmState.type === 'BRAND'
            ? 'Xóa Thương Hiệu Phụ Tùng'
            : deleteConfirmState.isSub
              ? 'Xóa Danh Mục Phụ Con'
              : 'Xóa Danh Mục Chính'
        }
        message={
          deleteConfirmState.type === 'BRAND'
            ? 'Bạn có chắc chắn muốn xóa thương hiệu này khỏi danh sách đối tác phụ tùng xe tải nặng Q.BA không?'
            : `Bạn có chắc chắn muốn xóa ${deleteConfirmState.isSub ? 'danh mục phụ' : 'danh mục chính'} khỏi hệ thống kho phụ tùng Q.BA?`
        }
        itemName={deleteConfirmState.catName}
        confirmText="Xác Nhận Xóa"
        cancelText="Hủy Bỏ"
        isLoading={deleteConfirmState.loading}
        onConfirm={executeDeleteConfirm}
        onCancel={() => setDeleteConfirmState({ isOpen: false, catId: null, catName: '', isSub: false, type: 'CATEGORY', loading: false })}
      />

      {/* TOAST NOTIFICATION */}
      <ToastNotification toast={toastState} onClose={() => setToastState(null)} />

      {/* CREATE / EDIT BRAND MODAL */}
      {showAddBrandModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingBrandData ? 'Chỉnh Sửa Thương Hiệu' : 'Thêm Thương Hiệu Nhà Máy Mới'}
              </h3>
              <button
                onClick={() => setShowAddBrandModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Hãng Sản Xuất (*)</label>
                <input
                  type="text"
                  value={brandNameInput}
                  onChange={(e) => setBrandNameInput(e.target.value)}
                  placeholder="Ví dụ: HOWO Sinotruk, Shacman..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Xuất Xứ Nhà Máy</label>
                <input
                  type="text"
                  value={brandOriginInput}
                  onChange={(e) => setBrandOriginInput(e.target.value)}
                  placeholder="Ví dụ: Trung Quốc, Hà Lan..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Trạng Thái Hợp Tác Kho Q.BA</label>
                <select
                  value={brandStatusInput}
                  onChange={(e) => setBrandStatusInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800"
                >
                  <option value="Hợp Tác Trực Tiếp">Hợp Tác Trực Tiếp</option>
                  <option value="Đại Lý Phân Phối">Đại Lý Phân Phối</option>
                  <option value="Đối Tác Chiến Lược">Đối Tác Chiến Lược</option>
                  <option value="Nhập Khẩu Chính Hãng">Nhập Khẩu Chính Hãng</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowAddBrandModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveBrand}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-900/30 cursor-pointer"
              >
                Lưu Thương Hiệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
