'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Layers,
  Truck,
  Plus,
  Edit,
  Trash2,
  Search,
  ShieldCheck,
} from 'lucide-react';


const CATEGORIES_MOCK = [
  {
    id: 1,
    name: 'Động Cơ & Phụ Tùng Động Cơ',
    slug: 'dong-co',
    productCount: 2450,
    brands: ['Weichai', 'Yuchai', 'Cummins', 'Sinotruk'],
    icon: '⚙️',
    description: 'Bộ piston, xéc măng, phớt git, bơm cao áp, củ đề, máy phát điện diesel.',
  },
  {
    id: 2,
    name: 'Hộp Số & Bộ Đồng Tốc',
    slug: 'hop-so',
    productCount: 1820,
    brands: ['Fast Gear', 'HW19710', 'HW18710'],
    icon: '🕹️',
    description: 'Hộp số tổng thành 10 số, 12 số, bộ đồng tốc, bánh răng, trục thứ cấp.',
  },
  {
    id: 3,
    name: 'Gầm - Cầu - Hệ Thống Phanh',
    slug: 'gam-cau-phanh',
    productCount: 3100,
    brands: ['HOWO', 'Shacman', 'FAW', 'Dongfeng'],
    icon: '🛑',
    description: 'Tăm bua lơ lửng, búp sen phanh, rơ tuyn, may ơ, bộ vi sai, nhíp cầu.',
  },
  {
    id: 4,
    name: 'Cabin & Thân Vỏ Cánh Cửa',
    slug: 'cabin-than-vo',
    productCount: 1240,
    brands: ['Sinotruk A7', 'V7G', 'Shacman X3000', 'FAW J6P'],
    icon: '🚛',
    description: 'Ghế hơi cabin, mặt ga lăng, cụm đèn pha, gương chiếu hậu, kính chắn gió.',
  },
  {
    id: 5,
    name: 'Ben Thủy Lực & Bơm Ben',
    slug: 'ben-thuy-luc',
    productCount: 680,
    brands: ['Hyva', 'FC', 'Sinotruk'],
    icon: '🏗️',
    description: 'Ty ben thủy lực 4 đốt, 5 đốt, van chia chia ben, bơm ben bánh răng.',
  },
  {
    id: 6,
    name: 'Seal Phốt & Vòng Bi Bạc Đạn',
    slug: 'seal-phot-vong-bi',
    productCount: 1190,
    brands: ['BOSCH', 'SKF', 'NOK', 'Q.BA OEM'],
    icon: '⭕',
    description: 'Phớt git, phớt đuôi trục khuỷu, bi moay ơ, bi chữ thập, bạc đạn phanh.',
  },
];

const BRANDS_MOCK = [
  { id: 1, name: 'HOWO Sinotruk', origin: 'Trung Quốc', status: 'Hợp Tác Chính Thức', logo: '/images/logo/logo-quy-ba.jpg' },
  { id: 2, name: 'Shacman', origin: 'Trung Quốc', status: 'Hợp Tác Chính Thức', logo: '/images/logo/logo-quy-ba.jpg' },
  { id: 3, name: 'FAW Group', origin: 'Trung Quốc', status: 'Đại Lý Phân Phối', logo: '/images/logo/logo-quy-ba.jpg' },
  { id: 4, name: 'Weichai Power', origin: 'Trung Quốc', status: 'Đối Tác Chiến Lược', logo: '/images/logo/logo-quy-ba.jpg' },
  { id: 5, name: 'Fast Gear', origin: 'Trung Quốc', status: 'Đại Lý Phân Phối', logo: '/images/logo/logo-quy-ba.jpg' },
  { id: 6, name: 'Dongfeng Commercial', origin: 'Trung Quốc', status: 'Hợp Tác Chính Thức', logo: '/images/logo/logo-quy-ba.jpg' },
];

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'BRANDS'>('CATEGORIES');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Quản Lý Danh Mục & Dòng Xe
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
              8 Danh Mục • 15 Thương Hiệu
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Phân loại phụ tùng xe tải nặng Trung Quốc theo chủng loại động cơ, gầm, hộp số & thương hiệu OEM.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm {activeTab === 'CATEGORIES' ? 'Danh Mục Mới' : 'Thương Hiệu Mới'}</span>
        </button>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 p-1 rounded-xl overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CATEGORIES'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-red-600" />
            <span>Danh Mục ({CATEGORIES_MOCK.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('BRANDS')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'BRANDS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-4 h-4 text-red-600" />
            <span>Thương Hiệu ({BRANDS_MOCK.length})</span>
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên danh mục hoặc thương hiệu..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>
      </div>

      {/* Tab 1: Categories View */}
      {activeTab === 'CATEGORIES' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {CATEGORIES_MOCK.filter((c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl p-2 rounded-xl bg-slate-100 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-extrabold border border-red-100">
                    {cat.productCount} mã phụ tùng
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-3 sm:mt-4 group-hover:text-red-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>

                <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5">
                  {cat.brands.map((b, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">/{cat.slug}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => alert(`Chỉnh sửa danh mục: ${cat.name}`)}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold"
                    title="Sửa"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => alert(`Xoá danh mục: ${cat.name}`)}
                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-bold"
                    title="Xoá"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Brands View */}
      {activeTab === 'BRANDS' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Mobile Card List View (< md) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {BRANDS_MOCK.filter((b) =>
              b.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((brand) => (
              <div key={brand.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-1 relative flex-shrink-0">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{brand.name}</h3>
                    <p className="text-[11px] text-slate-400">Xuất xứ: {brand.origin}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    {brand.status}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Sửa thương hiệu: ${brand.name}`)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => alert(`Xoá thương hiệu: ${brand.name}`)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-bold text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xoá</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 pl-5">Logo & Tên Hãng</th>
                  <th className="p-3.5">Xuất Xứ</th>
                  <th className="p-3.5">Trạng Thái Hợp Tác</th>
                  <th className="p-3.5 pr-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {BRANDS_MOCK.filter((b) =>
                  b.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 p-1 relative flex-shrink-0">
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{brand.name}</span>
                      </div>
                    </td>

                    <td className="p-3.5 font-medium text-slate-700">{brand.origin}</td>

                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {brand.status}
                      </span>
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => alert(`Sửa thương hiệu: ${brand.name}`)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => alert(`Xoá thương hiệu: ${brand.name}`)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
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

      {/* Add Modal Mock */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Thêm {activeTab === 'CATEGORIES' ? 'Danh Mục' : 'Thương Hiệu'} Mới
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên {activeTab === 'CATEGORIES' ? 'Danh Mục' : 'Thương Hiệu'} (*)
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
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
                  alert('Đã thêm mới thành công!');
                  setShowAddModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold text-xs shadow-md"
              >
                Lưu Tạo Mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
