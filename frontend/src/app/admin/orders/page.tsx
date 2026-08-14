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
  Save,
} from 'lucide-react';
import { Table, Tag, Popconfirm, ConfigProvider, Tooltip, Select } from 'antd';
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

  const [newParts, setNewParts] = useState<
    Array<{ productName: string; partNumber: string; quantity: number; unitPrice: number; itemNote: string }>
  >([{ productName: '', partNumber: '', quantity: 1, unitPrice: 0, itemNote: '' }]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderData | null>(null);
  const [editStatus, setEditStatus] = useState<string>('pending');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminApiService.getAdminOrders();
      if (res.ok && res.data) {
        const rawOrders = Array.isArray(res.data) ? res.data : (res.data.orders || []);

        const mapped: OrderData[] = rawOrders.map((o: any) => {
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
          let customerBadgeText = 'Mới';
          let customerBadgeColor = 'bg-slate-100 text-slate-600 border-slate-200';

          if (totalOrders >= 5) {
            customerBadgeText = `VIP (${totalOrders} đơn)`;
            customerBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
          } else if (totalOrders >= 2) {
            customerBadgeText = `Khách Quen (${totalOrders} đơn)`;
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
    // Initial fetch ONCE on mount
    fetchOrders();

    // 1. Direct WebSocket New Order Push Handler (Zero HTTP Call)
    const handleWsNewOrder = (e: any) => {
      const o = e.detail;
      if (!o) return;

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
        price: i.unitPrice && Number(i.unitPrice) > 0 ? `${Number(i.unitPrice).toLocaleString()} ₫` : 'Báo Giá Zalo',
      }));

      const newMappedOrder: OrderData = {
        id: Number(o.id) || Date.now(),
        orderCode: o.orderCode,
        customerName: o.customerName || 'Khách hàng Q.BA',
        phone: o.customerPhone,
        email: o.customerEmail || '',
        companyName: o.companyName || '',
        notes: o.notes || '',
        createdAt: o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN'),
        rawCreatedAt: o.createdAt || new Date().toISOString(),
        status: o.status,
        statusText,
        statusColor,
        totalAmount: o.totalAmount ? Number(o.totalAmount) : 0,
        parts,
        customerBadgeText: 'Khách Mới (1 đơn)',
        customerBadgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      };

      setOrdersList((prev) => {
        const exists = prev.some((item) => item.id === newMappedOrder.id);
        if (exists) return prev;
        return [newMappedOrder, ...prev];
      });
    };

    // 2. Direct WebSocket Status Update Handler (Zero HTTP Call)
    const handleWsStatusUpdate = (e: any) => {
      const { orderId, newStatus } = e.detail || {};
      if (!orderId) return;

      let statusText = 'MỚI GỬI';
      let statusColor = 'bg-red-100 text-red-800 border-red-200';
      if (newStatus === 'confirmed') {
        statusText = 'ĐÃ XÁC NHẬN';
        statusColor = 'bg-blue-100 text-blue-800 border-blue-200';
      } else if (newStatus === 'completed') {
        statusText = 'HOÀN THÀNH';
        statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      } else if (newStatus === 'cancelled') {
        statusText = 'ĐÃ HỦY';
        statusColor = 'bg-slate-200 text-slate-700 border-slate-300';
      }

      setOrdersList((prev) =>
        prev.map((item) =>
          item.id === Number(orderId)
            ? { ...item, status: newStatus, statusText, statusColor }
            : item
        )
      );
    };

    window.addEventListener('quyba_ws_new_order', handleWsNewOrder);
    window.addEventListener('quyba_ws_status_update', handleWsStatusUpdate);

    return () => {
      window.removeEventListener('quyba_ws_new_order', handleWsNewOrder);
      window.removeEventListener('quyba_ws_status_update', handleWsStatusUpdate);
    };
  }, [fetchOrders]);

  // Open Order Details Modal & Fetch Customer Purchase History
  const openOrderDetail = async (order: OrderData) => {
    setSelectedOrder(order);
    setActiveTab('detail');
    setLoadingHistory(true);
    try {
      const res = await fetchApi(`/orders/admin/customer-history/${order.phone}`);
      if (res.ok && res.data) {
        setCustomerHistory(Array.isArray(res.data) ? res.data : (res.data.orders || []));
      }
    } catch {
      setCustomerHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Create Manual Quotation Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerPhone || !newCustomerName) {
      alert('Vui lòng nhập Tên khách hàng và Số điện thoại');
      return;
    }

    try {
      const payload = {
        customerName: newCustomerName,
        customerPhone: newCustomerPhone,
        customerEmail: newCustomerEmail,
        companyName: newCompanyName,
        notes: newNotes,
        items: newParts.filter((p) => p.productName.trim() !== ''),
      };

      const res = await AdminApiService.createQuotationOrder(payload);
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Tạo Đơn Thành Công',
          message: `Đã tạo đơn báo giá thủ công [${res.data?.orderCode || ''}] cho ${newCustomerName}!`,
        });
        setIsCreateModalOpen(false);
        setNewCustomerName('');
        setNewCustomerPhone('');
        setNewCustomerEmail('');
        setNewCompanyName('');
        setNewNotes('');
        setNewParts([{ productName: '', partNumber: '', quantity: 1, unitPrice: 0, itemNote: '' }]);
        fetchOrders();
      } else {
        alert(res.message || 'Không thể tạo đơn');
      }
    } catch {
      alert('Lỗi kết nối máy chủ khi tạo đơn');
    }
  };

  // Open Edit Order Modal
  const handleOpenEditModal = (order: OrderData) => {
    setEditingOrder(order);
    setEditStatus(order.status);
    setEditCustomerName(order.customerName);
    setEditPhone(order.phone);
    setIsEditModalOpen(true);
  };

  // Save Edit Order Details
  const handleSaveEditOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      const res = await AdminApiService.updateOrderDetails(editingOrder.id, {
        status: editStatus,
        customerName: editCustomerName,
        customerPhone: editPhone,
      });

      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Cập Nhật Thành Công',
          message: `Đã cập nhật thông tin đơn báo giá [${editingOrder.orderCode}]!`,
        });
        setIsEditModalOpen(false);
        fetchOrders();
      } else {
        alert(res.message || 'Lỗi cập nhật đơn');
      }
    } catch {
      alert('Lỗi máy chủ khi cập nhật đơn');
    }
  };

  // Delete Single Order
  const requestDeleteOrder = async (orderId: number, orderCode: string) => {
    try {
      const res = await AdminApiService.deleteOrder(orderId);
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Đã Xóa Đơn',
          message: `Đã xóa đơn báo giá [${orderCode}] khỏi hệ thống CSDL PostgreSQL!`,
        });
        setOrdersList((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrder?.id === orderId) setSelectedOrder(null);
        await refreshNotifications();
      } else {
        alert(res.message || 'Lỗi khi xóa đơn');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  // Delete Entire Customer Group Orders
  const requestDeleteCustomerGroup = async (phone: string, customerName: string) => {
    try {
      const res = await AdminApiService.deleteCustomerGroup(phone);
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Đã Xóa Nhóm Khách Hàng',
          message: `Đã xóa toàn bộ đơn báo giá thuộc SĐT [${phone}] của khách hàng ${customerName}!`,
        });
        setOrdersList((prev) => prev.filter((o) => o.phone !== phone));
        if (selectedCustomerGroup?.phone === phone) setSelectedCustomerGroup(null);
        await refreshNotifications();
      } else {
        alert(res.message || 'Lỗi khi xóa nhóm khách hàng');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  // Quick Status Update
  const handleQuickStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await AdminApiService.updateOrderStatus(orderId, newStatus);
      if (res.ok) {
        setOrdersList((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: newStatus as any,
                  statusText:
                    newStatus === 'confirmed'
                      ? 'ĐÃ XÁC NHẬN'
                      : newStatus === 'completed'
                      ? 'HOÀN THÀNH'
                      : newStatus === 'cancelled'
                      ? 'ĐÃ HỦY'
                      : 'MỚI GỬI',
                  statusColor:
                    newStatus === 'confirmed'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : newStatus === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : newStatus === 'cancelled'
                      ? 'bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-red-100 text-red-800 border-red-200',
                }
              : o
          )
        );

        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Cập Nhật Trạng Thái',
          message: 'Đã cập nhật trạng thái đơn báo giá thành công!',
        });
        await refreshNotifications();
      } else {
        alert(res.message || 'Không thể cập nhật trạng thái đơn.');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
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

  // AntD Columns for Customer Group View
  const columnsCustomerGroup = [
    {
      title: 'Khách Hàng & SĐT',
      dataIndex: 'customerName',
      key: 'customerName',
      sorter: (a: CustomerGroupData, b: CustomerGroupData) => a.customerName.localeCompare(b.customerName),
      render: (_: any, record: CustomerGroupData) => (
        <div className="w-full">
          <div className="flex items-center justify-between gap-2">
            <span className="font-extrabold text-slate-900 text-xs truncate">{record.customerName}</span>
            <Tag
              color={record.latestOrder.customerBadgeText.includes('VIP') ? 'gold' : record.ordersCount > 1 ? 'blue' : 'default'}
              className="m-0 text-[10px] shrink-0"
            >
              {record.latestOrder.customerBadgeText}
            </Tag>
          </div>
          <a
            href={`tel:${record.phone}`}
            className="text-red-600 hover:underline font-extrabold flex items-center gap-1 mt-0.5 text-xs"
          >
            <PhoneCall className="w-3 h-3" />
            {record.phone}
          </a>
        </div>
      ),
    },
    {
      title: 'Số Đơn Báo Giá',
      dataIndex: 'ordersCount',
      key: 'ordersCount',
      sorter: (a: CustomerGroupData, b: CustomerGroupData) => a.ordersCount - b.ordersCount,
      render: (count: number) => <Tag color="blue" className="font-bold text-xs">{count} đơn báo giá</Tag>,
    },
    {
      title: 'Tổng Phụ Tùng Yêu Cầu',
      key: 'allParts',
      render: (_: any, record: CustomerGroupData) => (
        <div className="max-w-xs">
          <div className="font-bold text-slate-800 line-clamp-1">
            {record.allParts.map((p) => `${p.name} (x${p.qty})`).join(', ')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {record.allParts.length} mã linh kiện
          </div>
        </div>
      ),
    },
    {
      title: 'Gửi Mới Nhất',
      key: 'latestOrder',
      sorter: (a: CustomerGroupData, b: CustomerGroupData) => new Date(b.latestOrder.rawCreatedAt).getTime() - new Date(a.latestOrder.rawCreatedAt).getTime(),
      render: (_: any, record: CustomerGroupData) => (
        <span className="text-slate-600 font-mono text-xs">{record.latestOrder.createdAt}</span>
      ),
    },
    {
      title: 'Trạng Thái Xử Lý',
      key: 'status',
      render: (_: any, record: CustomerGroupData) => {
        let color = 'green';
        if (record.hasPending) color = 'volcano';
        else if (record.orders.some((o) => o.status === 'confirmed')) color = 'blue';

        return (
          <Tag color={color} className={`font-extrabold text-xs ${record.hasPending ? 'animate-pulse' : ''}`}>
            {record.overallStatusText}
          </Tag>
        );
      },
    },
    {
      title: 'Thao Tác Hỏa Tốc',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, record: CustomerGroupData) => (
        <div className="flex items-center justify-end gap-1.5">
          <a
            href={`https://zalo.me/${record.phone}`}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
            title="Tư vấn Zalo hỏa tốc"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Zalo</span>
          </a>

          <button
            onClick={() => openOrderDetail(record.latestOrder)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all text-xs cursor-pointer"
          >
            Xem ({record.ordersCount}) Đơn
          </button>

          <Popconfirm
            title="Xóa tất cả đơn?"
            description={`Bạn có chắc muốn xóa tất cả đơn báo giá của [${record.customerName}]?`}
            onConfirm={() => requestDeleteCustomerGroup(record.phone, record.customerName)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <button
              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-all text-xs cursor-pointer"
              title="Xóa tất cả đơn thuộc SĐT này"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // AntD Columns for Single Orders List View
  const columnsSingleOrders = [
    {
      title: 'Mã Đơn Báo Giá',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (code: string) => <Tag color="magenta" className="font-mono font-bold text-xs">{code}</Tag>,
    },
    {
      title: 'Khách Hàng & SĐT',
      key: 'customer',
      sorter: (a: OrderData, b: OrderData) => a.customerName.localeCompare(b.customerName),
      render: (_: any, record: OrderData) => (
        <div className="w-full">
          <div className="flex items-center justify-between gap-2">
            <span className="font-extrabold text-slate-900 text-xs truncate">{record.customerName}</span>
            <Tag color={record.customerBadgeText.includes('VIP') ? 'gold' : 'default'} className="m-0 text-[10px] shrink-0">
              {record.customerBadgeText}
            </Tag>
          </div>
          <a
            href={`tel:${record.phone}`}
            className="text-red-600 hover:underline font-extrabold flex items-center gap-1 mt-0.5 text-xs"
          >
            <PhoneCall className="w-3 h-3" />
            {record.phone}
          </a>
        </div>
      ),
    },
    {
      title: 'Chi Tiết Phụ Tùng Yêu Cầu',
      key: 'parts',
      render: (_: any, record: OrderData) => (
        <div className="max-w-xs">
          <div className="font-bold text-slate-800 line-clamp-1">
            {record.parts.map((p) => `${p.name} (x${p.qty})`).join(', ')}
          </div>
          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
            Ghi chú: {record.notes}
          </div>
        </div>
      ),
    },
    {
      title: 'Thời Gian Gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: OrderData, b: OrderData) => new Date(b.rawCreatedAt).getTime() - new Date(a.rawCreatedAt).getTime(),
      render: (date: string) => <span className="text-slate-600 font-mono text-xs">{date}</span>,
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      render: (_: any, record: OrderData) => (
        <Select
          value={record.status}
          onChange={(val) => handleQuickStatusChange(record.id, val)}
          size="small"
          className="w-36"
          options={[
            { value: 'pending', label: <Tag color="volcano">MỚI GỬI</Tag> },
            { value: 'confirmed', label: <Tag color="blue">ĐÃ XÁC NHẬN</Tag> },
            { value: 'completed', label: <Tag color="green">HOÀN THÀNH</Tag> },
            { value: 'cancelled', label: <Tag color="default">ĐÃ HỦY</Tag> },
          ]}
        />
      ),
    },
    {
      title: 'Thao Tác Hỏa Tốc',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, record: OrderData) => (
        <div className="flex items-center justify-end gap-1.5">
          <a
            href={`https://zalo.me/${record.phone}`}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
            title="Tư vấn Zalo hỏa tốc"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Zalo</span>
          </a>

          <button
            onClick={() => handleOpenEditModal(record)}
            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold transition-all text-xs cursor-pointer"
            title="Sửa thông tin đơn"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>

          <Popconfirm
            title="Xóa đơn báo giá?"
            description={`Bạn có chắc chắn muốn xóa đơn ${record.orderCode}?`}
            onConfirm={() => requestDeleteOrder(record.id, record.orderCode)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <button
              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-all text-xs cursor-pointer"
              title="Xóa đơn này"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Popconfirm>

          <button
            onClick={() => openOrderDetail(record)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all text-xs cursor-pointer"
          >
            Chi Tiết
          </button>
        </div>
      ),
    },
  ];

  // Expandable Render for Customer Groups
  const expandedCustomerGroupRender = (record: CustomerGroupData) => {
    const columnsInner = [
      {
        title: 'Mã Đơn',
        dataIndex: 'orderCode',
        key: 'orderCode',
        render: (c: string) => <Tag color="magenta" className="font-mono font-bold text-xs">{c}</Tag>,
      },
      { title: 'Thời Gian Gửi', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => <span className="font-mono text-xs text-slate-600">{d}</span> },
      {
        title: 'Linh Kiện Yêu Cầu',
        key: 'parts',
        render: (_: any, r: OrderData) => (
          <span className="font-medium text-xs text-slate-800">
            {r.parts.map((p) => `${p.name} (x${p.qty})`).join(', ')}
          </span>
        ),
      },
      {
        title: 'Trạng Thái',
        dataIndex: 'statusText',
        key: 'statusText',
        render: (t: string, r: OrderData) => (
          <Tag color={r.status === 'pending' ? 'volcano' : r.status === 'completed' ? 'green' : 'blue'} className="font-bold text-xs">
            {t}
          </Tag>
        ),
      },
      {
        title: 'Thao Tác',
        key: 'action',
        render: (_: any, r: OrderData) => (
          <button onClick={() => openOrderDetail(r)} className="text-xs font-bold text-red-600 hover:underline cursor-pointer">
            Xem chi tiết
          </button>
        ),
      },
    ];

    return (
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <h5 className="font-extrabold text-xs text-slate-800 flex items-center gap-2">
          <Package className="w-4 h-4 text-red-600" />
          <span>Danh sách tất cả các đơn của khách hàng [{record.customerName}]:</span>
        </h5>
        <Table
          columns={columnsInner}
          dataSource={record.orders}
          rowKey="id"
          pagination={false}
          size="small"
          bordered
        />
      </div>
    );
  };

  // Expandable Render for Single Orders
  const expandedSingleOrderRender = (record: OrderData) => {
    const columnsParts = [
      { title: 'Mã Linh Kiện (SKU)', dataIndex: 'sku', key: 'sku', render: (s: string) => <span className="font-mono font-bold text-red-600 text-xs">{s}</span> },
      { title: 'Tên Phụ Tùng', dataIndex: 'name', key: 'name', render: (n: string) => <span className="font-bold text-slate-900 text-xs">{n}</span> },
      { title: 'Số Lượng', dataIndex: 'qty', key: 'qty', render: (q: number) => <Tag color="blue" className="font-bold text-xs">x{q}</Tag> },
      { title: 'Đơn Giá / Báo Giá', dataIndex: 'price', key: 'price', render: (p: string) => <span className="font-bold text-emerald-600 text-xs">{p}</span> },
    ];

    return (
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <h5 className="font-extrabold text-xs text-slate-800 flex items-center gap-2">
          <Package className="w-4 h-4 text-red-600" />
          <span>Danh sách linh kiện thuộc đơn [{record.orderCode}]:</span>
        </h5>
        <Table
          columns={columnsParts}
          dataSource={record.parts}
          rowKey="sku"
          pagination={false}
          size="small"
          bordered
        />
      </div>
    );
  };

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
              Quản lý và xử lý các yêu cầu tư vấn báo giá linh kiện phụ tùng xe tải từ khách hàng.
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
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
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

        {/* ENTERPRISE ANT DESIGN DATA TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-2">
          {groupByCustomer ? (
            <Table
              columns={columnsCustomerGroup}
              dataSource={customerGroups}
              rowKey="phone"
              loading={loading}
              expandable={{
                expandedRowRender: expandedCustomerGroupRender,
                expandRowByClick: true,
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total, range) => `${range[0]}-${range[1]} / Tổng ${total} khách hàng`,
              }}
              scroll={{ x: 'max-content' }}
              size="middle"
            />
          ) : (
            <Table
              columns={columnsSingleOrders}
              dataSource={filteredOrders}
              rowKey="id"
              loading={loading}
              expandable={{
                expandedRowRender: expandedSingleOrderRender,
                expandRowByClick: true,
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total, range) => `${range[0]}-${range[1]} / Tổng ${total} đơn báo giá`,
              }}
              scroll={{ x: 'max-content' }}
              size="middle"
            />
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

              {/* Navigation Tabs (Chi Tiết Đơn vs Lịch Sử Khách Hàng) */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs">
                <button
                  onClick={() => setActiveTab('detail')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'detail'
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Chi Tiết Đơn Hiện Tại</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Lịch Sử Mua Hàng ({customerHistory.length} đơn)</span>
                </button>
              </div>

              {/* TAB 1: CHI TIẾT ĐƠN HIỆN TẠI */}
              {activeTab === 'detail' && (
                <div className="space-y-4">
                  {/* Customer Info Card */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">{selectedOrder.customerName}</span>
                      <a
                        href={`tel:${selectedOrder.phone}`}
                        className="text-red-600 font-extrabold flex items-center gap-1 hover:underline text-xs"
                      >
                        <PhoneCall className="w-3 h-3" />
                        {selectedOrder.phone}
                      </a>
                    </div>
                    {selectedOrder.companyName && (
                      <p className="text-slate-600 font-medium">Công ty: {selectedOrder.companyName}</p>
                    )}
                    {selectedOrder.email && (
                      <p className="text-slate-500 font-medium">Email: {selectedOrder.email}</p>
                    )}
                    {selectedOrder.notes && (
                      <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700 text-xs mt-1">
                        <span className="font-bold text-slate-900 block">Ghi chú của khách:</span>
                        {selectedOrder.notes}
                      </div>
                    )}
                  </div>

                  {/* Requested Parts Table */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-red-600" />
                      Danh Sách Phụ Tùng Khách Yêu Cầu Báo Giá
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-2.5 pl-3">Tên Phụ Tùng / Mã</th>
                            <th className="p-2.5 text-center">Số Lượng</th>
                            <th className="p-2.5 text-right pr-3">Đơn Giá Tham Khảo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedOrder.parts.map((p, idx) => (
                            <tr key={`part-detail-${idx}`} className="hover:bg-slate-50">
                              <td className="p-2.5 pl-3">
                                <div className="font-bold text-slate-900">{p.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">Mã: {p.sku}</div>
                              </td>
                              <td className="p-2.5 text-center font-bold text-slate-800">x{p.qty}</td>
                              <td className="p-2.5 text-right pr-3 font-extrabold text-red-600">{p.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 text-xs block">
                      Thay Đổi Trạng Thái Xử Lý Đơn Báo Giá:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        disabled={updatingStatus}
                        onClick={() => handleQuickStatusChange(selectedOrder.id, 'pending')}
                        className={`py-2 px-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          selectedOrder.status === 'pending'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Mới Gửi</span>
                      </button>

                      <button
                        type="button"
                        disabled={updatingStatus}
                        onClick={() => handleQuickStatusChange(selectedOrder.id, 'confirmed')}
                        className={`py-2 px-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          selectedOrder.status === 'confirmed'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Đã Xác Nhận</span>
                      </button>

                      <button
                        type="button"
                        disabled={updatingStatus}
                        onClick={() => handleQuickStatusChange(selectedOrder.id, 'completed')}
                        className={`py-2 px-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          selectedOrder.status === 'completed'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Hoàn Thành</span>
                      </button>

                      <button
                        type="button"
                        disabled={updatingStatus}
                        onClick={() => handleQuickStatusChange(selectedOrder.id, 'cancelled')}
                        className={`py-2 px-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          selectedOrder.status === 'cancelled'
                            ? 'bg-slate-700 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Hủy Đơn</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LỊCH SỬ MUA HÀNG CỦA KHÁCH HÀNG */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-blue-900 block">Lịch Sử Yêu Cầu Báo Giá</span>
                      <span className="text-blue-700">SĐT: {selectedOrder.phone} - Khách: {selectedOrder.customerName}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-extrabold">
                      {customerHistory.length} Đơn Trong CSDL
                    </span>
                  </div>

                  {loadingHistory ? (
                    <div className="p-8 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                      <p className="text-xs font-bold">Đang tải lịch sử mua hàng từ PostgreSQL...</p>
                    </div>
                  ) : customerHistory.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl text-xs font-medium">
                      Chưa có lịch sử đơn hàng khác cho số điện thoại này.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {customerHistory.map((hOrd) => (
                        <div key={`hist-${hOrd.id}`} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold font-mono text-red-600">{hOrd.orderCode}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(hOrd.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <div className="font-medium text-slate-700">
                            Linh kiện: {(hOrd.items || []).map((i: any) => `${i.productName} (x${i.quantity})`).join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href={`https://zalo.me/${selectedOrder.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Zalo Báo Giá Ngay</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  Đóng Modal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CREATE NEW QUOTATION ORDER MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-red-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">Tạo Đơn Báo Giá Thủ Công</h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center flex-shrink-0 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tên Khách Hàng (*)</label>
                    <input
                      type="text"
                      required
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      placeholder="VD: Anh Tuấn Xe Tải"
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-900 bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Số Điện Thoại (*)</label>
                    <input
                      type="text"
                      required
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      placeholder="VD: 0903588167"
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-red-600 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tên Công Ty / Nhà Xe</label>
                    <input
                      type="text"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      placeholder="VD: Công ty Vận Tải Đà Nẵng"
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-900 bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email (Tùy chọn)</label>
                    <input
                      type="email"
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                      placeholder="khachhang@gmail.com"
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-900 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ghi Chú Yêu Cầu Báo Giá</label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Ghi chú về dòng xe (HOWO 371, Weichai WP12...)"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-900 bg-slate-50 focus:bg-white"
                  ></textarea>
                </div>

                {/* Parts List Section */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">Danh Sách Phụ Tùng Cần Báo Giá:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setNewParts((prev) => [
                          ...prev,
                          { productName: '', partNumber: '', quantity: 1, unitPrice: 0, itemNote: '' },
                        ])
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-red-600" />
                      <span>Thêm Dòng</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {newParts.map((part, pIdx) => (
                      <div
                        key={`new-part-row-${pIdx}`}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2"
                      >
                        <input
                          type="text"
                          required
                          value={part.productName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewParts((prev) =>
                              prev.map((item, idx) => (idx === pIdx ? { ...item, productName: val } : item))
                            );
                          }}
                          placeholder="Tên phụ tùng (VD: Bơm cao áp HOWO)"
                          className="flex-1 p-2 border border-slate-200 rounded-lg font-bold text-slate-900 bg-white text-xs"
                        />

                        <input
                          type="text"
                          value={part.partNumber}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewParts((prev) =>
                              prev.map((item, idx) => (idx === pIdx ? { ...item, partNumber: val } : item))
                            );
                          }}
                          placeholder="Mã SKU (Tùy chọn)"
                          className="w-full sm:w-28 p-2 border border-slate-200 rounded-lg font-mono text-slate-700 bg-white text-xs"
                        />

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[11px] font-bold text-slate-500">SL:</span>
                          <input
                            type="number"
                            min={1}
                            value={part.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 1;
                              setNewParts((prev) =>
                                prev.map((item, idx) => (idx === pIdx ? { ...item, quantity: val } : item))
                              );
                            }}
                            className="w-16 p-2 border border-slate-200 rounded-lg font-bold text-slate-900 bg-white text-xs text-center"
                          />

                          {newParts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setNewParts((prev) => prev.filter((_, idx) => idx !== pIdx))}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Đơn Báo Giá</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT ORDER MODAL */}
        {isEditModalOpen && editingOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-amber-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">Chỉnh Sửa Đơn {editingOrder.orderCode}</h3>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center flex-shrink-0 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEditOrder} className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên Khách Hàng</label>
                  <input
                    type="text"
                    required
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-900 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-red-600 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trạng Thái Đơn Báo Giá</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-900 bg-white"
                  >
                    <option value="pending">Mới Gửi (Chờ Báo Giá)</option>
                    <option value="confirmed">Đã Xác Nhận</option>
                    <option value="completed">Hoàn Thành</option>
                    <option value="cancelled">Đã Hủy</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-sm cursor-pointer"
                  >
                    Cập Nhật Đơn
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TOAST NOTIFICATION */}
        <ToastNotification toast={toastState} onClose={() => setToastState(null)} />
      </div>
    </ConfigProvider>
  );
}
