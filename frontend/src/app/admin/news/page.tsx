'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ToastNotification, { ToastMessage } from '@/components/ui/ToastNotification';
import { Table, Tag as AntTag, ConfigProvider, Tooltip, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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
  Layers,
  ExternalLink,
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

  // 1. Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await AdminApiService.getNewsCategories();
      if (res.ok && Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        setCategories([
          { id: 1, name: 'Cẩm Nang Kỹ Thuật', slug: 'cam-nang-ky-thuat' },
          { id: 2, name: 'Bảo Dưỡng Xe Tải', slug: 'bao-duong-xe-tai' },
          { id: 3, name: 'Mẹo Tra Mã VIN', slug: 'tra-ma-vin' },
          { id: 4, name: 'Tin Tức Q.BA', slug: 'tin-tuc-quy-ba' },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 2. Fetch News Articles List
  const fetchNewsList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminApiService.getNewsList({
        search: searchQuery.trim() !== '' ? searchQuery : undefined,
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

  // Delete Category Prompt
  const handleDeleteCategory = (cat: CategoryItem) => {
    setDeleteConfirmState({
      isOpen: true,
      type: 'category',
      id: cat.id,
      title: cat.name,
      loading: false,
    });
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingArticle(null);
    setTitle('');
    setCategorySlug('cam-nang-ky-thuat');
    setContent('');
    setThumbnailUrl('/images/logo/logonen.png');
    setIsFeatured(false);
    setSections([
      { id: 'sec-1', heading: 'Bước 1: Kiểm tra tổng thể', imageUrl: '', bodyText: '' }
    ]);
    setShowArticleModal(true);
  };

  // Helper to parse content and extract section builder blocks
  const parseContentAndSections = (fullContent: string) => {
    if (!fullContent) return { mainContent: '', parsedSections: [] };

    const sectionRegex = /<div class="my-10 space-y-4">([\s\S]*?)<\/div>/gi;
    const parsedSections: ArticleSectionItem[] = [];
    let sectionIndex = 0;

    let match;
    while ((match = sectionRegex.exec(fullContent)) !== null) {
      const blockHtml = match[1];

      let heading = '';
      const spanHeadingMatch = blockHtml.match(/<h2[^>]*>[\s\S]*?<span>([^<]+)<\/span>\s*<\/h2>/i);
      if (spanHeadingMatch) {
        heading = spanHeadingMatch[1].trim();
      } else {
        const h2Match = blockHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
        if (h2Match) {
          heading = h2Match[1].replace(/<[^>]*>?/gm, '').trim();
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

    const mainContent = fullContent.replace(/<div class="my-10 space-y-4">[\s\S]*?<\/div>/gi, '').trim();

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
      const uploadedUrl = res.data?.imageUrl || res.url || res.data?.url;
      if (res.ok && uploadedUrl) {
        setThumbnailUrl(uploadedUrl);
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

  // Handle Section Image Upload
  const handleSectionImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await AdminApiService.uploadImage(file);
      const uploadedUrl = res.data?.imageUrl || res.url || res.data?.url;
      if (res.ok && uploadedUrl) {
        setSections((prev) =>
          prev.map((sec) => (sec.id === id ? { ...sec, imageUrl: uploadedUrl } : sec))
        );
      } else {
        alert(res.message || 'Lỗi khi upload ảnh bước');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Article (Create or Edit)
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalContent = content.trim();

    // Compile section builder blocks if present (Q.BA Technical Step Layout)
    if (sections.length > 0) {
      const compiledHtml = sections
        .filter((sec) => sec.heading.trim() || sec.imageUrl.trim() || sec.bodyText.trim())
        .map(
          (sec, idx) => `
<div class="my-10 space-y-4">
  ${sec.heading ? `<h2 class="text-xl sm:text-2xl font-black text-slate-900 uppercase font-heading flex items-center gap-3 pt-6 border-t border-slate-200"><span class="w-8 h-8 rounded-xl bg-[#D90429] text-white text-xs font-black flex items-center justify-center shadow-sm shrink-0 font-mono">${idx + 1}</span><span>${sec.heading}</span></h2>` : ''}
  ${sec.imageUrl ? `<img src="${sec.imageUrl}" alt="${sec.heading || 'Phụ tùng Q.BA'}" class="rounded-2xl w-full max-h-[500px] object-cover my-4 shadow-sm border border-slate-200/90" />` : ''}
  ${sec.bodyText ? `<p class="text-slate-700 text-base md:text-lg leading-relaxed whitespace-pre-line my-4 font-normal">${sec.bodyText}</p>` : ''}
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
            message: `Đã xóa danh mục "${deleteConfirmState.title}" khỏi hệ thống!`,
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

  // Define Ant Design Table Columns with Balanced Cell Padding
  const columns: ColumnsType<NewsArticleItem> = [
    {
      title: 'Hình Bìa',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnailUrl',
      width: 140,
      className: '!pl-6 !pr-4',
      render: (src: string | null, record: NewsArticleItem) => (
        <div className="w-16 h-11 rounded-lg bg-slate-100 border border-slate-200 relative overflow-hidden flex-shrink-0 shadow-2xs my-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src || '/images/news-section/news-1.png'}
            alt={record.title}
            className="w-full h-full object-cover"
          />
        </div>
      ),
    },
    {
      title: 'Tiêu Đề & Slug',
      dataIndex: 'title',
      key: 'title',
      width: 360,
      className: '!px-4',
      render: (text: string, record: NewsArticleItem) => (
        <div className="space-y-1 max-w-md py-1">
          <div className="font-extrabold text-slate-900 text-xs line-clamp-2 leading-relaxed">
            {text}
          </div>
          <div className="text-[10px] text-slate-400 font-mono truncate">
            Slug: /{record.slug}
          </div>
        </div>
      ),
    },
    {
      title: 'Danh Mục',
      dataIndex: 'categorySlug',
      key: 'categorySlug',
      width: 180,
      className: '!px-4',
      render: (catSlug: string) => {
        const catName = categories.find((c) => c.slug === catSlug)?.name || CATEGORIES_MAP[catSlug] || catSlug;
        return (
          <span className="px-3 py-1.5 rounded-full bg-slate-100 font-extrabold text-slate-700 text-[10px] border border-slate-200 inline-block whitespace-nowrap shadow-2xs">
            {catName}
          </span>
        );
      },
    },
    {
      title: 'Tác Giả',
      dataIndex: 'author',
      key: 'author',
      width: 160,
      className: '!px-4',
      render: (author?: { fullName: string }) => (
        <span className="font-bold text-slate-700 text-xs whitespace-nowrap">
          {author?.fullName || 'Ban Quản Lý Q.BA'}
        </span>
      ),
    },
    {
      title: 'Lượt Xem',
      dataIndex: 'views',
      key: 'views',
      width: 100,
      className: '!px-4',
      sorter: (a, b) => a.views - b.views,
      render: (views: number) => (
        <span className="inline-flex items-center gap-1.5 font-mono font-extrabold text-slate-900 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60 whitespace-nowrap">
          <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{(views || 0).toLocaleString()}</span>
          <span className="text-[10px] font-normal text-slate-400">lượt</span>
        </span>
      ),
    },
    {
      title: 'Nổi Bật',
      dataIndex: 'isFeatured',
      key: 'isFeatured',
      width: 100,
      className: '!px-4',
      render: (featured: boolean) => (
        featured ? (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-300 shadow-2xs whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
            Nổi Bật
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium whitespace-nowrap">
            Bình thường
          </span>
        )
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 160,
      align: 'right',
      className: '!pl-4 !pr-6',
      render: (_: any, record: NewsArticleItem) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/news/${record.slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
            title="Xem bài công khai trên website"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={`/admin/news/editor?id=${record.id}`}
            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title="Chỉnh sửa bài viết (Trình soạn thảo toàn màn hình)"
          >
            <Edit className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => handleDeleteArticle(record)}
            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
            title="Xóa bài viết"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#dc2626',
          borderRadius: 12,
          fontFamily: 'var(--font-inter), sans-serif',
        },
        components: {
          Table: {
            cellPaddingBlock: 16,
            cellPaddingInline: 24,
            headerBg: '#f8fafc',
            headerColor: '#334155',
          },
        },
      }}
    >
      <div className="space-y-6 pb-12 w-full max-w-full overflow-x-hidden">
        {/* Header Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full">
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

            <Link
              href="/admin/news/editor"
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Viết Bài Kỹ Thuật Mới</span>
            </Link>
          </div>
        </div>

        {/* Ant Design Toolbar Search & Category Dropdown Select */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full max-w-full">
          <div className="flex-1 max-w-md w-full">
            <Input.Search
              placeholder="Tìm bài viết theo tiêu đề hoặc nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={(val) => setSearchQuery(val)}
              allowClear
              enterButton
              size="middle"
              className="w-full font-medium"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-extrabold text-slate-500 whitespace-nowrap">Danh Mục:</span>
            <Select
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              size="middle"
              className="min-w-[200px] sm:min-w-[240px] font-bold text-xs"
              options={[
                { label: 'Tất Cả Danh Mục', value: 'all' },
                ...categories.map((cat) => ({
                  label: cat.name,
                  value: cat.slug,
                })),
              ]}
            />
          </div>
        </div>

        {/* Responsive Ant Design Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden w-full max-w-full">
          <Table<NewsArticleItem>
            columns={columns}
            dataSource={articles}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1280 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              className: '!px-6 !my-4',
              showTotal: (total, range) => (
                <span className="text-xs text-slate-500">
                  Hiển thị <strong className="text-slate-900">{range[0]}-{range[1]}</strong> trên tổng <strong className="text-slate-900">{total}</strong> bài viết
                </span>
              ),
            }}
            locale={{
              emptyText: (
                <div className="p-12 text-center space-y-2 bg-slate-50">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-sm">Chưa có bài viết phù hợp</h4>
                  <p className="text-xs text-slate-400">Không tìm thấy bài viết nào theo điều kiện tìm kiếm.</p>
                </div>
              ),
            }}
            size="middle"
            rowClassName={() => 'hover:bg-slate-50/80 transition-colors'}
          />
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailUrl || '/images/news-section/news-1.png'}
                        alt="Thumbnail Preview"
                        className="w-full h-full object-cover"
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
                      <p className="text-[10px] text-slate-400 mt-1">Khuyến nghị tỉ lệ 16:9, kích thước dưới 2MB</p>
                    </div>
                  </div>
                </div>

                {/* Main Excerpt Content */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đoạn Mở Đầu / Tóm Tắt Kỹ Thuật (Lead Summary)</label>
                  <textarea
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập nội dung tổng quan mở đầu bài viết..."
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
                  />
                </div>

                {/* SECTION BUILDER (SOẠN BÀI VIẾT THEO CÁC BƯỚC / PHẦN KỸ THUẬT) */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-red-600" />
                        <span>Các Bước / Phần Kỹ Thuật Chi Tiết (Section Builder)</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">Tự động dựng bài báo chuẩn SEO kèm ảnh từng bước</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white font-extrabold text-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm Bước</span>
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
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Xóa bước này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Tiêu Đề Bước (*)</label>
                          <input
                            type="text"
                            value={sec.heading}
                            onChange={(e) => handleUpdateSection(sec.id, 'heading', e.target.value)}
                            placeholder={`Ví dụ: Bước ${idx + 1}: Tháo xả dầu cũ và kiểm tra mạt kim loại...`}
                            className="w-full p-2 border border-slate-200 rounded-lg font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Ảnh Minh Họa Bước</label>
                          <div className="flex items-center gap-3">
                            {sec.imageUrl ? (
                              <div className="w-20 h-12 rounded-lg border border-slate-200 bg-slate-100 relative overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={sec.imageUrl} alt="Section Image" className="w-full h-full object-cover" />
                              </div>
                            ) : null}

                            <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer hover:bg-slate-100 transition-all flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5 text-red-600" />
                              <span>{sec.imageUrl ? 'Thay Ảnh' : 'Tải Ảnh Bước'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSectionImageUpload(sec.id, e)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Nội Dung Chi Tiết Bước</label>
                          <textarea
                            rows={3}
                            value={sec.bodyText}
                            onChange={(e) => handleUpdateSection(sec.id, 'bodyText', e.target.value)}
                            placeholder="Mô tả các lưu ý kỹ thuật, công cụ cần chuẩn bị khi thao tác bước này..."
                            className="w-full p-2 border border-slate-200 rounded-lg font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowArticleModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs shadow-md shadow-red-900/30 hover:bg-red-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang Xuất Bản...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{editingArticle ? 'Lưu Thay Đổi' : 'Xuất Bản Bài Viết'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CATEGORY MANAGER MODAL */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Tag className="w-4 h-4 text-red-600" />
                  <span>Quản Lý Danh Mục Bài Viết</span>
                </h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Add New Category Form */}
              <form onSubmit={handleCreateCategory} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Tên danh mục mới (VD: Kinh Nghiệm Lái Xe)..."
                  className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
                <button
                  type="submit"
                  disabled={categorySubmitting || !newCategoryName.trim()}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  Thêm
                </button>
              </form>

              {/* Existing Categories List */}
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {categories.map((cat) => (
                  <div
                    key={`cat-item-${cat.id}`}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    {editingCategory?.id === cat.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className="flex-1 p-1.5 border border-slate-300 rounded-lg font-bold text-slate-900"
                        />
                        <button
                          onClick={() => handleUpdateCategory(cat.id)}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-700 cursor-pointer"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="px-2.5 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-300 cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="font-extrabold text-slate-900">{cat.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Slug: /{cat.slug}</div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setEditingCategoryName(cat.name);
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                            title="Chỉnh sửa danh mục"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
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
            </div>
          </div>
        )}

        {/* Global Toast Notification */}
        {toastState && (
          <ToastNotification
            toast={toastState}
            onClose={() => setToastState(null)}
          />
        )}

        {/* Global Red Glassmorphic Confirm Modal */}
        <ConfirmModal
          isOpen={deleteConfirmState.isOpen}
          title={deleteConfirmState.type === 'category' ? 'Xác Nhận Xóa Danh Mục' : 'Xác Nhận Xóa Bài Viết'}
          message={
            deleteConfirmState.type === 'category'
              ? 'Bạn có chắc chắn muốn xóa danh mục bài viết này không?'
              : 'Bạn có chắc chắn muốn xóa bài viết kỹ thuật này khỏi hệ thống không?'
          }
          itemName={deleteConfirmState.title}
          confirmText="Xác Nhận Xóa"
          cancelText="Hủy Bỏ"
          type="danger"
          isLoading={deleteConfirmState.loading}
          onConfirm={executeDelete}
          onCancel={() => setDeleteConfirmState({ isOpen: false, type: 'article', id: null, title: '', loading: false })}
        />
      </div>
    </ConfigProvider>
  );
}
