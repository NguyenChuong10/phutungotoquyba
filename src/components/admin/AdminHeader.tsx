'use client';

import { useState } from 'react';
import { Search, Bell, Plus, RefreshCw, PhoneCall } from 'lucide-react';


export default function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left: Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tra cứu nhanh Part No, SKU, Tên phụ tùng hoặc SĐT khách hàng..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>
      </div>

      {/* Right: Actions & Info */}
      <div className="flex items-center gap-3">
        {/* Real-time Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Kho Đà Nẵng: Hoạt động 24/7</span>
        </div>

        {/* Quick Hotline direct CTA */}
        <a
          href="tel:0903588167"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all"
        >
          <PhoneCall className="w-3.5 h-3.5 text-red-600" />
          <span>Hotline: 0903.588.167</span>
        </a>

        {/* Notification Bell */}
        <div className="relative">
          <button
            title="Thông báo"
            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-bounce">
              3
            </span>
          </button>
        </div>

        {/* Refresh System Data */}
        <button
          title="Nạp lại dữ liệu"
          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Primary CTA: Add New Product */}
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold shadow-sm shadow-red-600/30 transition-all cursor-pointer">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Thêm Phụ Tùng Mới</span>
        </button>
      </div>
    </header>
  );
}
