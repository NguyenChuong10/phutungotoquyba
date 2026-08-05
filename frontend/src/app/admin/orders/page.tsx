'use client';

import { useState } from 'react';
import {
  Search,
  PhoneCall,
  MessageSquare,
  Download,
  Send,
} from 'lucide-react';


const ORDERS_MOCK = [
  {
    id: 'YC-2026-089',
    customerName: 'Anh Trần Văn Hùng',
    phone: '0912.345.678',
    email: 'hung.tran@gmail.com',
    vehicleBrand: 'Xe Ben HOWO 371HP (Cầu Dầu)',
    parts: [
      { name: 'Bộ Đồng Tốc Hộp Số HW19710', sku: 'HW19710-DT', qty: 2, price: 'Báo Giá Zalo' },
      { name: 'Tăm Bua Lơ Lửng 10 Lỗ', sku: 'HW-TB-371', qty: 4, price: 'Báo Giá Zalo' },
    ],
    note: 'Cần gửi hàng hỏa tốc về Bến xe Trung tâm Đà Nẵng trong ngày.',
    createdAt: '26/07/2026 22:45',
    status: 'MỚI GỬI',
    statusColor: 'bg-red-100 text-red-800 border-red-200',
  },
  {
    id: 'YC-2026-088',
    customerName: 'Gara Ô Tô Minh Phát',
    phone: '0905.888.999',
    email: 'garaminhphat.dn@gmail.com',
    vehicleBrand: 'Xe Đầu Kéo Shacman X3000',
    parts: [
      { name: 'Búp Sen Phanh 2 Tầng Cầu Sau', sku: 'SHAC-BS-02', qty: 6, price: '1,450,000 ₫' },
    ],
    note: 'Gara cần gấp phuộc hơi cabin X3000 nếu có sẵn trong kho.',
    createdAt: '26/07/2026 21:15',
    status: 'ĐÃ GỌI TƯ VẤN',
    statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'YC-2026-087',
    customerName: 'Công Ty Vận Tải Hoàng Hà',
    phone: '0983.123.456',
    email: 'contact@hoanghatransport.vn',
    vehicleBrand: 'Xe Ben FAW J6P 4 Chân',
    parts: [
      { name: 'Mặt Ga Lăng & Đèn Pha Nguyên Cụm', sku: 'FAW-GL-2024', qty: 1, price: '5,200,000 ₫' },
      { name: 'Nhíp Cầu Sau 12 Lá Chịu Lực', sku: 'FAW-NCS-12L', qty: 2, price: '3,100,000 ₫' },
    ],
    note: 'Xuất hóa đơn GTGT cho công ty.',
    createdAt: '26/07/2026 19:30',
    status: 'ĐÃ GỬI BÁO GIÁ ZALO',
    statusColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 'YC-2026-086',
    customerName: 'Anh Nguyễn Quốc Bảo',
    phone: '0935.444.555',
    email: 'baonguyen@gmail.com',
    vehicleBrand: 'Động Cơ Weichai WD615',
    parts: [
      { name: 'Bộ Piston & Xéc Măng Động Cơ', sku: 'WEICHAI-PST-01', qty: 6, price: '4,200,000 ₫' },
    ],
    note: 'Đã thanh toán chuyển khoản và nhận hàng tại kho 43 Nguyễn Văn Tạo.',
    createdAt: '26/07/2026 16:10',
    status: 'HOÀN THÀNH',
    statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
];

export default function AdminOrdersPage() {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<typeof ORDERS_MOCK[0] | null>(null);

  const filteredOrders = ORDERS_MOCK.filter((ord) => {
    const matchesSearch =
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.phone.includes(searchQuery);
    const matchesStatus = filterStatus === 'ALL' || ord.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Quản Lý Yêu Cầu Báo Giá & Đơn Hàng
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
              18 Yêu Cầu Mới
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Xử lý hotline tư vấn, gửi báo giá Zalo 1-Click & cập nhật trạng thái giao hàng kho Q.BA.
          </p>
        </div>

        <button
          onClick={() => alert('Đã xuất danh sách yêu cầu báo giá ra file Excel!')}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Xuất File Excel</span>
        </button>
      </div>

      {/* Toolbar Search & Status Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Mã YC, Tên khách hàng hoặc Số điện thoại..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 max-w-full">
          {['ALL', 'MỚI GỬI', 'ĐÃ GỌI TƯ VẤN', 'ĐÃ GỬI BÁO GIÁ ZALO', 'HOÀN THÀNH'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                filterStatus === st
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Tất Cả (18)' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Data Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Mobile Card List View (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredOrders.map((ord) => (
            <div key={ord.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono text-slate-800 text-xs">{ord.id}</span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${ord.statusColor}`}
                >
                  {ord.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{ord.customerName}</h3>
                <a
                  href={`tel:${ord.phone.replace(/\./g, '')}`}
                  className="text-red-600 hover:underline text-xs font-semibold inline-flex items-center gap-1 mt-0.5"
                >
                  <PhoneCall className="w-3 h-3" />
                  {ord.phone}
                </a>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
                <p className="font-semibold text-slate-800">{ord.vehicleBrand}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {ord.parts.map((p) => `${p.name} (x${p.qty})`).join(', ')}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400 text-[11px]">{ord.createdAt}</span>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://zalo.me/${ord.phone.replace(/\./g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Zalo</span>
                  </a>
                  <button
                    onClick={() => setSelectedOrder(ord)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                  >
                    Chi Tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Data Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3.5 pl-5">Mã Yêu Cầu</th>
                <th className="p-3.5">Khách Hàng & SĐT</th>
                <th className="p-3.5">Dòng Xe & Phụ Tùng Yêu Cầu</th>
                <th className="p-3.5">Thời Gian</th>
                <th className="p-3.5">Trạng Thái</th>
                <th className="p-3.5 pr-5 text-right">Tương Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 pl-5 font-bold font-mono text-slate-800">{ord.id}</td>

                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{ord.customerName}</div>
                    <a
                      href={`tel:${ord.phone.replace(/\./g, '')}`}
                      className="text-red-600 hover:underline font-semibold flex items-center gap-1 mt-0.5"
                    >
                      <PhoneCall className="w-3 h-3" />
                      {ord.phone}
                    </a>
                  </td>

                  <td className="p-3.5 max-w-xs">
                    <div className="font-medium text-slate-800">{ord.vehicleBrand}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {ord.parts.map((p) => `${p.name} (x${p.qty})`).join(', ')}
                    </div>
                  </td>

                  <td className="p-3.5 text-slate-500 font-medium">{ord.createdAt}</td>

                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${ord.statusColor}`}
                    >
                      {ord.status}
                    </span>
                  </td>

                  <td className="p-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`https://zalo.me/${ord.phone.replace(/\./g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                        title="Gửi báo giá Zalo"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
                      >
                        Chi Tiết
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Chi Tiết Yêu Cầu Báo Giá #{selectedOrder.id}
                </h3>
                <p className="text-xs text-slate-400">Khách gửi lúc: {selectedOrder.createdAt}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-semibold block">Họ và tên:</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Số điện thoại:</span>
                  <a href={`tel:${selectedOrder.phone}`} className="font-bold text-red-600 text-sm">
                    {selectedOrder.phone}
                  </a>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 font-semibold block">Dòng xe thương mại:</span>
                  <span className="font-bold text-slate-800">{selectedOrder.vehicleBrand}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Danh Sách Phụ Tùng Yêu Cầu:</h4>
                <div className="space-y-2">
                  {selectedOrder.parts.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-extrabold text-slate-900 block">Số lượng: x{p.qty}</span>
                        <span className="text-[10px] font-bold text-red-600">{p.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.note && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-900">
                  <span className="font-bold block mb-1">Ghi chú của khách hàng:</span>
                  <p>{selectedOrder.note}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <a
                href={`https://zalo.me/${selectedOrder.phone.replace(/\./g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Mở Chat Zalo Báo Giá</span>
              </a>

              <button
                onClick={() => {
                  alert(`Đã cập nhật trạng thái đơn ${selectedOrder.id}`);
                  setSelectedOrder(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md"
              >
                Đổi Trạng Thái
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
