'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  PhoneCall,
  MessageSquare,
  Download,
  Send,
  Loader2,
  Clock,
  UserCheck,
  History,
  Users,
  ListFilter,
  CheckCircle2,
  AlertCircle,
  Package,
  Trash2,
  Edit,
  Plus,
  X,
} from 'lucide-react';
import { fetchApi } from '@/config/api';
import { AdminApiService } from '@/services/adminApiService';
import { useAdminNotification } from '@/context/AdminNotificationContext';
import ToastNotification, { ToastMessage } from '@/components/ui/ToastNotification';

interface OrderPartItem {
  name: string;
  sku: string;
  qty: number;
  price: string;
}

interface OrderData {
  id: number;
  orderCode: string;
  customerName: string;
  phone: string;
  email: string;
  companyName: string;
  notes: string;
  createdAt: string;
  rawCreatedAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  statusText: string;
  statusColor: string;
  totalAmount: number;
  parts: OrderPartItem[];
  customerStats?: {
    totalOrders: number;
    totalSpent: number;
    lastOrderAt: string;
  };
  customerBadgeText: string;
  customerBadgeColor: string;
}

interface CustomerGroupData {
  phone: string;
  customerName: string;
  email: string;
  companyName: string;
  ordersCount: number;
  hasPending: boolean;
  overallStatusText: string;
  overallStatusColor: string;
  latestOrder: OrderData;
  orders: OrderData[];
  allParts: OrderPartItem[];
}

export default function AdminOrdersPage() {
  const { refreshNotifications, pendingCount } = useAdminNotification();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupByCustomer, setGroupByCustomer] = useState<boolean>(true); // Default true for clean grouped UX
  const [ordersList, setOrdersList] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [selectedCustomerGroup, setSelectedCustomerGroup] = useState<CustomerGroupData | null>(null);

  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [toastState, setToastState] = useState<ToastMessage | null>(null);

  // Customer History Modal State
  const [customerHistory, setCustomerHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'detail' | 'history'>('detail');

  // Create & Edit Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editOrderId, setEditOrderId] = useState<number | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editCustomerEmail, setEditCustomerEmail] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending');
  const [submittingModal, setSubmittingModal] = useState(false);

  // Delete Confirmation Modal State
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    type: 'single' | 'group';
    id?: number;
    code?: string;
    phone?: string;
    name?: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const requestDeleteOrder = (orderId: number, orderCode?: string) => {
    setDeleteConfirmState({
      isOpen: true,
      type: 'single',
      id: orderId,
      code: orderCode,
    });
  };

  const requestDeleteCustomerGroup = (phone: string, name: string) => {
    setDeleteConfirmState({
      isOpen: true,
      type: 'group',
      phone,
      name,
    });
  };

  const handleConfirmExecuteDelete = async () => {
    if (!deleteConfirmState) return;
    setDeleting(true);
    try {
      if (deleteConfirmState.type === 'single' && deleteConfirmState.id) {
        const res = await AdminApiService.deleteOrder(deleteConfirmState.id);
        if (res.ok) {
          setToastState({
            id: String(Date.now()),
            type: 'success',
            title: 'Đã Xóa Đơn Báo Giá',
            message: res.message || `Đã xóa đơn ${deleteConfirmState.code || ''} khỏi hệ thống!`,
          });
          setSelectedOrder(null);
          await fetchOrders();
          await refreshNotifications();
        } else {
          setToastState({
            id: String(Date.now()),
            type: 'error',
            title: 'Thất Bại',
            message: res.message || 'Không thể xóa đơn báo giá.',
          });
        }
      } else if (deleteConfirmState.type === 'group' && deleteConfirmState.phone) {
        const res = await AdminApiService.deleteCustomerGroup(deleteConfirmState.phone);
        if (res.ok) {
          setToastState({
            id: String(Date.now()),
            type: 'success',
            title: 'Đã Xóa Tất Cả Đơn',
            message: res.message || `Đã xóa toàn bộ đơn báo giá của SĐT ${deleteConfirmState.phone}`,
          });
          setSelectedOrder(null);
          await fetchOrders();
          await refreshNotifications();
        } else {
          setToastState({
            id: String(Date.now()),
            type: 'error',
            title: 'Thất Bại',
            message: res.message || 'Không thể xóa danh sách đơn.',
          });
        }
      }
    } catch {
      setToastState({ id: String(Date.now()), type: 'error', title: 'Lỗi', message: 'Không thể kết nối đến máy chủ.' });
    } finally {
      setDeleting(false);
      setDeleteConfirmState(null);
    }
  };

  // Open Edit Order Modal
  const handleOpenEditModal = (ord: OrderData) => {
    setEditOrderId(ord.id);
    setEditCustomerName(ord.customerName);
    setEditCustomerPhone(ord.phone);
    setEditCustomerEmail(ord.email || '');
    setEditCompanyName(ord.companyName || '');
    setEditNotes(ord.notes || '');
    setEditStatus(ord.status);
    setIsEditModalOpen(true);
  };

  // Save Edit Order Details API Call
  const handleSaveEditOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrderId) return;
    setSubmittingModal(true);
    try {
      const res = await AdminApiService.updateOrderDetails(editOrderId, {
        customerName: editCustomerName.trim(),
        customerPhone: editCustomerPhone.trim(),
        customerEmail: editCustomerEmail.trim() || null,
        companyName: editCompanyName.trim() || null,
        notes: editNotes.trim() || null,
        status: editStatus,
      });

      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Cập Nhật Thành Công',
          message: 'Đã cập nhật thông tin đơn báo giá!',
        });
        setIsEditModalOpen(false);
        if (selectedOrder && selectedOrder.id === editOrderId) {
          setSelectedOrder(null);
        }
        await fetchOrders();
        await refreshNotifications();
      } else {
        setToastState({
          id: String(Date.now()),
          type: 'error',
          title: 'Thất Bại',
          message: res.message || 'Không thể cập nhật thông tin đơn.',
        });
      }
    } catch {
      setToastState({ id: String(Date.now()), type: 'error', title: 'Lỗi', message: 'Không thể kết nối đến máy chủ.' });
    } finally {
      setSubmittingModal(false);
    }
  };

  // Save Create Order API Call
  const handleSaveCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerPhone.trim()) return;
    setSubmittingModal(true);
    try {
      const res = await AdminApiService.createOrder({
        customerName: newCustomerName.trim() || 'Khách Hàng Q.BA',
        customerPhone: newCustomerPhone.trim(),
        customerEmail: newCustomerEmail.trim() || undefined,
        companyName: newCompanyName.trim() || undefined,
        notes: newNotes.trim() || undefined,
      });

      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Tạo Đơn Thành Công',
          message: 'Đã thêm đơn báo giá mới thành công!',
        });
        setIsCreateModalOpen(false);
        setNewCustomerName('');
        setNewCustomerPhone('');
        setNewCustomerEmail('');
        setNewCompanyName('');
        setNewNotes('');
        await fetchOrders();
        await refreshNotifications();
      } else {
        setToastState({
          id: String(Date.now()),
          type: 'error',
          title: 'Thất Bại',
          message: res.message || 'Không thể tạo đơn báo giá mới.',
        });
      }
    } catch {
      setToastState({ id: String(Date.now()), type: 'error', title: 'Lỗi', message: 'Không thể kết nối máy chủ.' });
    } finally {
      setSubmittingModal(false);
    }
  };

  // Fetch Orders from PostgreSQL Database API
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/orders/admin?limit=100');
      if (res.ok && res.data) {
        const mapped: OrderData[] = res.data.map((o: any) => {
          let statusText = 'MỚI GỬI';
          let statusColor = 'bg-red-100 text-red-800 border-red-200';

          if (o.status === 'confirmed') {
            statusText = 'ĐÃ XÁC NHẬN';
            statusColor = 'bg-blue-100 text-blue-800 border-blue-200';
          } else if (o.status === 'completed') {
            statusText = 'HOÀN THÀNH';
            statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
          } else if (o.status === 'cancelled') {
            statusText = 'ĐÃ HỦY';
            statusColor = 'bg-slate-200 text-slate-700 border-slate-300';
          }

          const parts: OrderPartItem[] = (o.items || []).map((i: any) => ({
            name: i.productName || 'Phụ tùng xe tải Q.BA',
            sku: i.partNumber || `PN-${i.productId}`,
            qty: i.quantity || 1,
            price: i.unitPrice && Number(i.unitPrice) > 0
              ? `${Number(i.unitPrice).toLocaleString()} ₫`
              : 'Báo Giá Zalo',
          }));

          const dateObj = new Date(o.createdAt);
          const formattedDate = dateObj.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });

          // Compact Clean Customer Badges
          const totalOrders = o.customerStats?.totalOrders || 1;
          let customerBadgeText = '🆕 Mới';
          let customerBadgeColor = 'bg-slate-100 text-slate-600 border-slate-200';

          if (totalOrders >= 5) {
            customerBadgeText = `⭐ VIP (${totalOrders} đơn)`;
            customerBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
          } else if (totalOrders >= 2) {
            customerBadgeText = `🔄 ${totalOrders} đơn`;
            customerBadgeColor = 'bg-blue-100 text-blue-800 border-blue-200 font-bold';
          }

          return {
            id: o.id,
            orderCode: o.orderCode,
            customerName: o.customerName || 'Khách Hàng Q.BA',
            phone: o.customerPhone,
            email: o.customerEmail || '',
            companyName: o.companyName || '',
            notes: o.notes || 'Yêu cầu tư vấn báo giá hỏa tốc.',
            createdAt: formattedDate,
            rawCreatedAt: o.createdAt,
            status: o.status,
            statusText,
            statusColor,
            totalAmount: Number(o.totalAmount) || 0,
            parts,
            customerStats: o.customerStats,
            customerBadgeText,
            customerBadgeColor,
          };
        });

        setOrdersList(mapped);
      }
    } catch {
      // Keep existing
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 8000);

    const handleNewOrder = () => fetchOrders();

    window.addEventListener('quyba_new_order', handleNewOrder);
    window.addEventListener('focus', handleNewOrder);

    // Cross-tab BroadcastChannel listener for immediate table refresh
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('quyba_order_channel');
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'NEW_ORDER') {
          fetchOrders();
        }
      };
    } catch {}

    // Storage event listener for cross-tab fallback
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'quyba_new_order_ping') {
        fetchOrders();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('quyba_new_order', handleNewOrder);
      window.removeEventListener('focus', handleNewOrder);
      window.removeEventListener('storage', handleStorageChange);
      if (bc) bc.close();
    };
  }, [fetchOrders]);

  // Open Customer Detail / History Modal
  const openOrderDetail = async (ord: OrderData) => {
    setSelectedOrder(ord);
    setActiveTab('detail');
    setLoadingHistory(true);
    try {
      const res = await AdminApiService.getCustomerHistory(ord.phone);
      if (res.ok && res.data) {
        setCustomerHistory(res.data.orders || []);
      }
    } catch {
      // Keep fallback
    } finally {
      setLoadingHistory(false);
    }
  };

  // Update Order Status API Call
  const handleUpdateStatus = async (orderId: number, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    setUpdatingStatus(true);
    try {
      const res = await fetchApi(`/orders/admin/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Cập Nhật Thành Công',
          message: `Đã cập nhật trạng thái đơn báo giá sang [${newStatus.toUpperCase()}]`,
        });
        setSelectedOrder(null);
        await fetchOrders();
        await refreshNotifications();
      } else {
        setToastState({
          id: String(Date.now()),
          type: 'error',
          title: 'Thất Bại',
          message: res.message || 'Không thể cập nhật trạng thái đơn.',
        });
      }
    } catch {
      setToastState({
        id: String(Date.now()),
        type: 'error',
        title: 'Lỗi Kết Nối',
        message: 'Không thể kết nối đến máy chủ Express.',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Filtered Raw Orders
  const filteredOrders = useMemo(() => {
    return ordersList.filter((ord) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ord.orderCode.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.phone.includes(q);

      const matchesStatus = filterStatus === 'ALL' || ord.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [ordersList, searchQuery, filterStatus]);

  // Grouped By Customer Phone Number
  const customerGroups = useMemo(() => {
    const map = new Map<string, CustomerGroupData>();

    ordersList.forEach((ord) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ord.orderCode.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.phone.includes(q);

      if (!matchesSearch) return;

      // Filter by status tab if a specific tab is active
      if (filterStatus !== 'ALL' && ord.status !== filterStatus) {
        return;
      }

      let group = map.get(ord.phone);
      if (!group) {
        group = {
          phone: ord.phone,
          customerName: ord.customerName,
          email: ord.email,
          companyName: ord.companyName,
          ordersCount: 0,
          hasPending: false,
          overallStatusText: 'HOÀN THÀNH',
          overallStatusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          latestOrder: ord,
          orders: [],
          allParts: [],
        };
        map.set(ord.phone, group);
      }

      group.orders.push(ord);
      group.ordersCount = group.orders.length;
      group.allParts.push(...ord.parts);

      if (ord.status === 'pending') {
        group.hasPending = true;
      }
    });

    // Compute status badge and latest order for each customer group
    const result = Array.from(map.values());
    result.forEach((g) => {
      if (g.orders.length > 0) {
        g.latestOrder = g.orders[0];
      }

      if (filterStatus !== 'ALL') {
        if (filterStatus === 'pending') {
          g.overallStatusText = 'MỚI GỬI (Chờ Báo Giá)';
          g.overallStatusColor = 'bg-red-100 text-red-800 border-red-200 font-extrabold animate-pulse';
        } else if (filterStatus === 'confirmed') {
          g.overallStatusText = 'ĐÃ XÁC NHẬN';
          g.overallStatusColor = 'bg-blue-100 text-blue-800 border-blue-200 font-bold';
        } else if (filterStatus === 'completed') {
          g.overallStatusText = 'HOÀN THÀNH';
          g.overallStatusColor = 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold';
        } else if (filterStatus === 'cancelled') {
          g.overallStatusText = 'ĐÃ HỦY';
          g.overallStatusColor = 'bg-slate-200 text-slate-700 border-slate-300 font-bold';
        }
      } else {
        if (g.hasPending) {
          g.overallStatusText = 'MỚI GỬI (Chờ Báo Giá)';
          g.overallStatusColor = 'bg-red-100 text-red-800 border-red-200 font-extrabold animate-pulse';
        } else if (g.orders.some((o) => o.status === 'confirmed')) {
          g.overallStatusText = 'ĐÃ XÁC NHẬN';
          g.overallStatusColor = 'bg-blue-100 text-blue-800 border-blue-200 font-bold';
        } else {
          g.overallStatusText = 'HOÀN THÀNH';
          g.overallStatusColor = 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold';
        }
      }
    });

    return result;
  }, [ordersList, searchQuery, filterStatus]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Quản Lý Yêu Cầu Báo Giá Phụ Tùng
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
              {pendingCount} Khách Đang Chờ Báo Giá
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Lắng nghe Real-Time 100% - Gom nhóm gọn gàng theo Khách hàng, phân biệt chính xác đơn đã báo hay chưa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Đơn Mới</span>
          </button>

          <button
            onClick={() => {
              setToastState({
                id: String(Date.now()),
                type: 'success',
                title: 'Xuất File Excel Thành Công',
                message: `Đã xuất danh sách ${ordersList.length} đơn báo giá ra file Excel!`,
              });
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel Kho</span>
          </button>
        </div>
      </div>

      {/* Toolbar Search, Grouping Toggle & Status Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Tên khách hàng, Số điện thoại hoặc Mã đơn..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800 font-medium"
            />
          </div>

          {/* Grouping Toggle Switch */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start md:self-auto">
            <button
              onClick={() => setGroupByCustomer(true)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                groupByCustomer ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-red-600" />
              <span>Gom Nhóm Theo Khách Hàng ({customerGroups.length})</span>
            </button>
            <button
              onClick={() => setGroupByCustomer(false)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                !groupByCustomer ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Xem Tất Cả Đơn Lẻ ({filteredOrders.length})</span>
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 max-w-full">
          {[
            { key: 'ALL', label: `Tất Cả (${ordersList.length})` },
            { key: 'pending', label: 'Mới Gửi (Pending)' },
            { key: 'confirmed', label: 'Đã Xác Nhận' },
            { key: 'completed', label: 'Hoàn Thành' },
            { key: 'cancelled', label: 'Đã Hủy' },
          ].map((st) => (
            <button
              key={`status-tab-${st.key}`}
              onClick={() => setFilterStatus(st.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
                filterStatus === st.key
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Data Container Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
            <p className="text-xs font-bold">Đang tải dữ liệu báo giá từ PostgreSQL Database...</p>
          </div>
        ) : (groupByCustomer ? customerGroups.length === 0 : filteredOrders.length === 0) ? (
          <div className="p-12 text-center space-y-2 bg-slate-50">
            <Clock className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">Chưa có yêu cầu báo giá phù hợp</h4>
            <p className="text-xs text-slate-400">Không tìm thấy yêu cầu báo giá nào theo điều kiện lọc.</p>
          </div>
        ) : groupByCustomer ? (
          /* OPTION 1: GROUPED BY UNIQUE CUSTOMER PHONE NUMBER VIEW (CLEAN & NON-REPETITIVE) */
          <div className="max-h-[580px] overflow-y-auto overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs shadow-2xs">
                <tr className="text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 pl-5">Khách Hàng & SĐT</th>
                  <th className="p-3.5">Phân Loại</th>
                  <th className="p-3.5">Tổng Phụ Tùng Đã Yêu Cầu</th>
                  <th className="p-3.5">Yêu Cầu Mới Nhất</th>
                  <th className="p-3.5">Trạng Thái Xử Lý</th>
                  <th className="p-3.5 pr-5 text-right">Tương Tác Hỏa Tốc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerGroups.map((group) => {
                  const latest = group.latestOrder;
                  return (
                    <tr key={`cust-group-${group.phone}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="font-extrabold text-slate-900 text-xs">{group.customerName}</div>
                        <a
                          href={`tel:${group.phone}`}
                          className="text-red-600 hover:underline font-extrabold flex items-center gap-1 mt-0.5 text-xs"
                        >
                          <PhoneCall className="w-3 h-3" />
                          {group.phone}
                        </a>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] whitespace-nowrap border ${latest.customerBadgeColor}`}
                        >
                          {latest.customerBadgeText}
                        </span>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <div className="font-bold text-slate-800 line-clamp-1">
                          {group.allParts.map((p) => `${p.name} (x${p.qty})`).join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          {group.ordersCount} đơn báo giá từ SĐT này
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {latest.createdAt}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${group.overallStatusColor}`}
                        >
                          {group.overallStatusText}
                        </span>
                      </td>

                      <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://zalo.me/${group.phone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            title="Tư vấn Zalo hỏa tốc"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Zalo</span>
                          </a>

                          <button
                            onClick={() => openOrderDetail(latest)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all text-xs cursor-pointer"
                          >
                            Xem ({group.ordersCount}) Đơn
                          </button>

                          <button
                            onClick={() => requestDeleteCustomerGroup(group.phone, group.customerName)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-all text-xs cursor-pointer"
                            title="Xóa tất cả đơn thuộc SĐT này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* OPTION 2: RAW UNGROUPED ORDERS LIST VIEW */
          <div className="max-h-[580px] overflow-y-auto overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs shadow-2xs">
                <tr className="text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 pl-5">Mã Đơn Báo Giá</th>
                  <th className="p-3.5">Khách Hàng & SĐT</th>
                  <th className="p-3.5">Chi Tiết Phụ Tùng Yêu Cầu</th>
                  <th className="p-3.5">Thời Gian Gửi</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5 pr-5 text-right">Tương Tác Hỏa Tốc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <tr key={`ord-row-${ord.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5 font-bold font-mono text-red-600 text-xs">
                      {ord.orderCode}
                    </td>

                    <td className="p-3.5">
                      <div className="font-extrabold text-slate-900 text-xs">{ord.customerName}</div>
                      <a
                        href={`tel:${ord.phone}`}
                        className="text-red-600 hover:underline font-extrabold flex items-center gap-1 mt-0.5 text-xs"
                      >
                        <PhoneCall className="w-3 h-3" />
                        {ord.phone}
                      </a>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <div className="font-bold text-slate-800 line-clamp-1">
                        {ord.parts.map((p) => `${p.name} (x${p.qty})`).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        Ghi chú: {ord.notes}
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">{ord.createdAt}</td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${ord.statusColor}`}
                      >
                        {ord.statusText}
                      </span>
                    </td>

                    <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`https://zalo.me/${ord.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          title="Tư vấn Zalo hỏa tốc"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Zalo</span>
                        </a>

                        <button
                          onClick={() => handleOpenEditModal(ord)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold transition-all text-xs cursor-pointer"
                          title="Sửa thông tin đơn"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => requestDeleteOrder(ord.id, ord.orderCode)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-all text-xs cursor-pointer"
                          title="Xóa đơn này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openOrderDetail(ord)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all text-xs cursor-pointer"
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
        )}
      </div>

      {/* Order Detail & Customer History Combined Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Chi Tiết Báo Giá {selectedOrder.orderCode}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] border ${selectedOrder.customerBadgeColor}`}>
                    {selectedOrder.customerBadgeText}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Khách gửi lúc: {selectedOrder.createdAt}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center flex-shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
              <button
                onClick={() => setActiveTab('detail')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'detail'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Thông Tin Đơn Hiện Tại
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Lịch Sử SĐT ({customerHistory.length} Đơn)</span>
              </button>
            </div>

            {/* TAB 1: CURRENT ORDER DETAIL */}
            {activeTab === 'detail' && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 font-semibold block">Họ và tên:</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Số điện thoại:</span>
                    <a href={`tel:${selectedOrder.phone}`} className="font-extrabold text-red-600 text-sm">
                      {selectedOrder.phone}
                    </a>
                  </div>
                  {selectedOrder.email && (
                    <div>
                      <span className="text-slate-400 font-semibold block">Email:</span>
                      <span className="font-bold text-slate-800">{selectedOrder.email}</span>
                    </div>
                  )}
                  {selectedOrder.companyName && (
                    <div>
                      <span className="text-slate-400 font-semibold block">Đơn vị / Gara:</span>
                      <span className="font-bold text-slate-800">{selectedOrder.companyName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Danh Sách Phụ Tùng Yêu Cầu Báo Giá:</h4>
                  <div className="space-y-2">
                    {selectedOrder.parts.map((p, idx) => (
                      <div
                        key={`modal-part-${idx}`}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Mã Part No: {p.sku}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-extrabold text-slate-900 block">Số lượng: x{p.qty}</span>
                          <span className="text-[11px] font-bold text-red-600">{p.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
                    <span className="font-bold block mb-1">Ghi chú từ khách hàng:</span>
                    <p className="whitespace-pre-line">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Status Selector in Modal */}
                <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 space-y-2">
                  <label className="font-bold text-slate-800 text-xs block">
                    Đổi Trạng Thái Xử Lý Đơn Báo Giá:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'pending', label: 'Chờ Xử Lý' },
                      { key: 'confirmed', label: 'Xác Nhận' },
                      { key: 'completed', label: 'Hoàn Thành' },
                      { key: 'cancelled', label: 'Hủy Đơn' },
                    ].map((st) => (
                      <button
                        key={`btn-st-${st.key}`}
                        disabled={updatingStatus}
                        onClick={() => handleUpdateStatus(selectedOrder.id, st.key as any)}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedOrder.status === st.key
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CUSTOMER HISTORY TIMELINE */}
            {activeTab === 'history' && (
              <div className="space-y-3 text-xs animate-in fade-in duration-150">
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Hồ Sơ Yêu Cầu Báo Giá Của SĐT {selectedOrder.phone}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Tổng cộng {customerHistory.length} lần gửi báo giá vào hệ thống Q.BA.
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] border ${selectedOrder.customerBadgeColor}`}>
                    {selectedOrder.customerBadgeText}
                  </span>
                </div>

                {loadingHistory ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600" />
                    <p className="text-xs font-bold">Đang tải lịch sử báo giá của khách hàng...</p>
                  </div>
                ) : customerHistory.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    Chưa có lịch sử đơn báo giá nào khác.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {customerHistory.map((hOrd: any) => {
                      const hDate = new Date(hOrd.createdAt).toLocaleString('vi-VN');
                      return (
                        <div
                          key={`hist-ord-${hOrd.id}`}
                          className={`p-3 rounded-xl border transition-all ${
                            hOrd.id === selectedOrder.id
                              ? 'bg-red-50/60 border-red-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-extrabold font-mono text-red-600">{hOrd.orderCode}</span>
                            <span className="text-[10px] text-slate-400">{hDate}</span>
                          </div>

                          <div className="text-slate-800 font-medium text-xs">
                            Phụ tùng: {(hOrd.items || []).map((i: any) => `${i.productName} (x${i.quantity})`).join(', ') || 'Tư vấn báo giá'}
                          </div>

                          {hOrd.notes && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                              Ghi chú: {hOrd.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <a
                  href={`https://zalo.me/${selectedOrder.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Chat Zalo</span>
                </a>

                <button
                  onClick={() => handleOpenEditModal(selectedOrder)}
                  className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Sửa Đơn</span>
                </button>

                <button
                  onClick={() => requestDeleteOrder(selectedOrder.id, selectedOrder.orderCode)}
                  className="px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Đơn Này</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => requestDeleteCustomerGroup(selectedOrder.phone, selectedOrder.customerName)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
                  title="Xóa tất cả đơn lưu trữ dưới SĐT này"
                >
                  Xóa Tất Cả Đơn SĐT Này
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW QUOTATION ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Plus className="w-5 h-5 text-red-600" />
                  Tạo Đơn Báo Giá Phụ Tùng Mới
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Tạo nhanh yêu cầu báo giá tư vấn cho khách hàng trực tiếp.</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCreateOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên Khách Hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Hùng"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Số Điện Thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0905123456"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên Đơn Vị / Gara</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Gara Ô Tô Hải Vân"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email (Nếu có)</label>
                  <input
                    type="email"
                    placeholder="khachhang@gmail.com"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ghi Chú Yêu Cầu Phụ Tùng</label>
                <textarea
                  rows={3}
                  placeholder="Ví dụ: Cần 2 bộ lọc dầu Weichai WP10 và 1 kim phun điện tử..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingModal}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submittingModal && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Tạo Đơn Báo Giá</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT QUOTATION ORDER MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Edit className="w-5 h-5 text-amber-600" />
                  Chỉnh Sửa Thông Tin Đơn Báo Giá
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Cập nhật thông tin khách hàng hoặc ghi chú đơn.</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Khách Hàng</label>
                <input
                  type="text"
                  required
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số Điện Thoại</label>
                <input
                  type="tel"
                  required
                  value={editCustomerPhone}
                  onChange={(e) => setEditCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên Gara / Đơn Vị</label>
                  <input
                    type="text"
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={editCustomerEmail}
                    onChange={(e) => setEditCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Trạng Thái Đơn</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-bold"
                >
                  <option value="pending">🔴 MỚI GỬI (Chờ Báo Giá)</option>
                  <option value="confirmed">🔵 ĐÃ XÁC NHẬN (Đang Báo Giá)</option>
                  <option value="completed">🟢 HOÀN THÀNH (Đã Chốt Đơn)</option>
                  <option value="cancelled">⚪ ĐÃ HỦY (Hủy Đơn)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ghi Chú Đơn</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingModal}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submittingModal && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BEAUTIFUL CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteConfirmState?.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-red-100 transform animate-in zoom-in-95 duration-200">
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner border border-red-200/60 ring-8 ring-red-50">
              <AlertCircle className="w-8 h-8 text-red-600 animate-pulse" />
            </div>

            {/* Modal Title & Text */}
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Xác Nhận Xóa Vĩnh Viễn?
              </h3>
              {deleteConfirmState.type === 'single' ? (
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Bạn có chắc chắn muốn xóa đơn báo giá <span className="font-extrabold font-mono text-red-600">{deleteConfirmState.code}</span> khỏi hệ thống cơ sở dữ liệu? Thao tác này không thể hoàn tác.
                </p>
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Bạn có chắc chắn muốn xóa <span className="font-extrabold text-slate-900">TOÀN BỘ đơn báo giá</span> thuộc SĐT <span className="font-extrabold text-red-600">{deleteConfirmState.phone}</span> ({deleteConfirmState.name})?
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteConfirmState(null)}
                className="w-1/2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmExecuteDelete}
                className="w-1/2 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Trash2 className="w-4 h-4 text-white" />
                )}
                <span>ĐỒNG Ý XÓA</span>
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
