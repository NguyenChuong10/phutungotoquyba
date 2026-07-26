'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  FileText,
  Newspaper,
  Users,
  Settings,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const MENU_ITEMS = [
  {
    name: 'Tổng Quan Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Quản Lý Phụ Tùng',
    href: '/admin/products',
    icon: Package,
    badge: '10k+',
  },
  {
    name: 'Danh Mục & Dòng Xe',
    href: '/admin/categories',
    icon: Layers,
    badge: null,
  },
  {
    name: 'Yêu Cầu Báo Giá',
    href: '/admin/orders',
    icon: FileText,
    badge: '18 Mới',
    badgeColor: 'bg-red-500 text-white animate-pulse',
  },
  {
    name: 'Tin Tức & Kỹ Thuật',
    href: '/admin/news',
    icon: Newspaper,
    badge: null,
  },
  {
    name: 'Khách Hàng',
    href: '/admin/customers',
    icon: Users,
    badge: null,
  },
  {
    name: 'Cấu Hình Hệ Thống',
    href: '/admin/settings',
    icon: Settings,
    badge: null,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between h-screen sticky top-0 z-30 transition-all">
      {/* Top Section: Brand Logo */}
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white p-1 shadow-md flex-shrink-0">
            <Image
              src="/images/logo/logo-quy-ba.jpg"
              alt="Logo Phụ Tùng Ô Tô Q.BA"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white tracking-wider text-sm">
                Q.BA <span className="text-red-500">ADMIN</span>
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Hệ Thống Quản Trị Phụ Tùng</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 mt-2">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Quản Lý Hệ Thống
          </p>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: User Info & Back to Site */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-bold text-white shadow-md text-sm">
            QB
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">Ban Quản Lý Q.BA</p>
            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Đang hoạt động
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-700/60"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về trang chủ Q.BA</span>
        </Link>
      </div>
    </aside>
  );
}
