import Link from 'next/link';
import { ArrowLeft, Search, ShieldAlert, PhoneCall } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-50 text-red-600 border border-red-200/60 shadow-inner">
          <ShieldAlert className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="text-red-600 font-extrabold text-sm uppercase tracking-widest block font-mono">
            LỖI 404 - KHÔNG TÌM THẤY TRANG
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mã Phụ Tùng Hoặc Trang Bạn Tìm Không Tồn Tại
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Đường dẫn có thể đã bị thay đổi hoặc phụ tùng này vừa được nạp vào kho Q.BA Đà Nẵng với mã Part No. mới.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Tra Cứu 10,000+ Phụ Tùng</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Trang Chủ Q.BA</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>Cần hỗ trợ tra mã VIN hỏa tốc?</span>
          <a
            href="tel:0903588167"
            className="font-bold text-red-600 hover:underline inline-flex items-center gap-1"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Hotline 0903.588.167</span>
          </a>
        </div>
      </div>
    </div>
  );
}
