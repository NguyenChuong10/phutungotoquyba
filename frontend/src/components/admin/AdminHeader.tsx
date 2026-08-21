'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Plus, Menu, LogOut, UserCheck, Volume2, CheckCheck, FileText, ChevronRight } from 'lucide-react';
import { useAdminSidebar } from './AdminSidebarContext';
import { useAdminNotification } from '@/context/AdminNotificationContext';
import { secureStorage } from '@/utils/secureStorage';

export default function AdminHeader() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ fullName: string; role: string; email: string } | null>(null);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { toggleMobileSidebar } = useAdminSidebar();
  const {
    unreadNotificationsCount,
    notifications,
    playChimeSound,
    markAllAsRead,
  } = useAdminNotification();

  useEffect(() => {
    const userData = secureStorage.getItem('quyba_admin_user');
    if (userData) {
      setAdminUser(userData);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    secureStorage.removeItem('quyba_admin_token');
    secureStorage.removeItem('quyba_admin_user');
    router.push('/admin/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left: Mobile Toggle */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-red-600 hover:bg-slate-100 transition-all flex-shrink-0 cursor-pointer"
          aria-label="Mở Menu Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Actions & Info */}
      <div className="flex items-center gap-1.5 sm:gap-3 ml-2 flex-shrink-0">
        {/* Admin User Badge */}
        {adminUser && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
            <UserCheck size={15} className="text-red-600 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="font-bold text-slate-900 leading-tight">{adminUser.fullName}</span>
              <span className="text-[10px] text-red-600 uppercase tracking-wider font-extrabold">{adminUser.role}</span>
            </div>
          </div>
        )}

        {/* Sound Test / Unblock Button */}
        <button
          onClick={playChimeSound}
          title="Bấm để phát thử âm thanh chuông báo giá mới"
          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Volume2 className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Thử Chuông Báo</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotificationsDropdown((prev) => !prev)}
            title="Thông báo báo giá mới"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs animate-bounce">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Container */}
          {showNotificationsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-red-500" />
                  <span className="font-extrabold text-xs">THÔNG BÁO BÁO GIÁ MỚI</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                      {unreadNotificationsCount} mới
                    </span>
                  )}
                </div>

                <button
                  onClick={playChimeSound}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Bấm để thử phát âm thanh chuông báo"
                >
                  <Volume2 className="w-3 h-3 text-emerald-400" />
                  <span>Thử Chuông</span>
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 space-y-1">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-600 text-xs">Chưa có thông báo báo giá mới</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <Link
                      key={item.id}
                      href="/admin/orders"
                      onClick={() => setShowNotificationsDropdown(false)}
                      className={`p-3.5 block transition-colors ${
                        !item.isRead ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{item.time}</span>
                      </div>
                      <p className="text-slate-600 text-xs mt-1 leading-relaxed">{item.message}</p>
                    </Link>
                  ))
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-slate-600 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Đánh dấu đã đọc
                </button>

                <Link
                  href="/admin/orders"
                  onClick={() => setShowNotificationsDropdown(false)}
                  className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-0.5"
                >
                  Xem tất cả đơn ➔
                </Link>
              </div>
            </div>
          )}
        </div>



        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Đăng xuất khỏi hệ thống"
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-bold transition-all border border-slate-200 hover:border-red-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden lg:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
