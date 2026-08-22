'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Sliders,
  ImageIcon,
  FileText,
  Newspaper,
  Users,
  Briefcase,
  Settings,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  X,
  FolderKanban,
  ShoppingBag,
  Megaphone,
  Cog,
} from 'lucide-react';
import { useAdminSidebar } from './AdminSidebarContext';
import { useAdminNotification } from '@/context/AdminNotificationContext';

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  badge: string | null;
  badgeColor?: string;
}

interface MenuSection {
  groupTitle: string;
  groupIcon: any;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    groupTitle: 'TỔNG QUAN',
    groupIcon: LayoutDashboard,
    items: [
      {
        name: 'Dashboard Tổng Quan',
        href: '/admin',
        icon: LayoutDashboard,
        badge: null,
      },
    ],
  },
  {
    groupTitle: 'SẢN PHẨM & KHO HÀNG',
    groupIcon: FolderKanban,
    items: [
      {
        name: 'Quản Lý Sản Phẩm',
        href: '/admin/products',
        icon: Package,
        badge: '10k+',
      },
      {
        name: 'Danh Mục Phụ Tùng',
        href: '/admin/categories',
        icon: Layers,
        badge: null,
      },
    ],
  },
  {
    groupTitle: 'KINH DOANH & KHÁCH HÀNG',
    groupIcon: ShoppingBag,
    items: [
      {
        name: 'Yêu Cầu Báo Giá',
        href: '/admin/orders',
        icon: FileText,
        badge: '18 Mới',
        badgeColor: 'bg-red-500 text-white animate-pulse',
      },
      {
        name: 'Quản Lý Khách Hàng',
        href: '/admin/customers',
        icon: Users,
        badge: null,
      },
    ],
  },
  {
    groupTitle: 'BANNER & SLIDE',
    groupIcon: Megaphone,
    items: [
      {
        name: 'Slide Banner Đầu Trang',
        href: '/admin/hero-slides',
        icon: Sliders,
        badge: null,
      },
      {
        name: 'Banner Quảng Cáo Trang Chủ',
        href: '/admin/category-banners',
        icon: ImageIcon,
        badge: null,
      },
    ],
  },
  {
    groupTitle: 'NỘI DUNG & HỆ THỐNG',
    groupIcon: Cog,
    items: [
      {
        name: 'Tin Tức & Kỹ Thuật',
        href: '/admin/news',
        icon: Newspaper,
        badge: null,
      },
      {
        name: 'Quản Lý Tuyển Dụng',
        href: '/admin/careers',
        icon: Briefcase,
        badge: null,
      },
      {
        name: 'Cấu Hình Hệ Thống',
        href: '/admin/settings',
        icon: Settings,
        badge: null,
      },
    ],
  },
];

function SidebarInner({ onNavItemClick }: { onNavItemClick?: () => void }) {
  const pathname = usePathname();
  const { unreadNotificationsCount, totalProductsCount } = useAdminNotification();

  // Accordion State: Manage open/close for each section group (All open by default for optimal UX)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    MENU_SECTIONS.forEach((sec) => {
      initial[sec.groupTitle] = true;
    });
    return initial;
  });

  // Auto expand group when navigating to a sub-route
  useEffect(() => {
    MENU_SECTIONS.forEach((sec) => {
      const hasActive = sec.items.some(
        (item) => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
      );
      if (hasActive) {
        setOpenGroups((prev) => ({ ...prev, [sec.groupTitle]: true }));
      }
    });
  }, [pathname]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="flex flex-col h-full text-slate-300 overflow-hidden">
      {/* Top Section: Brand Logo */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900 z-10">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white p-1 shadow-md flex-shrink-0">
            <Image
              src="/images/logo/logonen.png"
              alt="Logo Phụ Tùng Ô Tô Q.BA"
              fill
              sizes="36px"
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
            <p className="text-[10px] text-slate-400 font-medium">Hệ Thống Quản Trị Phụ Tùng</p>
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

      {/* Accordion Collapsible Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2 text-xs scrollbar-thin scrollbar-thumb-slate-800">
        {MENU_SECTIONS.map((section) => {
          const isOpen = !!openGroups[section.groupTitle];
          const SectionIcon = section.groupIcon;
          const hasActiveItem = section.items.some(
            (item) => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          );

          return (
            <div key={section.groupTitle} className="rounded-xl overflow-hidden">
              {/* Interactive Section Header Toggle Button */}
              <button
                type="button"
                onClick={() => toggleGroup(section.groupTitle)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-bold text-left cursor-pointer group ${
                  hasActiveItem && !isOpen
                    ? 'bg-slate-800/90 text-red-400 border border-red-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <SectionIcon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      hasActiveItem ? 'text-red-500' : 'text-slate-400 group-hover:text-red-400'
                    }`}
                  />
                  <span className="text-[11px] font-black uppercase tracking-wider truncate">
                    {section.groupTitle}
                  </span>
                </div>

                <div className="flex items-center shrink-0">
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-red-500' : 'text-slate-500'
                    }`}
                  />
                </div>
              </button>

              {/* Sub-Items Collapsible Container */}
              {isOpen && (
                <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-red-500/30 ml-4 my-1 transition-all">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                    const displayBadge = item.href === '/admin/orders'
                      ? (unreadNotificationsCount > 0 ? `${unreadNotificationsCount} Mới` : null)
                      : item.href === '/admin/products'
                      ? (totalProductsCount > 0 ? `${totalProductsCount} SP` : null)
                      : item.badge;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => onNavItemClick?.()}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/40 font-bold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 shrink-0 ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-400'
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {displayBadge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                item.badgeColor ||
                                (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700')
                              }`}
                            >
                              {displayBadge}
                            </span>
                          )}
                          {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-90" />}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
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
