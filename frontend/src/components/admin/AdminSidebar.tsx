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
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAdminSidebar } from './AdminSidebarContext';
import { useAdminNotification } from '@/context/AdminNotificationContext';

const MENU_ITEMS = [
  {
    name: 'Tổng Quan Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Quản Lý Sản Phẩm',
    href: '/admin/products',
    icon: Package,
    badge: '10k+',
  },
  {
    name: 'Danh Mục & Thương Hiệu',
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

function SidebarInner({ onNavItemClick }: { onNavItemClick?: () => void }) {
  const pathname = usePathname();
  const { unreadNotificationsCount, totalProductsCount } = useAdminNotification();

  return (
    <div className="flex flex-col justify-between h-full text-slate-300">
      {/* Top Section: Brand Logo */}
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white p-1 shadow-md flex-shrink-0">
              <Image
                src="/images/logo/logonen.png"
                alt="Logo Phụ Tùng Ô Tô Q.BA"
                fill
                sizes="40px"
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

          {onNavItemClick && (
            <button
              onClick={onNavItemClick}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              aria-label="Đóng Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 mt-2">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Quản Lý Hệ Thống
          </p>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            const displayBadge = item.href === '/admin/orders'
              ? (unreadNotificationsCount > 0 ? `${unreadNotificationsCount} Mới` : null)
              : item.href === '/admin/products'
              ? (totalProductsCount > 0 ? `${totalProductsCount} Kho` : null)
              : item.badge;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onNavItemClick?.()}
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
                  {displayBadge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.badgeColor ||
                        (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400')
                      }`}
                    >
                      {displayBadge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const { isMobileOpen, closeMobileSidebar } = useAdminSidebar();

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-800 flex-col h-full z-30 transition-all flex-shrink-0">
        <SidebarInner />
      </aside>

      {/* Mobile Off-Canvas Sidebar Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={closeMobileSidebar}
          />

          {/* Drawer Menu Container */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-left duration-300">
            <SidebarInner onNavItemClick={closeMobileSidebar} />
          </aside>
        </div>
      )}
    </>
  );
}
