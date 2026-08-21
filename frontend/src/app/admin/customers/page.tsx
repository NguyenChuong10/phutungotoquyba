'use client';

import { useState, useEffect, useMemo } from 'react';
import ToastNotification, { ToastMessage } from '@/components/ui/ToastNotification';
import {
  Search,
  PhoneCall,
  MessageSquare,
  Download,
  Loader2,
  FileText,
  Edit3,
  X,
  Save,
  Clock,
  Eye,
  CheckCircle2,
  Crown,
  RotateCw,
  Phone,
  UserCheck,
} from 'lucide-react';
import { AdminApiService } from '@/services/adminApiService';

interface CustomerItem {
  id?: number;
  fullName: string;
  phone: string;
  email: string | null;
  companyName: string | null;
  address: string | null;
  notes: string | null;
  totalOrders: number;
  lastOrderAt: string;
  vipBadgeText: string;
  vipBadgeColor: string;
  recentOrders: {
    id: number;
    orderCode: string;
    customerName: string;
    customerPhone: string;
    status: string;
    createdAt: string;
    notes: string | null;
    items: {
      id: number;
      productName: string;
      partNumber: string;
      quantity: number;
    }[];
  }[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVipFilter, setSelectedVipFilter] = useState('ALL');
  const [toastState, setToastState] = useState<ToastMessage | null>(null);

  // Modal States
  const [editingNotesCustomer, setEditingNotesCustomer] = useState<CustomerItem | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const [historyCustomer, setHistoryCustomer] = useState<CustomerItem | null>(null);

  const fetchCustomers = async (query = '') => {
    setLoading(true);
    try {
      const res = await AdminApiService.getAdminCustomers(query);
      if (res.ok && res.data) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(searchQuery);
  }, [searchQuery]);

  // Save Gara Notes
  const handleSaveNotes = async () => {
    if (!editingNotesCustomer) return;
    setSavingNotes(true);
    try {
      const res = await AdminApiService.updateCustomerNotes(
        editingNotesCustomer.phone,
        notesInput
      );
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Cập Nhật Ghi Chú Thành Công',
          message: `Đã lưu ghi chú tư vấn cho SĐT [${editingNotesCustomer.phone}]!`,
        });
        setEditingNotesCustomer(null);
        fetchCustomers(searchQuery);
      } else {
        alert(res.message || 'Lỗi khi lưu ghi chú');
      }
    } catch (err) {
      console.error('Failed to save customer notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (selectedVipFilter === 'ALL') return true;
      return c.vipBadgeText.includes(selectedVipFilter);
    });
  }, [customers, selectedVipFilter]);

  // Export CSV
  const handleExportCSV = () => {
    if (customers.length === 0) {
      alert('Chưa có dữ liệu khách hàng để xuất!');
      return;
    }
    const headers = ['Mã KH', 'Họ Tên', 'SĐT', 'Đơn Vị/Gara', 'Hạng VIP', 'Tổng Đơn', 'Ghi Chú'];
    const rows = customers.map((c) => [
      c.id || 'N/A',
      `"${c.fullName}"`,
      `"${c.phone}"`,
      `"${c.companyName || ''}"`,
      `"${c.vipBadgeText}"`,
      c.totalOrders,
      `"${c.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `QBA_Danh_Sach_Khach_Hang_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastState({
      id: String(Date.now()),
      type: 'success',
      title: 'Xuất File Thành Công',
      message: 'Đã xuất dữ liệu danh bạ khách hàng ra tệp CSV Excel!',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Quản Lý Khách Hàng & Gara VIP
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
              {customers.length} Đối Tác Đã Phát Sinh Đơn
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp danh bạ SĐT Gara sửa chữa, Đội xe công trình & Phân cấp thẻ VIP tự động.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Xuất File CSV Excel</span>
        </button>
      </div>

      {/* Toolbar Search & VIP Tier Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Tên Khách, SĐT, Tên Gara hoặc Ghi chú..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { key: 'ALL', label: 'Tất Cả Khách Hàng' },
            { key: 'VIP', label: 'Khách VIP (≥5 đơn)' },
            { key: 'Quen', label: 'Khách Quen (2-4 đơn)' },
            { key: 'Mới', label: 'Khách Mới (1 đơn)' },
          ].map((st) => (
            <button
              key={`vip-tab-${st.key}`}
              onClick={() => setSelectedVipFilter(st.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${selectedVipFilter === st.key
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table Wrapper with Custom Scrollbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
            <p className="text-xs font-bold">Đang tổng hợp dữ liệu danh bạ khách hàng từ CSDL...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center space-y-2 bg-slate-50">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">Chưa có thông tin khách hàng phù hợp</h4>
            <p className="text-xs text-slate-400">Không tìm thấy SĐT hay Gara nào theo điều kiện lọc.</p>
          </div>
        ) : (
          <div className="max-h-[580px] overflow-y-auto overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs shadow-2xs">
                <tr className="text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 pl-5">Tên Khách Hàng & SĐT</th>
                  <th className="p-3.5">Hạng Thẻ VIP</th>
                  <th className="p-3.5">Đơn Vị / Gara Sửa Chữa</th>
                  <th className="p-3.5">Tổng Lượt Báo Giá</th>
                  <th className="p-3.5">Ghi Chú Tư Vấn Gara</th>
                  <th className="p-3.5 pr-5 text-right">Tương Tác Nhanh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <tr key={`cust-row-${customer.phone}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="font-extrabold text-slate-900 text-sm">{customer.fullName}</div>
                      <a
                        href={`tel:${customer.phone}`}
                        className="text-red-600 hover:underline font-extrabold flex items-center gap-1 mt-0.5 text-xs"
                      >
                        <PhoneCall className="w-3 h-3" />
                        {customer.phone}
                      </a>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] border ${customer.vipBadgeColor}`}
                      >
                        {customer.totalOrders >= 5 ? (
                          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                        ) : customer.totalOrders >= 2 ? (
                          <RotateCw className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                        <span>{customer.vipBadgeText.replace(/^[^\w\s\u00C0-\u024F\u1E00-\u1EFF]+/g, '').trim()}</span>
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">
                        {customer.companyName || 'Khách Hàng Lẻ / Gara Tự Do'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Lần hỏi gần nhất: {new Date(customer.lastOrderAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <button
                        onClick={() => setHistoryCustomer(customer)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Xem toàn bộ lịch sử đơn báo giá"
                      >
                        <Eye className="w-3.5 h-3.5 text-red-600" />
                        <span>{customer.totalOrders} Đơn Báo Giá</span>
                      </button>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      {customer.notes ? (
                        <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-900 font-medium text-xs line-clamp-2">
                          {customer.notes}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Chưa có ghi chú riêng</span>
                      )}
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingNotesCustomer(customer);
                            setNotesInput(customer.notes || '');
                          }}
                          className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white font-extrabold transition-all text-[11px] flex items-center gap-1 cursor-pointer"
                          title="Sửa ghi chú tư vấn Gara"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Ghi Chú</span>
                        </button>

                        <a
                          href={`https://zalo.me/${customer.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                          title="Chat Zalo ngay"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        <a
                          href={`tel:${customer.phone}`}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                          title="Gọi tư vấn trực tiếp"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Hiển thị <strong className="text-slate-900">{filteredCustomers.length}</strong> / {customers.length} khách hàng trong danh bạ Q.BA
          </span>
          <span className="font-semibold text-slate-600 flex items-center gap-2">
            <span className="flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-amber-500" /> {customers.filter((c) => c.totalOrders >= 5).length} Khách VIP</span>
            <span>•</span>
            <span className="flex items-center gap-1"><RotateCw className="w-3.5 h-3.5 text-blue-500" /> {customers.filter((c) => c.totalOrders >= 2 && c.totalOrders < 5).length} Khách Quen</span>
          </span>
        </div>
      </div>

      {/* EDIT GARA NOTES MODAL */}
      {editingNotesCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Ghi Chú Tư Vấn Gara / Khách Hàng
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {editingNotesCustomer.fullName} ({editingNotesCustomer.phone})
                </p>
              </div>
              <button
                onClick={() => setEditingNotesCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Nội dung ghi chú đặc điểm (Loại xe chuyên dùng, thói quen đặt hàng...):
              </label>
              <textarea
                rows={4}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Ví dụ: Gara anh Đức - Chuyên bảo dưỡng động cơ Weichai WP12, thường xuyên lấy bộ piston & phớt git..."
                className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingNotesCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={savingNotes}
                onClick={handleSaveNotes}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {savingNotes ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{savingNotes ? 'Đang lưu...' : 'Lưu Ghi Chú'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER ORDER HISTORY MODAL */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Lịch Sử Báo Giá: {historyCustomer.fullName}
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${historyCustomer.vipBadgeColor}`}>
                    {historyCustomer.totalOrders >= 5 ? (
                      <Crown className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
                    ) : historyCustomer.totalOrders >= 2 ? (
                      <RotateCw className="w-3 h-3 text-amber-700 shrink-0" />
                    ) : (
                      <UserCheck className="w-3 h-3 text-blue-600 shrink-0" />
                    )}
                    <span>{historyCustomer.vipBadgeText.replace(/^[^\w\s\u00C0-\u024F\u1E00-\u1EFF]+/g, '').trim()}</span>
                  </span>
                </div>
                <p className="text-xs text-red-600 font-extrabold font-mono mt-0.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-red-600" />
                  <span>SĐT: {historyCustomer.phone}</span>
                </p>
              </div>
              <button
                onClick={() => setHistoryCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Orders list scroll */}
            <div className="overflow-y-auto max-h-[55vh] space-y-3 pr-1 custom-scrollbar flex-1">
              {historyCustomer.recentOrders.map((ord, idx) => (
                <div key={`hist-ord-${ord.id}`} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold font-mono text-red-600 text-xs">
                      #{idx + 1}. Mã Đơn: {ord.orderCode}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(ord.createdAt).toLocaleString('vi-VN')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {ord.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200/60 space-y-1.5">
                    <p className="text-xs font-bold text-slate-800">
                      Danh sách phụ tùng yêu cầu báo giá:
                    </p>
                    <ul className="space-y-1">
                      {ord.items.map((it) => (
                        <li key={`hist-item-${it.id}`} className="text-xs text-slate-700 flex items-center justify-between">
                          <span className="font-semibold text-slate-900">• {it.productName} (x{it.quantity})</span>
                          <span className="text-[10px] text-slate-400 font-mono">Mã SP: {it.partNumber}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {ord.notes && (
                    <p className="text-xs text-slate-500 italic">
                      Ghi chú đơn: {ord.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Tổng cộng {historyCustomer.recentOrders.length} đơn báo giá từ SĐT này</span>
              <button
                onClick={() => setHistoryCustomer(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Đóng Bảng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <ToastNotification toast={toastState} onClose={() => setToastState(null)} />
    </div>
  );
}
