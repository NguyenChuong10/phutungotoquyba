'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ToastNotification, { ToastMessage } from '@/components/ui/ToastNotification';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2,
  Upload,
  Sparkles,
  FileText,
  Star,
  Lightbulb,
  Tag,
} from 'lucide-react';
import { AdminApiService } from '@/services/adminApiService';

interface NewsArticleItem {
  id: number;
  title: string;
  slug: string;
  categorySlug: string;
  content: string;
  thumbnailUrl: string | null;
  views: number;
  isFeatured: boolean;
  publishedAt: string;
  createdAt: string;
  author?: {
    id: number;
    fullName: string;
  };
}

interface ArticleSectionItem {
  id: string;
  heading: string;
  imageUrl: string;
  bodyText: string;
}

const CATEGORIES_MAP: Record<string, string> = {
  'cam-nang-ky-thuat': 'Cẩm Nang Kỹ Thuật',
  'bao-duong-xe-tai': 'Bảo Dưỡng Xe Tải',
  'tra-ma-vin': 'Mẹo Tra Mã VIN',
  'tin-tuc-quy-ba': 'Tin Tức Q.BA',
};

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticleItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Category Manager Modal States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  // Add / Edit Modal States
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticleItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [categorySlug, setCategorySlug] = useState('cam-nang-ky-thuat');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Section Builder Fields (Khối Bài Viết Nhiều Phần: Ảnh + Nội Dung)
  const [sections, setSections] = useState<ArticleSectionItem[]>([]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Confirm Delete & Toast State
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    type: 'article' | 'category';
    id: number | null;
    title: string;
    loading: boolean;
  }>({
    isOpen: false,
    type: 'article',
    id: null,
    title: '',
    loading: false,
  });

  const [toastState, setToastState] = useState<ToastMessage | null>(null);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await AdminApiService.getNewsCategories();
      if (res.ok && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCategorySubmitting(true);
    try {
      const res = await AdminApiService.createNewsCategory(newCategoryName.trim());
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Tạo Danh Mục Thành Công',
          message: `Đã thêm danh mục mới "${newCategoryName}"!`,
        });
        setNewCategoryName('');
        fetchCategories();
      } else {
        alert(res.message || 'Lỗi khi tạo danh mục');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCategorySubmitting(false);
    }
  };

  // Update Category
  const handleUpdateCategory = async (id: number) => {
    if (!editingCategoryName.trim()) return;
    setCategorySubmitting(true);
    try {
      const res = await AdminApiService.updateNewsCategory(id, editingCategoryName.trim());
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Cập Nhật Danh Mục Thành Công',
          message: `Đã cập nhật danh mục thành "${editingCategoryName}"!`,
        });
        setEditingCategory(null);
        fetchCategories();
      } else {
        alert(res.message || 'Lỗi khi sửa danh mục');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCategorySubmitting(false);
    }
  };

  // Delete Category Prompt (Uses Custom Red Glassmorphic ConfirmModal)
  const handleDeleteCategory = (cat: CategoryItem) => {
    setDeleteConfirmState({
      isOpen: true,
      type: 'category',
      id: cat.id,
      title: cat.name,
      loading: false,
    });
  };

  const fetchNewsList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminApiService.getNewsList({
        search: searchQuery,
        categorySlug: selectedCategory !== 'all' ? selectedCategory : undefined,
      });
      if (res.ok && res.data) {
        setArticles(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch news list:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchNewsList();
  }, [fetchNewsList]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingArticle(null);
    setTitle('');
    setCategorySlug('cam-nang-ky-thuat');
    setContent('');
    setThumbnailUrl('/images/news-section/news-1.png');
    setIsFeatured(false);
    setSections([]);
    setShowArticleModal(true);
  };

  // Helper to parse content and extract section builder blocks
  const parseContentAndSections = (fullContent: string) => {
    if (!fullContent) return { mainContent: '', parsedSections: [] };

    const sectionRegex = /<div class="p-6 bg-slate-50[^"]*">([\s\S]*?)<\/div>/gi;
    const parsedSections: ArticleSectionItem[] = [];
    let sectionIndex = 0;

    let match;
    while ((match = sectionRegex.exec(fullContent)) !== null) {
      const blockHtml = match[1];

      let heading = '';
      const spanHeadingMatch = blockHtml.match(/<h3[^>]*>[\s\S]*?<span>([^<]+)<\/span>\s*<\/h3>/i);
      if (spanHeadingMatch) {
        heading = spanHeadingMatch[1].trim();
      } else {
        const h3Match = blockHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
        if (h3Match) {
          heading = h3Match[1].replace(/<[^>]*>?/gm, '').trim();
        }
      }

      let imageUrl = '';
      const imgMatch = blockHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }

      let bodyText = '';
      const pMatch = blockHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      if (pMatch) {
        bodyText = pMatch[1].replace(/<br\s*\/?>/gi, '\n').trim();
      }

      sectionIndex++;
      parsedSections.push({
        id: `sec-${Date.now()}-${sectionIndex}-${Math.random().toString(36).substring(2, 6)}`,
        heading: heading || `Bước ${sectionIndex}: `,
        imageUrl,
        bodyText,
      });
    }

    const mainContent = fullContent.replace(/<div class="p-6 bg-slate-50[^"]*">[\s\S]*?<\/div>/gi, '').trim();

    return { mainContent, parsedSections };
  };

  // Open Edit Modal
  const handleOpenEdit = (article: NewsArticleItem) => {
    setEditingArticle(article);
    setTitle(article.title);
    setCategorySlug(article.categorySlug || 'cam-nang-ky-thuat');
    setThumbnailUrl(article.thumbnailUrl || '/images/news-section/news-1.png');
    setIsFeatured(article.isFeatured);

    const { mainContent, parsedSections } = parseContentAndSections(article.content);
    setContent(mainContent);
    setSections(parsedSections);

    setShowArticleModal(true);
  };

  // Section Builder Operations
  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        heading: `Bước ${prev.length + 1}: `,
        imageUrl: '',
        bodyText: '',
      },
    ]);
  };

  const handleUpdateSection = (id: string, field: keyof ArticleSectionItem, val: string) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, [field]: val } : sec))
    );
  };

  const handleDeleteSection = (id: string) => {
    setSections((prev) => prev.filter((sec) => sec.id !== id));
  };

  // Handle Cover Image File Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await AdminApiService.uploadImage(file);
      if (res.ok && res.data?.imageUrl) {
        setThumbnailUrl(res.data.imageUrl);
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Upload Ảnh Bìa Thành Công',
          message: 'Đã tải ảnh bìa bài viết lên máy chủ Q.BA!',
        });
      } else {
        alert(res.message || 'Lỗi khi upload ảnh');
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Article (Create or Edit)
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalContent = content.trim();

    // Compile section builder blocks if present
    if (sections.length > 0) {
      const compiledHtml = sections
        .filter((sec) => sec.heading.trim() || sec.imageUrl.trim() || sec.bodyText.trim())
        .map(
          (sec, idx) => `
<div class="p-6 bg-slate-50 border border-slate-200/90 rounded-3xl space-y-4 my-6 shadow-sm">
  ${sec.heading ? `<h3 class="text-xl font-extrabold text-slate-900 flex items-center gap-2.5"><span class="w-7 h-7 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center shadow-xs flex-shrink-0">${idx + 1}</span><span>${sec.heading}</span></h3>` : ''}
  ${sec.imageUrl ? `<img src="${sec.imageUrl}" alt="${sec.heading || 'Phụ tùng Q.BA'}" class="rounded-2xl w-full max-h-[450px] object-cover shadow-md border border-slate-200" />` : ''}
  ${sec.bodyText ? `<p class="text-slate-700 leading-relaxed text-sm whitespace-pre-line">${sec.bodyText}</p>` : ''}
</div>`
        )
        .join('\n');

      finalContent = (content ? content.trim() + '\n\n' : '') + compiledHtml;
    }

    if (!title.trim() || !finalContent.trim()) {
      alert('Vui lòng điền đầy đủ Tiêu đề và Nội dung bài viết!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        categorySlug,
        content: finalContent,
        thumbnailUrl: thumbnailUrl || '/images/news-section/news-1.png',
        isFeatured,
      };

      if (editingArticle) {
        const res = await AdminApiService.updateNews(editingArticle.id, payload);
        if (res.ok) {
          setToastState({
            id: String(Date.now()),
            type: 'success',
            title: 'Cập Nhật Bài Viết Thành Công',
            message: `Đã cập nhật bài viết "${title}" thành công!`,
          });
          setShowArticleModal(false);
          fetchNewsList();
        } else {
          alert(res.message || 'Lỗi khi cập nhật bài viết');
        }
      } else {
        const res = await AdminApiService.createNews(payload);
        if (res.ok) {
          setToastState({
            id: String(Date.now()),
            type: 'success',
            title: 'Xuất Bản Thành Công',
            message: `Đã xuất bản bài viết kỹ thuật mới "${title}"!`,
          });
          setShowArticleModal(false);
          fetchNewsList();
        } else {
          alert(res.message || 'Lỗi khi tạo bài viết');
        }
      }
    } catch (err) {
      console.error('Failed to submit article:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Execute Delete (Supports both Articles and Categories)
  const handleDeleteArticle = (article: NewsArticleItem) => {
    setDeleteConfirmState({
      isOpen: true,
      type: 'article',
      id: article.id,
      title: article.title,
      loading: false,
    });
  };

  const executeDelete = async () => {
    if (!deleteConfirmState.id) return;
    setDeleteConfirmState((prev) => ({ ...prev, loading: true }));
    try {
      if (deleteConfirmState.type === 'category') {
        const res = await AdminApiService.deleteNewsCategory(deleteConfirmState.id);
        if (res.ok) {
          setToastState({
            id: String(Date.now()),
            type: 'success',
            title: 'Xóa Danh Mục Thành Công',
            message: `Đã xóa danh mục "${deleteConfirmState.title}" khỏi CSDL!`,
          });
          fetchCategories();
        } else {
          alert(res.message || 'Lỗi khi xóa danh mục');
        }
      } else {
        const res = await AdminApiService.deleteNews(deleteConfirmState.id);
        if (res.ok) {
          setToastState({
            id: String(Date.now()),
            type: 'success',
            title: 'Xóa Bài Viết Thành Công',
            message: `Đã xóa bài viết "${deleteConfirmState.title}" khỏi hệ thống tin tức!`,
          });
          fetchNewsList();
        } else {
          alert(res.message || 'Lỗi khi xóa bài viết');
        }
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleteConfirmState({ isOpen: false, type: 'article', id: null, title: '', loading: false });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Quản Lý Tin Tức & Cẩm Nang Kỹ Thuật Xe Tải
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
              {articles.length} Bài Viết Chuẩn SEO
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Soạn thảo cẩm nang kỹ thuật động cơ Weichai, kinh nghiệm bảo dưỡng hộp số Fast Gear & tra mã phụ tùng.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Tag className="w-4 h-4" />
            <span>Quản Lý Danh Mục</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Viết Bài Kỹ Thuật Mới</span>
          </button>
        </div>
      </div>

      {/* Toolbar Search & Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bài viết theo tiêu đề hoặc nội dung..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất Cả Danh Mục
          </button>
          {categories.map((cat) => (
            <button
              key={`cat-tab-${cat.id}`}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Data Container Table with Custom Scrollbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
            <p className="text-xs font-bold">Đang tải danh sách bài viết kỹ thuật từ CSDL...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center space-y-2 bg-slate-50">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">Chưa có bài viết phù hợp</h4>
            <p className="text-xs text-slate-400">Không tìm thấy bài viết nào theo điều kiện tìm kiếm.</p>
          </div>
        ) : (
          <div className="max-h-[580px] overflow-y-auto overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs shadow-2xs">
                <tr className="text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 pl-5">Hình Ảnh Bìa</th>
                  <th className="p-3.5">Tiêu Đề Bài Viết & Slug</th>
                  <th className="p-3.5">Danh Mục Bài Viết</th>
                  <th className="p-3.5">Tác Giả</th>
                  <th className="p-3.5">Lượt Xem</th>
                  <th className="p-3.5">Nổi Bật</th>
                  <th className="p-3.5 pr-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((article) => (
                  <tr key={`article-row-${article.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="w-16 h-11 rounded-lg bg-slate-100 border border-slate-200 relative overflow-hidden flex-shrink-0 shadow-2xs">
                        <Image
                          src={article.thumbnailUrl || '/images/news-section/news-1.png'}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>

                    <td className="p-3.5 max-w-sm">
                      <div className="font-extrabold text-slate-900 line-clamp-1 text-xs">
                        {article.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                        Slug: /{article.slug}
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 font-extrabold text-slate-700 text-[10px] border border-slate-200">
                        {categories.find((c) => c.slug === article.categorySlug)?.name || article.categorySlug}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-700 font-bold whitespace-nowrap">
                      {article.author?.fullName || 'Ban Quản Lý Q.BA'}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 font-mono font-extrabold text-slate-900 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60">
                        <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{article.views.toLocaleString()}</span>
                        <span className="text-[10px] font-normal text-slate-400">lượt</span>
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {article.isFeatured ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-300 shadow-2xs">
                          <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
                          Nổi Bật
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                          Bình thường
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/news/${article.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                          title="Xem bài công khai trên website"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleOpenEdit(article)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteArticle(article)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                          title="Xóa bài viết"
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
        )}

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Hiển thị <strong className="text-slate-900">{articles.length}</strong> bài viết cẩm nang kỹ thuật Q.BA
          </span>
          <span className="font-semibold text-slate-600 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{articles.filter((a) => a.isFeatured).length} Bài viết nổi bật</span>
          </span>
        </div>
      </div>

      {/* ADD / EDIT ARTICLE MODAL */}
      {showArticleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingArticle ? 'Chỉnh Sửa Bài Viết Kỹ Thuật' : 'Soạn Thảo Bài Viết Kỹ Thuật Mới'}
              </h3>
              <button
                onClick={() => setShowArticleModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center flex-shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitArticle} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu Đề Bài Viết (*)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Quy trình thay thế lọc dầu động cơ Weichai WP12 định kỳ..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Danh Mục Bài Viết</label>
                  <select
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
                  >
                    {categories.map((cat) => (
                      <option key={`opt-cat-${cat.id}`} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 font-extrabold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded-md focus:ring-red-500"
                    />
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Đặt làm Bài Viết Nổi Bật (Trang chủ)
                    </span>
                  </label>
                </div>
              </div>

              {/* Cover Image Upload Area */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ảnh Bìa Bài Viết (SEO Thumbnail)</label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 rounded-xl border border-slate-200 bg-slate-50 relative overflow-hidden flex-shrink-0">
                    <Image
                      src={thumbnailUrl || '/images/news-section/news-1.png'}
                      alt="Thumbnail Preview"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer transition-all border border-slate-200">
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      ) : (
                        <Upload className="w-4 h-4 text-red-600" />
                      )}
                      <span>{uploadingImage ? 'Đang upload ảnh...' : 'Tải Ảnh Bìa Từ Máy'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">Định dạng JPG, PNG, WEBP (Tối đa 5MB)</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Nội Dung Bài Viết Chi Tiết (*)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold border border-amber-200 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Mẹo: Có thể dán trực tiếp (Ctrl+V / Cmd+V) ảnh vào ô nội dung
                    </span>

                    <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-600 text-red-700 hover:text-white font-extrabold text-[11px] cursor-pointer transition-all border border-red-200">
                      <Upload className="w-3 h-3" />
                      <span>Chèn Ảnh Vào Nội Dung</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const res = await AdminApiService.uploadImage(file);
                            if (res.ok && res.data?.imageUrl) {
                              const imgTag = `<img src="${res.data.imageUrl}" alt="Phụ Tùng Xe Tải Q.BA" class="rounded-2xl my-4 shadow-md max-w-full" />`;
                              setContent((prev) => prev + '\n\n' + imgTag + '\n\n');
                              setToastState({
                                id: String(Date.now()),
                                type: 'success',
                                title: 'Chèn Ảnh Thành Công',
                                message: 'Đã tải và chèn thẻ ảnh mới vào nội dung bài viết!',
                              });
                            }
                          } catch (err) {
                            console.error('Failed to upload content image:', err);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <textarea
                  required
                  rows={9}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={async (e) => {
                    const items = e.clipboardData.items;
                    let imageFile: File | null = null;

                    for (let i = 0; i < items.length; i++) {
                      if (items[i].type.indexOf('image') !== -1) {
                        imageFile = items[i].getAsFile();
                        break;
                      }
                    }

                    if (imageFile) {
                      e.preventDefault();
                      setToastState({
                        id: String(Date.now()),
                        type: 'info',
                        title: 'Đang Tải Ảnh Vừa Dán (Paste)...',
                        message: 'Đang upload ảnh dán từ Clipboard lên máy chủ Q.BA...',
                      });

                      try {
                        const res = await AdminApiService.uploadImage(imageFile);
                        if (res.ok && res.data?.imageUrl) {
                          const imgTag = `<img src="${res.data.imageUrl}" alt="Phụ Tùng Xe Tải Q.BA" class="rounded-2xl my-4 shadow-md max-w-full" />`;
                          const textarea = e.currentTarget;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const newContent = content.substring(0, start) + '\n\n' + imgTag + '\n\n' + content.substring(end);
                          setContent(newContent);

                          setToastState({
                            id: String(Date.now()),
                            type: 'success',
                            title: 'Dán Ảnh Thành Công',
                            message: 'Đã tải ảnh dán từ Clipboard và chèn vào nội dung bài viết!',
                          });
                        }
                      } catch (err) {
                        console.error('Failed to upload pasted image:', err);
                      }
                    }
                  }}
                  placeholder="Nhập nội dung chia sẻ kỹ thuật, hướng dẫn bảo dưỡng, quy trình thay thế phụ tùng... (Có thể dán trực tiếp Ctrl+V ảnh tại đây!)"
                  className="w-full p-3 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-mono text-xs leading-relaxed"
                ></textarea>
              </div>

              {/* SECTION BUILDER: DỰNG CÁC PHẦN BÀI VIẾT (MỖI PHẦN CÓ ÁNH + TIÊU ĐỀ + MÔ TẢ) */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-extrabold text-slate-900 block text-xs">
                      🧩 Khối Bài Viết Nhiều Phần (Mỗi Bước/Phần Gồm: Ảnh minh họa + Tiêu đề + Mô tả)
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Tự động tạo các thẻ Bước 1, Bước 2... đẹp mắt trên website công khai.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>+ Thêm Bước Kỹ Thuật</span>
                  </button>
                </div>

                {sections.map((sec, idx) => (
                  <div key={sec.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="font-extrabold text-red-600 text-xs flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-black">
                          {idx + 1}
                        </span>
                        <span>Bước / Phần Kỹ Thuật #{idx + 1}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sec.id)}
                        className="text-red-600 hover:text-red-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa Bước Này</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Tiêu Đề Bước #{idx + 1}</label>
                        <input
                          type="text"
                          value={sec.heading}
                          onChange={(e) => handleUpdateSection(sec.id, 'heading', e.target.value)}
                          placeholder="Ví dụ: Bước 1: Tháo phớt git và xả dầu cũ..."
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Ảnh Minh Họa Cho Bước #{idx + 1}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={sec.imageUrl}
                            onChange={(e) => handleUpdateSection(sec.id, 'imageUrl', e.target.value)}
                            placeholder="Đường dẫn ảnh hoặc bấm Tải Ảnh..."
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
                          />
                          <label className="px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] cursor-pointer shrink-0">
                            <span>Tải Ảnh</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const res = await AdminApiService.uploadImage(file);
                                  if (res.ok && res.data?.imageUrl) {
                                    handleUpdateSection(sec.id, 'imageUrl', res.data.imageUrl);
                                    setToastState({
                                      id: String(Date.now()),
                                      type: 'success',
                                      title: 'Upload Ảnh Bước Thành Công',
                                      message: `Đã upload ảnh cho Bước #${idx + 1}!`,
                                    });
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Mô Tả Chi Tiết Cho Bước #{idx + 1}</label>
                      <textarea
                        rows={3}
                        value={sec.bodyText}
                        onChange={(e) => handleUpdateSection(sec.id, 'bodyText', e.target.value)}
                        placeholder="Mô tả chi tiết các thao tác kỹ thuật thực hiện trong bước này..."
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowArticleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingArticle ? 'Lưu Cập Nhật' : 'Xuất Bản Bài Viết'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL (CUSTOM RED GLASSMORPHIC DANGER MODAL) */}
      <ConfirmModal
        isOpen={deleteConfirmState.isOpen}
        title={deleteConfirmState.type === 'category' ? 'Xóa Danh Mục Bài Viết' : 'Xóa Bài Viết Kỹ Thuật'}
        message={
          deleteConfirmState.type === 'category'
            ? 'Bạn có chắc chắn muốn xóa danh mục này khỏi CSDL tin tức & cẩm nang Q.BA?'
            : 'Bạn có chắc chắn muốn xóa bài viết này khỏi hệ thống tin tức & cẩm nang Q.BA?'
        }
        itemName={deleteConfirmState.title}
        confirmText="Xác Nhận Xóa"
        cancelText="Hủy Bỏ"
        isLoading={deleteConfirmState.loading}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmState({ isOpen: false, type: 'article', id: null, title: '', loading: false })}
      />

      {/* CATEGORY MANAGER MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Quản Lý Danh Mục Bài Viết & Kỹ Thuật</h3>
                <p className="text-xs text-slate-500 mt-0.5">Thêm mới, sửa tên hoặc xóa các danh mục cẩm nang tin tức Q.BA</p>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Create Category Form */}
            <form onSubmit={handleCreateCategory} className="flex items-center gap-2">
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nhập tên danh mục mới (Ví dụ: Kinh Nghiệm Lái Xe)..."
                className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
              <button
                type="submit"
                disabled={categorySubmitting}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shrink-0 cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Mới</span>
              </button>
            </form>

            {/* Categories List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {categories.map((cat) => (
                <div key={`cat-item-${cat.id}`} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                  {editingCategory?.id === cat.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="flex-1 p-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateCategory(cat.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Slug: /{cat.slug}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(cat);
                            setEditingCategoryName(cat.name);
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold cursor-pointer"
                          title="Sửa tên danh mục"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-bold cursor-pointer"
                          title="Xóa danh mục"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Đóng Bảng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <ToastNotification toast={toastState} onClose={() => setToastState(null)} />
    </div>
  );
}
