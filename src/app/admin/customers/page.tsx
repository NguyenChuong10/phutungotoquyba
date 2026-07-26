'use client';

import { useState } from 'react';
import {
  Search,
  PhoneCall,
  MessageSquare,
  MapPin,
  Download,
} from 'lucide-react';


const CUSTOMERS_MOCK = [
  {
    id: 'KH-001',
    name: 'Gara Ô Tô Minh Phát (Đà Nẵng)',
    contactPerson: 'Anh Trần Minh Phát',
    phone: '0905.888.999',
    email: 'garaminhphat.dn@gmail.com',
    location: 'Q. Thanh Khê, Đà Nẵng',
    type: 'Gara Sửa Chữa',
    typeBadge: 'bg-purple-100 text-purple-800 border-purple-200',
    totalOrders: 14,
    totalSpent: '142,500,000 ₫',
  },
  {
    id: 'KH-002',
    name: 'Công Ty Vận Tải Hoàng Hà',
    contactPerson: 'Chị Hoàng Thị Thu',
    phone: '0983.123.456',
    email: 'contact@hoanghatransport.vn',
    location: 'KCN Hòa Khánh, Đà Nẵng',
    type: 'Đội Xe Vận Tải',
    typeBadge: 'bg-blue-100 text-blue-800 border-blue-200',
    totalOrders: 28,
    totalSpent: '380,000,000 ₫',
  },
  {
    id: 'KH-003',
    name: 'Đội Xe Công Trình Núi Thành',
    contactPerson: 'Anh Đỗ Văn Nam',
    phone: '0903.111.222',
    email: 'nam.nuithanh@gmail.com',
    location: 'Núi Thành, Quảng Nam',
    type: 'Đội Xe Vận Tải',
    typeBadge: 'bg-blue-100 text-blue-800 border-blue-200',
    totalOrders: 8,
    totalSpent: '95,000,000 ₫',
  },
  {
    id: 'KH-004',
    name: 'Phụ Tùng Ô Tô Hùng Cường (Quảng Ngãi)',
    contactPerson: 'Anh Ngô Hùng Cường',
    phone: '0914.555.777',
    email: 'hungcuong.qn@gmail.com',
    location: 'TP. Quảng Ngãi',
    type: 'Đại Lý Cấp 2 / Khách Sỉ',
    typeBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    totalOrders: 42,
    totalSpent: '620,000,000 ₫',
  },
];

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const filteredCustomers = CUSTOMERS_MOCK.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    const matchesType = selectedType === 'ALL' || c.type.includes(selectedType);
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Quản Lý Khách Hàng Doanh Nghiệp & Gara
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
              450+ Gara & Đội Xe Hợp Tác
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Danh sách đối tác Gara sửa chữa, công ty vận tải & đại lý phụ tùng xe tải Trung Quốc khu vực Miền Trung.
          </p>
        </div>

        <button
          onClick={() => alert('Đã tải danh sách khách hàng ra file Excel!')}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Xuất File Excel</span>
        </button>
      </div>

      {/* Toolbar Search & Type Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Tên Gara, Người liên hệ hoặc SĐT..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="ALL">Tất cả nhóm khách</option>
            <option value="Gara">Gara Sửa Chữa</option>
            <option value="Vận Tải">Đội Xe Vận Tải</option>
            <option value="Khách Sỉ">Đại Lý / Khách Sỉ</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3.5 pl-5">Mã KH & Tên Doanh Nghiệp</th>
                <th className="p-3.5">Người Đại Diện & SĐT</th>
                <th className="p-3.5">Khu Vực</th>
                <th className="p-3.5">Phân Loại Nhóm</th>
                <th className="p-3.5">Tổng Yêu Cầu</th>
                <th className="p-3.5 pr-5 text-right">Liên Hệ Nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 pl-5">
                    <div className="font-bold text-slate-900 text-sm">{customer.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Mã: {customer.id} • {customer.email}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-bold text-slate-800">{customer.contactPerson}</div>
                    <a
                      href={`tel:${customer.phone.replace(/\./g, '')}`}
                      className="text-red-600 hover:underline font-semibold flex items-center gap-1 mt-0.5"
                    >
                      <PhoneCall className="w-3 h-3" />
                      {customer.phone}
                    </a>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{customer.location}</span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${customer.typeBadge}`}
                    >
                      {customer.type}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="font-extrabold text-slate-900">{customer.totalOrders} đơn báo giá</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                      Doanh số: {customer.totalSpent}
                    </div>
                  </td>

                  <td className="p-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`https://zalo.me/${customer.phone.replace(/\./g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                        title="Mở Zalo tư vấn"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`tel:${customer.phone.replace(/\./g, '')}`}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                        title="Gọi trực tiếp"
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
      </div>
    </div>
  );
}
