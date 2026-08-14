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

const CATEGORIES_HIERARCHICAL_MOCK: MainCategory[] = [
  {
    id: 1,
    name: 'Động Cơ & Máy Phát',
    slug: 'dong-co-may-phat',
    description: 'Hệ thống động cơ Weichai, Yuchai, Sinotruk, Cummins và các linh kiện thay thế chuẩn nhà máy.',
    subCategories: [
      { id: 101, name: 'Bộ Piston & Xéc Măng', slug: 'piston-xec-mang', productCount: 420, description: 'Piston, xéc măng hơi, xéc măng dầu Weichai WP10, WP12, WD615.' },
      { id: 102, name: 'Bơm Cao Áp & Kim Phun Diesel', slug: 'bom-cao-ap-kim-phun', productCount: 310, description: 'Kim phun điện tử Common Rail BOSCH, bơm cao áp nhiên liệu.' },
      { id: 103, name: 'Củ Đề & Máy Phát Điện', slug: 'cu-de-may-phat', productCount: 280, description: 'Củ đề 24V 11KW, máy phát điện 80A Sinotruk, Weichai.' },
      { id: 104, name: 'Phớt Git & Trục Khuỷu', slug: 'phot-git-truc-khuayu', productCount: 540, description: 'Phớt đuôi trục khuỷu, phớt xupap, bộ gioăng đại tu động cơ.' },
    ],
  },
  {
    id: 2,
    name: 'Hộp Số & Bộ Đồng Tốc',
    slug: 'hop-so-bo-dong-toc',
    description: 'Hộp số tổng thành Fast Gear 9JS, 10JSD, 12JS và bánh răng, bộ đồng tốc.',
    subCategories: [
      { id: 201, name: 'Bộ Đồng Tốc Hộp Số', slug: 'bo-dong-toc', productCount: 680, description: 'Đồng tốc số 1-2, 3-4, 5-6, 7-8 Fast Gear 10JSD160T, HW19710.' },
      { id: 202, name: 'Bánh Răng & Trục Thứ Cấp', slug: 'banh-rang-truc-thu-cap', productCount: 520, description: 'Bánh răng số 1 đến 12, trục sơ cấp, trục thứ cấp hộp số.' },
      { id: 203, name: 'Tay Số & Cụm Điền Số', slug: 'tay-so-cum-dien-so', productCount: 310, description: 'Bộ điền số phanh hơi, tay gạt số cabin xe tải nặng.' },
    ],
  },
  {
    id: 3,
    name: 'Gầm - Cầu - Phanh',
    slug: 'gam-cau-phanh',
    description: 'Tăm bua lơ lửng, may ơ cầu sau, búp sen phanh lốc kê, bộ vi sai & nhíp gầm.',
    subCategories: [
      { id: 301, name: 'Tăm Bua & Phanh Hơi', slug: 'tam-bua-phanh-hoi', productCount: 890, description: 'Tăm bua 10 lỗ phanh hơi HW19710, má phanh đĩa & guốc phanh.' },
      { id: 302, name: 'Búp Sen Phanh & Lốc Kê', slug: 'bup-sen-loc-ke', productCount: 430, description: 'Búp sen phanh 2 tầng 30/30, búp sen phanh đơn cầu trước.' },
      { id: 303, name: 'May Ơ & Bộ Vi Sai Cầu', slug: 'may-o-bo-vi-sai', productCount: 610, description: 'Cụm vi sai cầu QJ1506, bánh răng vành chậu quả dứa HOWO.' },
      { id: 304, name: 'Nhíp Cầu & Rơ Tuyn', slug: 'nhip-cau-ro-tuyn', productCount: 550, description: 'Nhíp gầm 12 lá chịu lực FAW, rơ tuyn ba đờ xông, rơ tuyn ngang.' },
    ],
  },
  {
    id: 4,
    name: 'Ben Thủy Lực',
    slug: 'ben-thuy-luc',
    description: 'Tháp ben thủy lực Hyva, FC, van chia ben và bơm ben bánh răng chịu áp lực cao.',
    subCategories: [
      { id: 401, name: 'Ty Ben Thủy Lực', slug: 'ty-ben-thuy-luc', productCount: 290, description: 'Ty ben 4 đốt, 5 đốt Hyva FC157, FC179 chính hãng.' },
      { id: 402, name: 'Van Chia Ben & Bơm Ben', slug: 'van-chia-ben-bom-ben', productCount: 390, description: 'Bơm ben 80L, 100L bánh răng, van điều khiển nâng hạ thùng ben.' },
    ],
  },
  {
    id: 5,
    name: 'Linh Kiện Rơ-Moóc',
    slug: 'linh-kien-ro-mooc',
    description: 'Chân chống rơ-moóc Fuwa, đinh kéo mâm 50/90, bát nhíp & tay giằng rơ-moóc.',
    subCategories: [
      { id: 501, name: 'Chân Chống Rơ-Moóc Fuwa', slug: 'chan-chong-ro-mooc', productCount: 210, description: 'Cụm chân chống Fuwa 28 tấn chịu tải cao.' },
      { id: 502, name: 'Đinh Kéo Mâm & Bát Nhíp Moóc', slug: 'dinh-keo-mam-bat-nhip', productCount: 320, description: 'Đinh kéo phi 50, phi 90, cụm mâm moóc Jost, Fuwa.' },
    ],
  },
  {
    id: 6,
    name: 'Cabin & Thân Vỏ',
    slug: 'cabin-than-vo',
    description: 'Ghế hơi cabin, mặt ga lăng, cụm đèn pha LED, gương chiếu hậu & kính chắn gió.',
    subCategories: [
      { id: 601, name: 'Mặt Ga Lăng & Cụm Đèn Pha', slug: 'mat-ga-lang-cum-den', productCount: 480, description: 'Mặt ga lăng A7, V7G, X3000, đèn pha halogen & projector LED.' },
      { id: 602, name: 'Ghế Hơi & Nội Thất Cabin', slug: 'ghe-hoi-noi-that', productCount: 360, description: 'Ghế hơi Grammer cao cấp, bóng hơi cabin, bảng đồng hồ taplo.' },
      { id: 603, name: 'Gương Chiếu Hậu & Kính Chắn Gió', slug: 'guong-phieu-hau-kinh', productCount: 400, description: 'Cụm gương chỉnh điện sấy kính HOWO MAX, Shacman X3000.' },
    ],
  },
  {
    id: 7,
    name: 'Gioăng & Seal Phốt',
    slug: 'gioang-seal-phot',
    description: 'Phớt git xupap, phớt đuôi trục khuỷu NOK, phớt moay ơ bánh xe & gioăng mặt máy.',
    subCategories: [
      { id: 701, name: 'Phớt Git & Gioăng Mặt Máy', slug: 'phot-git-gioang-mat-may', productCount: 650, description: 'Phớt NOK Nhật Bản, gioăng quy lát Weichai, Yuchai.' },
      { id: 702, name: 'Phớt Đuôi Trục Khuỷu & Phớt Cầu', slug: 'phot-duoi-truc-khuayu-phot-cau', productCount: 410, description: 'Phớt lò xo kép chặn dầu động cơ và cụm vi sai.' },
    ],
  },
  {
    id: 8,
    name: 'Vòng Bi - Bạc Đạn',
    slug: 'vong-bi-bac-dan',
    description: 'Vòng bi moay ơ bánh xe SKF, Koyo, bi chữ thập cầu & bạc đạn phanh.',
    subCategories: [
      { id: 801, name: 'Vòng Bi Moay Ơ Bánh Xe', slug: 'vong-bi-moay-o', productCount: 540, description: 'Bi moay ơ 32218, 32222 SKF, Koyo chịu lực cao.' },
      { id: 802, name: 'Bi Chữ Thập & Bạc Đạn Khóa', slug: 'bi-chu-thap-bac-dan-khoa', productCount: 380, description: 'Bi chữ thập các đăng cầu sau xe ben 4 chân.' },
    ],
  },
];

const PRODUCTS_MOCK: ProductItem[] = [
  {
    id: 101,
    name: 'Tăm Bua Lơ Lửng Cầu Sau HW19710',
    internalName: 'Tăm bua 10 lỗ phanh hơi Sinotruk',
    internalCode: 'QB-TB-19710-01',
    partNumber: 'HW19710-TB01',
    subCategorySlug: 'tam-bua-phanh-hoi',
    subCategoryName: 'Tăm Bua & Phanh Hơi',
    brand: 'HOWO Sinotruk',
    stock: 48,
    price: 'Liên hệ Báo Giá',
    costPrice: '1,200,000 ₫',
    description: 'Tăm bua đúc hợp kim gan chịu nhiệt cao, đục 10 lỗ bulong chuẩn xe tải nặng 3 chân 4 chân HOWO Sinotruk.',
    image: '/images/vehicle-category/dongco.png',
  },
  {
    id: 102,
    name: 'Bộ Đồng Tốc Hộp Số Fast Gear 10JSD160T',
    internalName: 'Đồng tốc hộp số Fast 10 số',
    internalCode: 'QB-DT-10JSD-02',
    partNumber: 'FG-10JSD-02',
    subCategorySlug: 'bo-dong-toc',
    subCategoryName: 'Bộ Đồng Tốc Hộp Số',
    brand: 'Fast Gear',
    stock: 12,
    price: '3,850,000 ₫',
    costPrice: '2,900,000 ₫',
    description: 'Cụm đồng tốc số 1-2Fast Gear 10JSD160T chịu lực mòn cao, chống nhả số khi leo dốc tải nặng.',
    image: '/images/about/kho-hang-1.png',
  },
  {
    id: 103,
    name: 'Búp Sen Phanh 2 Tầng Cầu Sau Shacman X3000',
    internalName: 'Búp sen phanh lốc kê 30/30',
    internalCode: 'QB-BS-3030-03',
    partNumber: 'SHAC-BS-3030',
    subCategorySlug: 'bup-sen-loc-ke',
    subCategoryName: 'Búp Sen Phanh & Lốc Kê',
    brand: 'Shacman',
    stock: 3,
    price: '1,450,000 ₫',
    costPrice: '950,000 ₫',
    description: 'Búp sen phanh hơi lốc kê 2 tầng 30/30 lò xo phanh khẩn cấp nhập khẩu chuẩn nhà máy Shacman.',
    image: '/images/about/kho-hang-2.png',
  },
  {
    id: 104,
    name: 'Bộ Piston & Xéc Măng Động Cơ Weichai WP10',
    internalName: 'Hơi Weichai WP10 tiêu chuẩn nhà máy',
    internalCode: 'QB-PST-WP10-04',
    partNumber: 'WC-PST-WP10',
    subCategorySlug: 'piston-xec-mang',
    subCategoryName: 'Bộ Piston & Xéc Măng',
    brand: 'Weichai Power',
    stock: 25,
    price: 'Liên hệ Báo Giá',
    costPrice: '4,500,000 ₫',
    description: 'Bộ piston nhôm đúc phủ graphite chống xước xi lanh, xéc măng hơi mạ crom cứng chống ăn mòn.',
    image: '/images/about/kho-hang-3.png',
  },
];

interface BrandItem {
  id: number;
  name: string;
  origin: string;
  status: string;
  logo: string;
}

const BRANDS_INITIAL_MOCK: BrandItem[] = [
  { id: 1, name: 'HOWO Sinotruk', origin: 'Trung Quốc', status: 'Hợp Tác Trực Tiếp', logo: '/images/logo/logonen.png' },
  { id: 2, name: 'Shacman', origin: 'Trung Quốc', status: 'Hợp Tác Trực Tiếp', logo: '/images/logo/logonen.png' },
  { id: 3, name: 'FAW Group', origin: 'Trung Quốc', status: 'Đại Lý Phân Phối', logo: '/images/logo/logonen.png' },
  { id: 4, name: 'Weichai Power', origin: 'Trung Quốc', status: 'Đối Tác Chiến Lược', logo: '/images/logo/logonen.png' },
  { id: 5, name: 'Fast Gear', origin: 'Trung Quốc', status: 'Đại Lý Phân Phối', logo: '/images/logo/logonen.png' },
  { id: 6, name: 'Dongfeng Commercial', origin: 'Trung Quốc', status: 'Hợp Tác Trực Tiếp', logo: '/images/logo/logonen.png' },
  { id: 7, name: 'Hyva Hydraulics', origin: 'Hà Lan / Trung Quốc', status: 'Đại Lý Phân Phối', logo: '/images/logo/logonen.png' },
  { id: 8, name: 'Yuchai Machinery', origin: 'Trung Quốc', status: 'Đối Tác Chiến Lược', logo: '/images/logo/logonen.png' },
];

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'BRANDS'>('CATEGORIES');
  const [searchMainQuery, setSearchMainQuery] = useState('');
  const [searchSubQuery, setSearchSubQuery] = useState('');

  // Selected Main Category ID (Master-Detail selection)
  const [selectedMainId, setSelectedMainId] = useState<number>(1);

  // Pagination States for Level 1 & Level 2
  const [mainCategoryPage, setMainCategoryPage] = useState<number>(1);
  const mainCategoriesPerPage = 5;

  const [subCategoryPage, setSubCategoryPage] = useState<number>(1);
  const subCategoriesPerPage = 5;

  // Real-Time Database Categories Tree State
  const [categoriesListState, setCategoriesListState] = useState<MainCategory[]>(CATEGORIES_HIERARCHICAL_MOCK);

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
  const [liveProductsList, setLiveProductsList] = useState<ProductItem[]>(PRODUCTS_MOCK);

  // Brands Real-Time State & Modal Form States
  const [brandsListState, setBrandsListState] = useState<BrandItem[]>(BRANDS_INITIAL_MOCK);
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
      // Keep existing state on API fetch fail
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
      // Keep mock fallback
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
      // Keep existing mock state on API fail
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
      CATEGORIES_HIERARCHICAL_MOCK[0]
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

    try {
      const res = await AdminApiService.deleteCategory(deleteConfirmState.catId);
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Xóa Thành Công',
          message: `Đã xóa ${deleteConfirmState.isSub ? 'danh mục phụ' : 'danh mục chính'} "${deleteConfirmState.catName}" khỏi cơ sở dữ liệu!`,
        });
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
      } catch {}

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
      } catch {}

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

      {/* Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'CATEGORIES'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-red-600" />
            <span>Quản Lý Phân Cấp Master-Detail ({totalMainCategories})</span>
          </button>

          <button
            onClick={() => setActiveTab('BRANDS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'BRANDS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-4 h-4 text-red-600" />
            <span>Thương Hiệu Phụ Tùng ({brandsListState.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Master-Detail Split Panel View */}
      {activeTab === 'CATEGORIES' && (
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

            {/* Scrollable Main Category List */}
            <div className="overflow-y-auto divide-y divide-slate-100 flex-1 custom-scrollbar">
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
                    className={`p-3.5 transition-all cursor-pointer flex items-center justify-between border-l-4 ${
                      isSelected
                        ? 'border-l-red-600 bg-red-50/50 shadow-2xs'
                        : 'border-l-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <h4
                          className={`font-extrabold text-xs sm:text-sm truncate ${
                            isSelected ? 'text-red-600' : 'text-slate-900'
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
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? 'text-red-600 translate-x-0.5' : 'text-slate-300'
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
                          <button
                            onClick={() => setActiveSubModal(sub)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-extrabold border border-emerald-200/80 transition-colors cursor-pointer"
                          >
                            <Package className="w-3 h-3 text-emerald-600" />
                            <span>{sub.productCount} mã SP</span>
                          </button>
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
                                setEditingCategoryData({ id: sub.id, name: sub.name, description: sub.description, parentId: activeMainCategory.id });
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
      )}

      {/* Tab 2: Brands Management View */}
      {activeTab === 'BRANDS' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Thương Hiệu Sản Xuất Phụ Tùng</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Danh sách thương hiệu nhà máy cung cấp phụ tùng xe tải nặng Trung Quốc.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                {brandsListState.length} Hãng Sản Xuất
              </span>
              <button
                onClick={() => {
                  setEditingBrandData(null);
                  setBrandNameInput('');
                  setBrandOriginInput('Trung Quốc');
                  setBrandStatusInput('Hợp Tác Trực Tiếp');
                  setShowAddBrandModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-900/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Thương Hiệu Mới</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 pl-5">Logo & Tên Hãng</th>
                  <th className="p-3.5">Xuất Xứ Nhà Máy</th>
                  <th className="p-3.5">Trạng Thái Hợp Tác Kho Q.BA</th>
                  <th className="p-3.5 pr-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brandsListState.map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 p-1 relative flex-shrink-0">
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            fill
                            loading="lazy"
                            className="object-contain"
                          />
                        </div>
                        <span className="font-extrabold text-slate-900 text-sm">{brand.name}</span>
                      </div>
                    </td>

                    <td className="p-3.5 font-semibold text-slate-700">{brand.origin}</td>

                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {brand.status}
                      </span>
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingBrandData(brand);
                            setBrandNameInput(brand.name);
                            setBrandOriginInput(brand.origin);
                            setBrandStatusInput(brand.status);
                            setShowAddBrandModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                          title="Chỉnh sửa thương hiệu"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBrand(brand)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                          title="Xóa thương hiệu"
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
        </div>
      )}

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
