'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  FileText,
  Truck,
  Newspaper,
  CheckCircle2,
  Clock,
  MessageSquare,
  PhoneCall,
  Download,
  Plus,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';


// Mock Data for Dashboard KPI & Operations
const KPIS = [
  {
    title: 'Tổng Mã Phụ Tùng Kho',
    value: '10,480',
    subtext: '+12 mã nạp kho hôm nay',
    icon: Package,
    color: 'from-blue-600 to-indigo-600',
    lightBg: 'bg-blue-50 text-blue-700',
  },
  {
    title: 'Yêu Cầu Báo Giá Mới',
    value: '18',
    subtext: '5 yêu cầu chưa xử lý',
    icon: FileText,
    color: 'from-red-600 to-amber-600',
    lightBg: 'bg-red-50 text-red-700 animate-pulse',
  },
  {
    title: 'Hãng OEM & Dòng Xe',
    value: '15',
    subtext: 'WEICHAI, HOWO, FAW...',
    icon: Truck,
    color: 'from-emerald-600 to-teal-600',
    lightBg: 'bg-emerald-50 text-emerald-700',
  },
  {
    title: 'Bài Viết Kỹ Thuật',
    value: '24',
    subtext: 'Chuẩn SEO & Cẩm nang',
    icon: Newspaper,
    color: 'from-purple-600 to-pink-600',
    lightBg: 'bg-purple-50 text-purple-700',
  },
];

const RECENT_QUOTATIONS = [
  {
    id: 'YC-2026-089',
    customerName: 'Anh Trần Văn Hùng',
    phone: '0912.345.678',
    vehicleBrand: 'Xe Ben HOWO 371HP',
    partName: 'Bộ Đồng Tốc Hộp Số HW19710',
    sku: 'HW19710-DT',
    createdAt: '10 phút trước',
    status: 'MỚI GỬI',
    statusColor: 'bg-red-100 text-red-800 border-red-200',
  },
  {
    id: 'YC-2026-088',
    customerName: 'Gara Ô Tô Minh Phát (Đà Nẵng)',
    phone: '0905.888.999',
    vehicleBrand: 'Xe Đầu Kéo Shacman X3000',
    partName: 'Búp Sen Phanh 2 Tầng Cầu Sau',
    sku: 'SHAC-BS-02',
    createdAt: '35 phút trước',
    status: 'ĐÃ GỌI TƯ VẤN',
    statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'YC-2026-087',
    customerName: 'Công Ty Vận Tải Hoàng Hà',
    phone: '0983.123.456',
    vehicleBrand: 'Xe Ben FAW J6P 4 Chân',
    partName: 'Mặt Ga Lăng & Đèn Pha Nguyên Cụm',
    sku: 'FAW-GL-2024',
    createdAt: '2 giờ trước',
    status: 'ĐÃ GỬI BÁO GIÁ ZALO',
    statusColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 'YC-2026-086',
    customerName: 'Anh Nguyễn Quốc Bảo',
    phone: '0935.444.555',
    vehicleBrand: 'Động Cơ Weichai WD615',
    partName: 'Bộ Bạc Đạn & Piston Động Cơ',
    sku: 'WEICHAI-PST-01',
    createdAt: '4 giờ trước',
    status: 'HOÀN THÀNH',
    statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'YC-2026-085',
    customerName: 'Đội Xe Công Trình Núi Thành',
    phone: '0903.111.222',
    vehicleBrand: 'Xe Ben Dongfeng 4 Chân',
    partName: 'Nhíp Cầu Sau 12 Lá Chịu Lực',
    sku: 'DF-NCS-12',
    createdAt: 'Hôm qua',
    status: 'HOÀN THÀNH',
    statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
];

const STOCK_ALERTS = [
  {
    name: 'Tăm Bua Lơ Lửng Cầu Sau HOWO 371',
    sku: 'HW-TB-371',
    category: 'Gầm - Phanh',
    stock: 3,
    minThreshold: 10,
  },
  {
    name: 'Phớt Git Động Cơ Weichai WP10',
    sku: 'WC-PG-WP10',
    category: 'Động Cơ',
    stock: 5,
    minThreshold: 20,
  },
  {
    name: 'Bi Moay ơ Cầu Sau Shacman X3000',
    sku: 'SH-BM-X30',
    category: 'Vòng Bi - Bạc Đạn',
    stock: 2,
    minThreshold: 8,
  },
];

const BRAND_DISTRIBUTION = [
  { name: 'HOWO Sinotruk', percentage: 42, color: 'bg-red-600', count: '4,400 mã' },
  { name: 'Shacman', percentage: 28, color: 'bg-amber-500', count: '2,930 mã' },
  { name: 'FAW & Dongfeng', percentage: 18, color: 'bg-blue-600', count: '1,880 mã' },
  { name: 'Weichai & Yuchai', percentage: 12, color: 'bg-emerald-600', count: '1,270 mã' },
];

export default function AdminDashboardPage() {
  const [filterStatus, setFilterStatus] = useState('ALL');

  return (
    <div className="space-y-8 pb-10">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 rounded-2xl p-6 md:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>Phiên Làm Việc Quản Trị Hệ Thống Q.BA</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Bảng Điều Khiển Quản Trị <span className="text-red-500">Q.BA Auto Parts</span>
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Quản lý danh mục 10,000+ mã phụ tùng xe tải nặng Trung Quốc, tiếp nhận yêu cầu báo giá Zalo hỏa tốc và theo dõi kho hàng Đà Nẵng 24/7.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/admin/products"
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-900/50 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Quản Lý Phụ Tùng</span>
            </Link>
            <button
              onClick={() => alert('Xuất báo cáo tổng quan kho hàng thành công!')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Xuất Báo Cáo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid KPI 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {KPIS.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{kpi.title}</span>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${kpi.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {kpi.value}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${kpi.lightBg}`}>
                    {kpi.subtext}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Split: Quotation Requests (Left) + Stock Alerts & Analytics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Recent Quotations Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Table Header Controls */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 text-base">
                    Yêu Cầu Báo Giá Mới Nhất
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
                    18 Yêu Cầu
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Khách hàng gửi yêu cầu từ Form Website hoặc Zalo OA
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-3 pr-8 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="MỚI GỬI">Mới gửi</option>
                    <option value="ĐÃ GỌI TƯ VẤN">Đã gọi tư vấn</option>
                    <option value="ĐÃ GỬI BÁO GIÁ ZALO">Đã báo giá Zalo</option>
                    <option value="HOÀN THÀNH">Hoàn thành</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/60">
                    <th className="p-3.5 pl-5">Mã Yêu Cầu</th>
                    <th className="p-3.5">Khách Hàng & SĐT</th>
                    <th className="p-3.5">Dòng Xe & Phụ Tùng</th>
                    <th className="p-3.5">Thời Gian</th>
                    <th className="p-3.5">Trạng Thái</th>
                    <th className="p-3.5 pr-5 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RECENT_QUOTATIONS.filter(
                    (q) => filterStatus === 'ALL' || q.status === filterStatus
                  ).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5 font-bold text-slate-800">
                        {item.id}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{item.customerName}</div>
                        <a
                          href={`tel:${item.phone.replace(/\./g, '')}`}
                          className="text-red-600 hover:underline font-semibold flex items-center gap-1 mt-0.5"
                        >
                          <PhoneCall className="w-3 h-3" />
                          {item.phone}
                        </a>
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-slate-700">{item.partName}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {item.vehicleBrand} • SKU: {item.sku}
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.createdAt}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${item.statusColor}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://zalo.me/${item.phone.replace(/\./g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                            title="Chat Zalo báo giá ngay"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => alert(`Xem chi tiết yêu cầu ${item.id}`)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
                          >
                            Xử lý
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span>Hiển thị 5 / 18 yêu cầu báo giá mới nhất</span>
              <Link
                href="/admin/orders"
                className="font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <span>Xem tất cả yêu cầu báo giá</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Stock Alerts & Brand Breakdown */}
        <div className="space-y-6">
          {/* Stock Alert Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Cảnh Báo Tồn Kho</h3>
                  <p className="text-[11px] text-slate-400">Phụ tùng cán mức tối thiểu</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                3 Mã Cần Nhập
              </span>
            </div>

            <div className="space-y-3">
              {STOCK_ALERTS.map((alertItem, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-snug">
                      {alertItem.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {alertItem.sku} • {alertItem.category}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-red-600 block">
                      Còn {alertItem.stock} cái
                    </span>
                    <span className="text-[10px] text-slate-400">
                      (Định mức: {alertItem.minThreshold})
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert('Đã tạo đơn yêu cầu nhập hàng kho Đà Nẵng!')}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              + Tạo Đơn Nhập Hàng Kho Q.BA
            </button>
          </div>

          {/* Vehicle & Brand Distribution Chart Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Phân Bổ Mã Phụ Tùng Theo Hãng</h3>
              <span className="text-[11px] text-slate-400 font-medium">10,480 Mã SP</span>
            </div>

            <div className="space-y-3.5">
              {BRAND_DISTRIBUTION.map((brand, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{brand.name}</span>
                    <span className="text-slate-500 font-mono">{brand.count} ({brand.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${brand.color} rounded-full transition-all duration-500`}
                      style={{ width: `${brand.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Cam kết 80% OEM:</span> Toàn bộ phụ tùng kho Q.BA đều đạt chuẩn chất lượng nhà máy sản xuất loại 1.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
