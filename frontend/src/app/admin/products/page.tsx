'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
} from 'lucide-react';


const PRODUCTS_MOCK = [
  {
    id: 101,
    name: 'Tăm Bua Lơ Lửng Cầu Sau HW19710',
    internalName: 'Tăm bua 10 lỗ phanh hơi Sinotruk',
    sku: 'HW19710-TB01',
    category: 'Gầm - Cầu - Phanh',
    brand: 'HOWO Sinotruk',
    stock: 48,
    price: 'Liên hệ Báo Giá',
    status: 'CÒN HÀNG',
    image: '/images/hero-section/hero-3d-part.png',
  },
  {
    id: 102,
    name: 'Bộ Đồng Tốc Hộp Số Fast Gear 10JSD160T',
    internalName: 'Đồng tốc hộp số Fast 10 số',
    sku: 'FG-10JSD-02',
    category: 'Hộp Số & Đồng Tốc',
    brand: 'Fast Gear',
    stock: 12,
    price: '3,850,000 ₫',
    status: 'CÒN HÀNG',
    image: '/images/about/kho-hang-1.png',
  },
  {
    id: 103,
    name: 'Búp Sen Phanh 2 Tầng Cầu Sau Shacman X3000',
    internalName: 'Búp sen phanh lốc kê 30/30',
    sku: 'SHAC-BS-3030',
    category: 'Gầm - Cầu - Phanh',
    brand: 'Shacman',
    stock: 3,
    price: '1,450,000 ₫',
    status: 'SẮP HẾT HÀNG',
    image: '/images/about/kho-hang-2.png',
  },
  {
    id: 104,
    name: 'Bộ Piston & Xéc Măng Động Cơ Weichai WP10',
    internalName: 'Hơi Weichai WP10 tiêu chuẩn nhà máy',
    sku: 'WC-PST-WP10',
    category: 'Động Cơ',
    brand: 'Weichai Power',
    stock: 25,
    price: 'Liên hệ Báo Giá',
    status: 'CÒN HÀNG',
    image: '/images/about/kho-hang-3.png',
  },
  {
    id: 105,
    name: 'Phớt Trục Khuỷu Sau Động Cơ Yuchai YC6MK',
    internalName: 'Phớt đuôi trục khuỷu Yuchai 420HP',
    sku: 'YC-PT-6MK',
    category: 'Seal Phốt Làm Kín',
    brand: 'Yuchai',
    stock: 0,
    price: '280,000 ₫',
    status: 'HẾT HÀNG',
    image: '/images/about/kho-hang-4.png',
  },
  {
    id: 106,
    name: 'Nhíp Cầu Sau 12 Lá Chịu Lực FAW J6P',
    internalName: 'Bộ nhíp gầm FAW 4 chân 12 lá',
    sku: 'FAW-NCS-12L',
    category: 'Khung Gầm & Nhíp Cầu',
    brand: 'FAW',
    stock: 18,
    price: 'Liên hệ Báo Giá',
    status: 'CÒN HÀNG',
    image: '/images/about/kho-hang-5.png',
  },
];

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredProducts = PRODUCTS_MOCK.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.internalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Quản Lý Phụ Tùng Kho Q.BA
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
              10,480 Mã SP
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu, cập nhật giá, số lượng tồn kho & thông số kỹ thuật phụ tùng xe tải Trung Quốc.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => alert('Đã tải xuống danh sách mã phụ tùng dạng Excel!')}
            className="flex-1 sm:flex-none justify-center px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-900/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Phụ Tùng</span>
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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Part No, SKU, Tên công khai hoặc tên nội bộ..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800"
          />
        </div>

        {/* Brand Filter Dropdown */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-red-600" />
            <span>Hãng:</span>
          </div>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 flex-1 sm:flex-none"
          >
            <option value="ALL">Tất cả thương hiệu</option>
            <option value="HOWO Sinotruk">HOWO Sinotruk</option>
            <option value="Shacman">Shacman</option>
            <option value="FAW">FAW</option>
            <option value="Fast Gear">Fast Gear</option>
            <option value="Weichai Power">Weichai Power</option>
            <option value="Yuchai">Yuchai</option>
          </select>
        </div>
      </div>

      {/* Main Data Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Mobile Card View (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredProducts.map((product) => (
            <div key={product.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 relative overflow-hidden flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono font-bold text-red-600 text-xs truncate">
                      {product.sku}
                    </span>
                    {product.status === 'CÒN HÀNG' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Còn hàng
                      </span>
                    )}
                    {product.status === 'SẮP HẾT HÀNG' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex-shrink-0">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Sắp hết
                      </span>
                    )}
                    {product.status === 'HẾT HÀNG' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold flex-shrink-0">
                        <XCircle className="w-3 h-3 text-red-600" />
                        Hết hàng
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs mt-1 line-clamp-1">{product.name}</h3>
                  <p className="text-[11px] text-slate-400 truncate">{product.internalName}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Thương hiệu:</span>
                  <span className="font-semibold text-slate-700">{product.brand}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block">Tồn kho / Giá:</span>
                  <span className="font-extrabold text-slate-900">
                    {product.stock} cái • <span className="text-red-600">{product.price}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Link
                  href={`/products/${product.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem</span>
                </Link>

                <button
                  onClick={() => alert(`Chỉnh sửa phụ tùng: ${product.name}`)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Sửa</span>
                </button>

                <button
                  onClick={() => alert(`Xoá phụ tùng ${product.sku}?`)}
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-bold text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xoá</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3.5 pl-5">Hình Ảnh</th>
                <th className="p-3.5">Mã Part No / SKU</th>
                <th className="p-3.5">Tên Phụ Tùng</th>
                <th className="p-3.5">Danh Mục & Hãng</th>
                <th className="p-3.5">Tồn Kho</th>
                <th className="p-3.5">Đơn Giá</th>
                <th className="p-3.5">Trạng Thái</th>
                <th className="p-3.5 pr-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 pl-5">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 relative overflow-hidden flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>

                  <td className="p-3.5 font-mono font-bold text-red-600">
                    {product.sku}
                  </td>

                  <td className="p-3.5 max-w-xs">
                    <div className="font-bold text-slate-900 line-clamp-1">{product.name}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {product.internalName}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-medium text-slate-700">{product.brand}</div>
                    <div className="text-[11px] text-slate-400">{product.category}</div>
                  </td>

                  <td className="p-3.5">
                    <span className="font-extrabold text-slate-900">{product.stock} cái</span>
                  </td>

                  <td className="p-3.5 font-bold text-slate-800">
                    {product.price}
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
                      <Link
                        href={`/products/${product.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                        title="Xem trang công khai"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => alert(`Chỉnh sửa phụ tùng: ${product.name}`)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => alert(`Xoá phụ tùng ${product.sku}?`)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                        title="Xoá"
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

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span>Hiển thị {filteredProducts.length} / 10,480 mã phụ tùng</span>
          <div className="flex items-center justify-center gap-1 flex-wrap">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 cursor-pointer">
              Trang trước
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold">1</span>
            <span className="px-3 py-1.5 rounded-lg text-slate-600">2</span>
            <span className="px-3 py-1.5 rounded-lg text-slate-600">...</span>
            <span className="px-3 py-1.5 rounded-lg text-slate-600">524</span>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 cursor-pointer">
              Trang sau
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal Mock */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Thêm Phụ Tùng Mới Vào Kho</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã Part No / SKU (*)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: HW19710-TB02"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Phụ Tùng Công Khai (*)</label>
                <input
                  type="text"
                  placeholder="Nhập tên sản phẩm hiển thị trên website..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thương Hiệu</label>
                  <select className="w-full p-2.5 border border-slate-200 rounded-lg bg-white">
                    <option>HOWO Sinotruk</option>
                    <option>Shacman</option>
                    <option>FAW</option>
                    <option>Weichai</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số Lượng Tồn Kho</label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  alert('Đã lưu phụ tùng mới thành công!');
                  setShowAddModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold text-xs shadow-md"
              >
                Lưu Phụ Tùng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
