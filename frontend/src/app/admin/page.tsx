'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  FileText,
  Truck,
  Users,
  CheckCircle2,
  Clock,
  MessageSquare,
  PhoneCall,
  Download,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  TrendingUp,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { AdminApiService } from '@/services/adminApiService';

interface AnalyticsData {
  summaryStats: {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    conversionRatePercent: number;
    totalProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    totalCustomers: number;
  };
  topRequestedParts: {
    rank: number;
    productId: number;
    productName: string;
    partNumber: string;
    totalRequests: number;
    totalQuantity: number;
  }[];
  weeklyTrend: {
    dayLabel: string;
    count: number;
  }[];
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await AdminApiService.getDashboardAnalytics();
      if (res.ok && res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const timer = setInterval(() => {
      fetchAnalytics();
    }, 15000); // Auto-refresh analytics every 15s
    return () => clearInterval(timer);
  }, []);

  const stats = analytics?.summaryStats;
  const topParts = analytics?.topRequestedParts || [];
  const trend = analytics?.weeklyTrend || [];
  const maxTrendCount = Math.max(...trend.map((t) => t.count), 1);

  return (
    <div className="space-y-8 pb-10">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 rounded-2xl p-5 sm:p-6 md:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>Hệ Thống Phân Tích Dữ Liệu Real-Time Q.BA</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              Bảng Điều Khiển Quản Trị <span className="text-red-500">Q.BA Auto Parts</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Theo dõi biến động yêu cầu báo giá phụ tùng xe tải nặng, đo lường tỷ lệ chuyển đổi đơn hàng và cảnh báo tồn kho Đà Nẵng thời gian thực.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Làm mới dữ liệu real-time"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Đang làm mới...' : 'Làm Mới'}</span>
            </button>

            <Link
              href="/admin/products"
              className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-900/50 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Quản Lý Phụ Tùng</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Đơn Báo Giá ({stats?.pendingOrders || 0})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid KPI 4 Metric Cards */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600 mb-2" />
          <p className="text-xs font-bold text-slate-500">Đang tính toán chỉ số thống kê Real-Time từ CSDL...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* KPI 1 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Tổng Đơn Báo Giá</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.totalOrders || 0}
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold border bg-red-50 text-red-700 border-red-200">
                  {stats?.pendingOrders || 0} đơn chờ báo giá
                </span>
              </div>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Tỷ Lệ Chuyển Đổi</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
                {stats?.conversionRatePercent || 0}%
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                  {(stats?.confirmedOrders || 0) + (stats?.completedOrders || 0)} đơn đã phản hồi
                </span>
              </div>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Tổng Mã Phụ Tùng Kho</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.totalProducts || 0}
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold border bg-blue-50 text-blue-700 border-blue-200">
                  Kho Q.BA Đà Nẵng
                </span>
              </div>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Khách Hàng & Gara</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.totalCustomers || 0}
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold border bg-purple-50 text-purple-700 border-purple-200">
                  Đối tác đặt phụ tùng
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: 7-Day Trend Bar Chart (Left 2 cols) + Conversion Funnel (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {/* Left: 7-Day Trend Chart */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-600" />
                <div>
                  <h2 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Biểu Đồ Tăng Trưởng Đơn Báo Giá 7 Ngày Qua
                  </h2>
                  <p className="text-xs text-slate-400">Thống kê khối lượng yêu cầu gửi từ website theo ngày</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                7 Ngày Gần Nhất
              </span>
            </div>

            {/* Bar Chart Visual */}
            <div className="pt-4 pb-2">
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200/80">
                {trend.map((t, idx) => {
                  const heightPercent = maxTrendCount > 0 ? (t.count / maxTrendCount) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap z-20">
                        {t.count} Yêu cầu ({t.dayLabel})
                      </div>

                      {/* Count value top label */}
                      <span className="text-[11px] font-bold text-slate-600 group-hover:text-red-600">
                        {t.count}
                      </span>

                      {/* Bar Fill */}
                      <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-full">
                        <div
                          className="w-full bg-gradient-to-t from-red-600 to-amber-500 rounded-t-lg group-hover:from-red-500 group-hover:to-amber-400 transition-all duration-500 shadow-sm"
                          style={{ height: `${Math.max(heightPercent, t.count > 0 ? 12 : 4)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Day Labels X-Axis */}
              <div className="flex justify-between gap-2 sm:gap-4 px-2 mt-2">
                {trend.map((t, idx) => (
                  <span key={idx} className="flex-1 text-center text-[11px] font-extrabold text-slate-500">
                    {t.dayLabel}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span>Hệ thống tự động đồng bộ thống kê mỗi 15 giây.</span>
              <Link href="/admin/orders" className="font-bold text-red-600 hover:underline flex items-center gap-1">
                <span>Xem chi tiết danh sách đơn</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Conversion Funnel */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Phễu Chuyển Đổi Báo Giá</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {stats?.conversionRatePercent || 0}% Thành Công
                </span>
              </div>

              <div className="space-y-4 mt-4">
                {/* Pending */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-red-700 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      1. Mới Gửi (Chờ Xử Lý)
                    </span>
                    <span className="text-slate-600 font-mono font-bold">{stats?.pendingOrders || 0} đơn</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{
                        width: `${stats?.totalOrders ? Math.round(((stats.pendingOrders || 0) / stats.totalOrders) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Confirmed */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-blue-700 font-bold">2. Đã Xác Nhận & Tư Vấn</span>
                    <span className="text-slate-600 font-mono font-bold">{stats?.confirmedOrders || 0} đơn</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{
                        width: `${stats?.totalOrders ? Math.round(((stats.confirmedOrders || 0) / stats.totalOrders) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Completed */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-emerald-700 font-bold">3. Hoàn Thành Giao Phụ Tùng</span>
                    <span className="text-slate-600 font-mono font-bold">{stats?.completedOrders || 0} đơn</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{
                        width: `${stats?.totalOrders ? Math.round(((stats.completedOrders || 0) / stats.totalOrders) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Cancelled */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 font-bold">4. Đã Hủy / Không Khả Thi</span>
                    <span className="text-slate-600 font-mono font-bold">{stats?.cancelledOrders || 0} đơn</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full"
                      style={{
                        width: `${stats?.totalOrders ? Math.round(((stats.cancelledOrders || 0) / stats.totalOrders) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-start gap-2.5 text-xs text-emerald-800 mt-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Mẹo tăng tỷ lệ chốt đơn:</span> Phản hồi Zalo khách hàng trong vòng 5 phút giúp tăng 40% khả năng chốt phụ tùng.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Top 5 Most Requested Auto Parts (Left 2 cols) + Stock Alerts (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {/* Left: Top 5 Most Requested Auto Parts */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Top 5 Phụ Tùng Xe Tải Được Yêu Cầu Báo Giá Nhiều Nhất
                  </h3>
                  <p className="text-xs text-slate-400">Dựa trên dữ liệu tổng hợp thực tế từ các đơn báo giá</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-extrabold text-[11px] border border-red-200 self-start sm:self-auto">
                  Dữ Liệu Real-Time
                </span>
              </div>

              {topParts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-xl mt-4">
                  Chưa có dữ liệu thống kê phụ tùng được yêu cầu
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {topParts.map((item) => (
                    <div
                      key={`top-part-${item.rank}`}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                          #{item.rank}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs truncate">{item.productName}</h4>
                          <p className="text-[10px] text-slate-400 font-mono truncate">Mã: {item.partNumber}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-extrabold text-red-600 text-xs block">
                          {item.totalRequests} lượt hỏi
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Tong: {item.totalQuantity} cái
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Stock Health & Low Stock Alert Widget */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Cảnh Báo Tồn Kho Đà Nẵng</h3>
                    <p className="text-[11px] text-slate-400">Trạng thái kho hàng hiện tại</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-red-900">Sản Phẩm Hết Hàng (Stock = 0)</p>
                    <p className="text-[10px] text-red-600">Cần nhập bổ sung kho ngay</p>
                  </div>
                  <span className="text-lg font-extrabold text-red-700">
                    {stats?.outOfStockProducts || 0} mã
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-900">Sản Phẩm Sắp Hết (Stock ≤ 5)</p>
                    <p className="text-[10px] text-amber-600">Ngưỡng cảnh báo kho</p>
                  </div>
                  <span className="text-lg font-extrabold text-amber-700">
                    {stats?.lowStockProducts || 0} mã
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/admin/products"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs text-center block mt-4"
            >
              📦 Quản Lý Kho & Nhập Hàng Phụ Tùng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
