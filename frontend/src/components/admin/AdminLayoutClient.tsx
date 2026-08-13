"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { AdminSidebarProvider } from "@/components/admin/AdminSidebarContext";
import { AdminNotificationProvider } from "@/context/AdminNotificationContext";
import { API_BASE_URL } from "@/config/api";
import { secureStorage } from "@/utils/secureStorage";
import { ShieldAlert } from "lucide-react";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = async () => {
      const token = secureStorage.getItem("quyba_admin_token");
      
      if (!token) {
        setIsAuthenticated(false);
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("Token hết hạn hoặc không hợp lệ");
        }

        setIsAuthenticated(true);
      } catch (err) {
        secureStorage.removeItem("quyba_admin_token");
        secureStorage.removeItem("quyba_admin_user");
        setIsAuthenticated(false);
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    if (mounted) {
      checkAuth();
    }
  }, [pathname, isLoginPage, router, mounted]);

  // Prevent SSR mismatch during initial hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans" suppressHydrationWarning>
        <div className="p-4 bg-brand/10 border border-brand/30 rounded-2xl mb-4" suppressHydrationWarning>
          <ShieldAlert size={40} className="text-brand animate-bounce" suppressHydrationWarning />
        </div>
        <h2 className="text-xl font-black uppercase tracking-wider text-slate-100" suppressHydrationWarning>
          Đang Tải Giao Diện Quản Trị Q.BA...
        </h2>
      </div>
    );
  }

  // Nếu là trang Login thì render thẳng trang Login
  if (isLoginPage) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  // Đang kiểm tra token hoặc bị CHẶN do chưa đăng nhập (TUYỆT ĐỐI KHÔNG RENDER CHILDREN)
  if (isAuthenticated !== true) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans selection:bg-brand selection:text-white" suppressHydrationWarning>
        <div className="p-4 bg-brand/10 border border-brand/30 rounded-2xl mb-4 shadow-[0_0_30px_rgba(217,4,41,0.25)]" suppressHydrationWarning>
          <ShieldAlert size={40} className="text-brand animate-bounce" suppressHydrationWarning />
        </div>
        <h2 className="text-xl font-black uppercase tracking-wider text-slate-100" suppressHydrationWarning>
          Yêu Cầu Đăng Nhập Quản Trị
        </h2>
        <p className="text-slate-400 text-xs mt-1 font-medium animate-pulse" suppressHydrationWarning>
          Đang kiểm tra bảo mật & chuyển hướng đến trang đăng nhập...
        </p>
      </div>
    );
  }

  // Đã đăng nhập hợp lệ -> Render Giao diện Quản trị
  return (
    <AdminNotificationProvider>
      <AdminSidebarProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased relative overflow-x-hidden" suppressHydrationWarning>
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0 w-full" suppressHydrationWarning>
            <AdminHeader />
            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto" suppressHydrationWarning>
              {children}
            </main>
          </div>
        </div>
      </AdminSidebarProvider>
    </AdminNotificationProvider>
  );
}
