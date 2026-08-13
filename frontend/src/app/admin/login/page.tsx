"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Sparkles, KeyRound } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { secureStorage } from "@/utils/secureStorage";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const existingToken = secureStorage.getItem("quyba_admin_token");
    if (existingToken) {
      router.push(redirectTarget);
    }
  }, [router, redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Đăng nhập không thành công");
      }

      // Lưu Token & Thông tin User ĐÃ ĐƯỢC MÃ HÓA qua secureStorage
      secureStorage.setItem("quyba_admin_token", data.data.accessToken);
      secureStorage.setItem("quyba_admin_user", data.data.user);

      setSuccessMsg("Đăng nhập thành công! Đang chuyển hướng...");
      
      setTimeout(() => {
        router.push(redirectTarget);
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể kết nối đến Máy chủ API");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-brand selection:text-white">
      {/* Radiant Background Art Gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-red-400/25 via-rose-300/20 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-amber-300/25 via-red-300/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-red-100/40 via-white to-amber-50/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 my-auto">
        
        {/* Brand Header & Shield Emblem */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand via-red-600 to-amber-500 p-0.5 shadow-xl shadow-brand/25 flex items-center justify-center transition-transform hover:scale-105 duration-300">
              <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-50 to-amber-50/50 opacity-70"></div>
                <ShieldCheck size={42} className="text-brand relative z-10 drop-shadow-md" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
            QUẢN TRỊ <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-red-600 to-rose-700">PHỤ TÙNG Q.BA</span>
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-100/70 border border-red-200 text-brand text-[11px] font-extrabold uppercase tracking-wider mt-2 shadow-xs">
            <Sparkles size={13} className="animate-spin text-brand" />
            <span>Hệ Thống Kho Phục Vụ 24/7 Đà Nẵng</span>
          </div>
        </div>

        {/* Glossy Light Glass Card */}
        <div className="bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-7 sm:p-9 shadow-[0_20px_60px_rgba(217,4,41,0.12)] relative transition-all duration-300">
          
          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
              <AlertCircle size={18} className="text-brand shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">Xác thực thất bại</p>
                <p className="mt-0.5 text-red-700 font-medium">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900">Xác thực thành công</p>
                <p className="mt-0.5 text-emerald-700 font-medium">{successMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Tài Khoản Email <span className="text-brand">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@quyba.vn"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Mật Khẩu Access <span className="text-brand">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Bảo mật SSL 256-bit</span>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Radiant Gradient Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-brand to-rose-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-[0_10px_25px_rgba(217,4,41,0.35)] hover:shadow-[0_15px_30px_rgba(217,4,41,0.45)] transition-all duration-300 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-3"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>ĐANG ĐĂNG NHẬP...</span>
                </>
              ) : (
                <>
                  <span>ĐĂNG NHẬP HỆ THỐNG Q.BA</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Back Link */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand font-semibold transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Trở về Trang chủ Bán Hàng Phụ Tùng Q.BA</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
      </div>
    }>
      <AdminLoginForm />
    </React.Suspense>
  );
}

