'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
} from 'lucide-react';


const NEWS_MOCK = [
  {
    id: 1,
    title: 'Hướng dẫn nhận biết phụ tùng HOWO chính hãng Sinotruk 2026',
    slug: 'huong-dan-nhan-biet-phu-tung-howo-chinh-hang',
    category: 'Kỹ Thuật',
    author: 'Kỹ sư Q.BA',
    views: 1240,
    status: 'ĐÃ XUẤT BẢN',
    createdAt: '24/07/2026',
    thumbnail: '/images/news-section/news-1.png',
  },
  {
    id: 2,
    title: 'Quy trình bảo dưỡng động cơ Weichai WP12 định kỳ 50.000km',
    slug: 'quy-trinh-bao-duong-dong-co-weichai-wp12',
    category: 'Bảo Dưỡng',
    author: 'Admin Q.BA',
    views: 890,
    status: 'ĐÃ XUẤT BẢN',
    createdAt: '20/07/2026',
    thumbnail: '/images/news-section/news-2.png',
  },
  {
    id: 3,
    title: 'Cách tra mã VIN số khung xe tải Trung Quốc để tìm mã linh kiện chuẩn 100%',
    slug: 'huong-dan-tra-ma-vin-so-khung-xe-tai-trung-quoc',
    category: 'Mẹo Hay',
    author: 'Chuyên gia Q.BA',
    views: 2150,
    status: 'ĐÃ XUẤT BẢN',
    createdAt: '15/07/2026',
    thumbnail: '/images/news-section/news-3.png',
  },
  {
    id: 4,
    title: 'Xu hướng thị trường phụ tùng xe tải Miền Trung năm 2026',
    slug: 'xu-huong-thi-truong-phu-tung-xe-tai-mien-trung-2026',
    category: 'Thị Trường',
    author: 'Ban Biên Tập Q.BA',
    views: 450,
    status: 'BẢN NHÁP',
    createdAt: '10/07/2026',
    thumbnail: '/images/news-section/news-1.png',
  },
];

export default function AdminNewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredNews = NEWS_MOCK.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Quản Lý Tin Tức & Cẩm Nang Kỹ Thuật
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
              24 Bài Viết SEO
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Biên tập bài viết cẩm nang xe tải, quy trình bảo dưỡng & kinh nghiệm tra mã phụ tùng Q.BA.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Viết Bài Kỹ Thuật Mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bài viết theo tiêu đề hoặc danh mục..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>
      </div>

      {/* Main Data Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Mobile Card List View (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredNews.map((article) => (
            <div key={article.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-16 h-12 rounded-lg bg-slate-100 border border-slate-200 relative overflow-hidden flex-shrink-0">
                  <Image
                    src={article.thumbnail}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[10px]">
                      {article.category}
                    </span>
                    {article.status === 'ĐÃ XUẤT BẢN' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Đã xuất bản
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Bản nháp
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs mt-1.5 line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="text-[11px] text-slate-400">
                  <span>{article.author}</span> • <span className="font-semibold text-slate-600">{article.views.toLocaleString()} lượt xem</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/news/${article.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem</span>
                  </Link>

                  <button
                    onClick={() => alert(`Chỉnh sửa bài viết: ${article.title}`)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>

                  <button
                    onClick={() => alert(`Xoá bài viết ${article.id}?`)}
                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-bold text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xoá</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Data Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3.5 pl-5">Hình Ảnh</th>
                <th className="p-3.5">Tiêu Đề Bài Viết</th>
                <th className="p-3.5">Danh Mục</th>
                <th className="p-3.5">Tác Giả</th>
                <th className="p-3.5">Lượt Xem</th>
                <th className="p-3.5">Trạng Thái</th>
                <th className="p-3.5 pr-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNews.map((article) => (
                <tr key={article.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 pl-5">
                    <div className="w-14 h-10 rounded-lg bg-slate-100 border border-slate-200 relative overflow-hidden flex-shrink-0">
                      <Image
                        src={article.thumbnail}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>

                  <td className="p-3.5 max-w-sm">
                    <div className="font-bold text-slate-900 line-clamp-1">{article.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Slug: /{article.slug}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
                      {article.category}
                    </span>
                  </td>

                  <td className="p-3.5 text-slate-700 font-medium">{article.author}</td>

                  <td className="p-3.5 font-bold text-slate-900">{article.views.toLocaleString()} lượt</td>

                  <td className="p-3.5">
                    {article.status === 'ĐÃ XUẤT BẢN' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Đã xuất bản
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Bản nháp
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/news/${article.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                        title="Xem bài public"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => alert(`Chỉnh sửa bài viết: ${article.title}`)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                        title="Sửa"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => alert(`Xoá bài viết ${article.id}?`)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                        title="Xoá"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Article Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Soạn Thảo Bài Viết Kỹ Thuật Mới</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu Đề Bài Viết (*)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hướng dẫn thay thế lọc dầu động cơ Weichai..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Danh Mục Bài Viết</label>
                  <select className="w-full p-2.5 border border-slate-200 rounded-lg bg-white">
                    <option>Cẩm Nang Kỹ Thuật</option>
                    <option>Bảo Dưỡng Xe Tải</option>
                    <option>Mẹo Tra Mã VIN</option>
                    <option>Tin Tức Q.BA</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tác Giả</label>
                  <input
                    type="text"
                    defaultValue="Admin Q.BA"
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tóm Tắt Ngắn (SEO Description)</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả tóm tắt 2-3 câu hiển thị trên Google..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  alert('Đã xuất bản bài viết mới thành công!');
                  setShowAddModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold text-xs shadow-md"
              >
                Xuất Bản Bài Viết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
