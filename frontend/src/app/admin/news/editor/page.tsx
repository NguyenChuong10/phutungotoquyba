'use client';

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ToastNotification, { ToastMessage } from '@/components/ui/ToastNotification';
import { ConfigProvider, Select, Switch, Tabs, Progress, Modal, DatePicker } from 'antd';
import dayjs from 'dayjs';
import localeVi from 'antd/locale/vi_VN';
import 'dayjs/locale/vi';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Upload,
  Sparkles,
  Eye,
  Layers,
  ArrowUp,
  ArrowDown,
  Tag,
  FileText,
  Search,
  Globe,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Lightbulb,
  BookOpen,
  Sliders,
  Check,
  AlertCircle,
  Copy,
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table,
  Link as LinkIcon,
  AlertTriangle,
  Monitor,
  Smartphone,
  TrendingUp,
  Wifi,
  Maximize2,
  Minimize2,
  Save,
  RotateCcw,
  HelpCircle,
  CheckSquare,
  PhoneCall,
  Clock,
} from 'lucide-react';
import { AdminApiService } from '@/services/adminApiService';
import { formatImageUrl } from '@/utils/imageHelper';
import ArticleContentRenderer from '@/components/public/ArticleContentRenderer';

interface ArticleSectionItem {
  id: string;
  heading: string;
  imageUrl: string;
  bodyText: string;
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function formatDateToLocalInput(dateInput?: string | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function NewsEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleIdParam = searchParams.get('id');

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(
    articleIdParam ? parseInt(articleIdParam, 10) : null
  );

  // Form States
  const [title, setTitle] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [categorySlug, setCategorySlug] = useState('cam-nang-ky-thuat');
  const [leadSummary, setLeadSummary] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('/images/logo/logonen.png');
  const [isFeatured, setIsFeatured] = useState(false);
  const [articleTags, setArticleTags] = useState<string[]>([]);
  const [publishedAt, setPublishedAt] = useState<string>('');
  const [publishType, setPublishType] = useState<'now' | 'scheduled'>('now');

  // Mode: 'freeform' | 'sections'
  const [editorMode, setEditorMode] = useState<'freeform' | 'sections'>('freeform');
  const [visualHtmlMode, setVisualHtmlMode] = useState<'visual' | 'code'>('visual');

  const [sections, setSections] = useState<ArticleSectionItem[]>([
    { id: 'sec-1', heading: 'Bước 1: Kiểm tra tổng thể', imageUrl: '', bodyText: '' },
  ]);

  const [activeTab, setActiveTab] = useState('content');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null);
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [toastState, setToastState] = useState<ToastMessage | null>(null);
  const [currentDomain, setCurrentDomain] = useState('phutungotoquyba.vn');
  const [modal, modalContextHolder] = Modal.useModal();

  // Enhanced Direct Writing & UX States
  const [isZenMode, setIsZenMode] = useState(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>('');
  const [hasUnsavedDraft, setHasUnsavedDraft] = useState(false);
  const [selectionBubble, setSelectionBubble] = useState<{
    visible: boolean;
    top: number;
    left: number;
  }>({ visible: false, top: 0, left: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  const zenEditorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRangeRef = useRef<Range | null>(null);
  const initialFormStateRef = useRef<string>('');
  const isUserEditedRef = useRef<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentDomain(window.location.hostname || 'phutungotoquyba.vn');
    }
  }, []);

  // Escape key shortcut to exit Zen Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  // Sync content state to editorRef without destroying active DOM nodes
  useEffect(() => {
    if (editorRef.current && visualHtmlMode === 'visual') {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [content, visualHtmlMode]);

  // Sync content state to zenEditorRef when Zen Mode is open
  useEffect(() => {
    if (zenEditorRef.current && isZenMode) {
      if (zenEditorRef.current.innerHTML !== content) {
        zenEditorRef.current.innerHTML = content;
      }
    }
  }, [content, isZenMode]);

  // Compute form snapshot for unsaved changes detection
  const getFormSnapshot = useCallback(() => {
    const liveBody = editorRef.current ? editorRef.current.innerHTML : content;
    return JSON.stringify({
      title: title.trim(),
      leadSummary: leadSummary.trim(),
      content: liveBody.trim(),
      categorySlug,
      thumbnailUrl,
      isFeatured,
      articleTags: Array.from(new Set(articleTags.map((t) => t.trim()))).sort(),
      customSlug: customSlug.trim(),
    });
  }, [title, leadSummary, content, categorySlug, thumbnailUrl, isFeatured, articleTags, customSlug]);

  // Compute compiled preview HTML for live rendering
  const finalPreviewContent = useMemo(() => {
    let body = content;
    if (editorMode === 'sections' && sections.length > 0) {
      const compiledHtml = sections
        .filter((sec) => sec.heading.trim() || sec.imageUrl.trim() || sec.bodyText.trim())
        .map(
          (sec, idx) => `
<div class="my-6 space-y-3">
  ${sec.heading ? `<h2 class="text-xl sm:text-2xl font-black text-slate-900 uppercase font-heading flex items-center gap-3 pt-6 border-t border-slate-200"><span class="w-8 h-8 rounded-xl bg-[#D90429] text-white text-xs font-black flex items-center justify-center shadow-sm shrink-0 font-mono">${idx + 1}</span><span>${sec.heading}</span></h2>` : ''}
  ${sec.imageUrl ? `<img src="${sec.imageUrl}" alt="${sec.heading || 'Phụ tùng Q.BA'}" class="rounded-2xl w-full max-h-[500px] object-cover my-4 shadow-sm border border-slate-200/90" />` : ''}
  ${sec.bodyText ? `<p class="text-slate-700 text-base md:text-lg leading-relaxed whitespace-pre-wrap my-4 font-normal">${sec.bodyText}</p>` : ''}
</div>`
        )
        .join('\n');
      body = (content ? content + '\n\n' : '') + compiledHtml;
    }
    return body;
  }, [content, editorMode, sections]);

  const isFormDirty = useCallback(() => {
    if (submitting || loadingArticle) return false;
    if (isUserEditedRef.current) return true;
    if (!initialFormStateRef.current) return false;
    return getFormSnapshot() !== initialFormStateRef.current;
  }, [submitting, loadingArticle, getFormSnapshot]);

  // Reset baseline initialization when switching editing article ID
  useEffect(() => {
    isInitializedRef.current = false;
    isUserEditedRef.current = false;
    initialFormStateRef.current = '';
  }, [editingArticleId]);

  // Save initial baseline snapshot ONLY ONCE after article finishes loading
  useEffect(() => {
    if (!loadingArticle && !isInitializedRef.current) {
      const timer = setTimeout(() => {
        const liveBody = editorRef.current ? editorRef.current.innerHTML : content;
        initialFormStateRef.current = JSON.stringify({
          title: title.trim(),
          leadSummary: leadSummary.trim(),
          content: liveBody.trim(),
          categorySlug,
          thumbnailUrl,
          isFeatured,
          articleTags: Array.from(new Set(articleTags.map((t) => t.trim()))).sort(),
          customSlug: customSlug.trim(),
        });
        isInitializedRef.current = true;
        isUserEditedRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loadingArticle, content, title, leadSummary, categorySlug, thumbnailUrl, isFeatured, articleTags, customSlug]);

  // Warn on browser tab close / refresh if form has unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty()) {
        e.preventDefault();
        e.returnValue = 'Bài viết chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang không?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty]);

  // Intercept Browser Native Back Button (popstate in Chrome/Edge navigation bar)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.history.pushState({ isEditor: true }, '', window.location.href);

    const handlePopState = () => {
      if (isFormDirty()) {
        window.history.pushState({ isEditor: true }, '', window.location.href);

        modal.confirm({
          title: 'Cảnh Báo: Bài Viết Chưa Được Lưu',
          content: 'Bạn đã thực hiện chỉnh sửa bài viết nhưng chưa lưu. Nếu rời khỏi đây, các thay đổi chưa lưu sẽ bị mất!',
          okText: 'Rời Khỏi Trang',
          cancelText: 'Ở Lại Tiếp Tục Sửa',
          okButtonProps: { className: 'bg-[#D90429] hover:bg-red-700 font-bold rounded-xl' },
          cancelButtonProps: { className: 'rounded-xl font-bold' },
          onOk() {
            isUserEditedRef.current = false;
            router.push('/admin/news');
          },
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isFormDirty, modal, router]);

  // In-app Back Button Confirmation Modal
  const handleBackWithConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFormDirty()) {
      modal.confirm({
        title: 'Cảnh Báo: Bài Viết Chưa Được Lưu',
        content: 'Bạn đã thực hiện chỉnh sửa bài viết nhưng chưa lưu. Nếu rời khỏi đây, các thay đổi chưa lưu sẽ bị mất!',
        okText: 'Rời Khỏi Trang',
        cancelText: 'Ở Lại Tiếp Tục Sửa',
        okButtonProps: { className: 'bg-[#D90429] hover:bg-red-700 font-bold rounded-xl' },
        cancelButtonProps: { className: 'rounded-xl font-bold' },
        onOk() {
          isUserEditedRef.current = false;
          router.push('/admin/news');
        },
      });
    } else {
      isUserEditedRef.current = false;
      router.push('/admin/news');
    }
  };

  // Track text selection inside visual editor to show Notion-style floating toolbar
  const handleEditorSelectionChange = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    const visualDiv = editorRef.current || document.querySelector('.article-rich-body[contenteditable="true"]');

    if (sel && !sel.isCollapsed && sel.rangeCount > 0 && visualDiv && visualDiv.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const parentRect = visualDiv.getBoundingClientRect();

      setSelectionBubble({
        visible: true,
        top: Math.max(10, rect.top - parentRect.top - 44),
        left: Math.min(parentRect.width - 240, Math.max(10, rect.left - parentRect.left + (rect.width / 2) - 120)),
      });
      savedSelectionRangeRef.current = range.cloneRange();
    } else {
      setSelectionBubble((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    }
  }, []);

  // Selection Event Listener
  useEffect(() => {
    const handleSelectionEvent = () => handleEditorSelectionChange();
    document.addEventListener('selectionchange', handleSelectionEvent);
    return () => document.removeEventListener('selectionchange', handleSelectionEvent);
  }, [handleEditorSelectionChange]);

  // Auto Save Draft to LocalStorage every 15 seconds if user made edits
  useEffect(() => {
    const timer = setInterval(() => {
      if (isUserEditedRef.current && (title.trim() || content.trim())) {
        const liveBody = editorRef.current ? editorRef.current.innerHTML : content;
        const draftObj = {
          title,
          leadSummary,
          content: liveBody,
          categorySlug,
          thumbnailUrl,
          articleTags,
          customSlug,
          savedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        localStorage.setItem('qba_news_editor_draft', JSON.stringify(draftObj));
        setLastAutoSaveTime(draftObj.savedAt);
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [title, leadSummary, content, categorySlug, thumbnailUrl, articleTags, customSlug]);

  // Check on mount if an unsaved draft exists in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !editingArticleId) {
      const saved = localStorage.getItem('qba_news_editor_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.title || parsed.content) {
            setHasUnsavedDraft(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [editingArticleId]);

  const handleRestoreDraft = () => {
    const saved = localStorage.getItem('qba_news_editor_draft');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.leadSummary) setLeadSummary(parsed.leadSummary);
      if (parsed.content) setContent(parsed.content);
      if (parsed.categorySlug) setCategorySlug(parsed.categorySlug);
      if (parsed.thumbnailUrl) setThumbnailUrl(parsed.thumbnailUrl);
      if (Array.isArray(parsed.articleTags)) setArticleTags(parsed.articleTags);
      if (parsed.customSlug) setCustomSlug(parsed.customSlug);
      isUserEditedRef.current = true;
      setHasUnsavedDraft(false);
      setToastState({
        id: String(Date.now()),
        type: 'success',
        title: 'Đã Phục Hồi Bản Nháp',
        message: `Đã khôi phục thành công bản nháp lưu tự động lúc ${parsed.savedAt || ''}!`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('qba_news_editor_draft');
    setHasUnsavedDraft(false);
  };

  // Quick Snippet Helper: Insert Zalo CTA Banner Card
  const insertZaloCtaCard = () => {
    insertHtmlAtCursor(`
<div class="p-5 rounded-2xl bg-gradient-to-br from-[#D90429] to-[#b91c1c] text-white shadow-md my-6 space-y-3">
  <div class="font-black text-sm uppercase tracking-wider flex items-center gap-2">
    <span>📞 CẦN HỖ TRỢ KỸ THUẬT HOẶC BÁO GIÁ PHỤ TÙNG Q.BA HỎA TỐC?</span>
  </div>
  <p class="text-xs text-red-100 leading-relaxed">Đội ngũ kỹ thuật Q.BA với 25 năm kinh nghiệm luôn sẵn sàng tra sơ đồ catalog và báo giá hỏa tốc cho bác tài trong 5 phút!</p>
  <div class="pt-1">
    <a href="https://zalo.me/0903588167" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#D90429] font-black text-xs rounded-xl hover:bg-slate-100 transition-colors shadow-sm">
      <span>CHAT ZALO KỸ THUẬT (0903.588.167)</span>
    </a>
  </div>
</div>
<p><br/></p>
`);
  };

  // Quick Snippet Helper: Insert FAQ Accordion Item
  const insertFaqBlock = () => {
    insertHtmlAtCursor(`
<div class="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
  <div class="font-bold text-sm text-slate-900 flex items-center gap-2">
    <span class="text-red-600 font-black">❓ Câu hỏi:</span>
    <span>Phụ tùng thay thế này có được bảo hành chính hãng không?</span>
  </div>
  <div class="text-xs text-slate-700 leading-relaxed pl-6 border-l-2 border-red-500">
    <strong>Trả lời:</strong> Tất cả sản phẩm linh kiện xuất kho Q.BA Đà Nẵng đều được bảo hành từ 6 đến 12 tháng tùy dòng sản phẩm, hỗ trợ 1 đổi 1 nếu phát hiện lỗi từ nhà sản xuất.
  </div>
</div>
<p><br/></p>
`);
  };

  // Save active cursor selection range before focus is lost (e.g. when opening file dialog)
  const saveCurrentSelection = () => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    const visualDiv = editorRef.current || document.querySelector('.article-rich-body[contenteditable="true"]');
    if (sel && sel.rangeCount > 0 && visualDiv && visualDiv.contains(sel.anchorNode)) {
      savedSelectionRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // Insert HTML content at saved/active DOM selection cursor (Replaces highlighted selection!)
  const insertHtmlAtCursor = (html: string) => {
    if (typeof window === 'undefined') return;
    isUserEditedRef.current = true;

    const visualDiv = editorRef.current || document.querySelector('.article-rich-body[contenteditable="true"]');
    if (!visualDiv) return;

    let range: Range | null = null;
    const sel = window.getSelection();

    if (sel && sel.rangeCount > 0 && visualDiv.contains(sel.anchorNode)) {
      range = sel.getRangeAt(0);
    } else if (savedSelectionRangeRef.current) {
      range = savedSelectionRangeRef.current;
    }

    if (range) {
      range.deleteContents(); // Replaces bôi đen / highlighted selection!

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node;
      let lastNode;
      while ((node = tempDiv.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);

      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }

      setContent(visualDiv.innerHTML);
      savedSelectionRangeRef.current = null;
    } else {
      if (editorRef.current) {
        editorRef.current.innerHTML += '\n\n' + html;
        setContent(editorRef.current.innerHTML);
      } else {
        setContent((prev) => (prev ? prev + '\n\n' + html : html));
      }
    }
  };

  // Execute standard formatting commands (Bold, Italic, Lists, Alignments)
  const execCmd = (command: string, value: string = '') => {
    if (typeof document !== 'undefined') {
      isUserEditedRef.current = true;
      saveCurrentSelection();
      document.execCommand(command, false, value);
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
      saveCurrentSelection();
    }
  };

  // Apply block heading tags (H1, H2, H3, H4, P) to highlighted text
  const formatHeading = (tagName: 'h1' | 'h2' | 'h3' | 'h4' | 'p') => {
    if (typeof document !== 'undefined') {
      isUserEditedRef.current = true;
      saveCurrentSelection();

      const tagString = `<${tagName}>`;
      let success = document.execCommand('formatBlock', false, tagString);
      if (!success) {
        success = document.execCommand('formatBlock', false, tagName.toUpperCase());
      }

      const visualDiv = editorRef.current || document.querySelector('.article-rich-body[contenteditable="true"]');
      if (visualDiv) {
        setContent(visualDiv.innerHTML);
      }
      saveCurrentSelection();
    }
  };

  // Helper to insert Technical Specification Table into Editor Body
  const insertSpecTable = () => {
    insertHtmlAtCursor(`
      <div class="my-6 overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
        <table class="w-full text-xs text-left border-collapse">
          <thead class="bg-slate-100 text-slate-900 font-bold uppercase tracking-wider">
            <tr>
              <th class="p-3 border-b border-slate-200">Thông Số Kỹ Thuật</th>
              <th class="p-3 border-b border-slate-200">Chi Tiết / Mã Phụ Tùng</th>
              <th class="p-3 border-b border-slate-200">Ghi Chú Vận Hành</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 font-medium text-slate-700">
            <tr>
              <td class="p-3 font-bold text-slate-900">Dòng Xe Tương Thích</td>
              <td class="p-3">HOWO 371HP, 380HP, 420HP</td>
              <td class="p-3">Động cơ Weichai WP10 / WP12</td>
            </tr>
            <tr>
              <td class="p-3 font-bold text-slate-900">Mã Catalog Chính Hãng</td>
              <td class="p-3 font-mono text-red-600 font-bold">WG9725530010</td>
              <td class="p-3">Hàng nhập khẩu chính hãng Sinotruk</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p><br/></p>
    `);
  };

  // Helper to insert Technical Warning Box
  const insertWarningCallout = () => {
    insertHtmlAtCursor(`
      <div class="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl my-4 text-slate-900 font-medium space-y-1">
        <div class="font-bold text-xs uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
          CẢNH BÁO AN TOÀN / LƯU Ý KỸ THUẬT:
        </div>
        <div class="text-xs leading-relaxed text-amber-950">Lưu ý kiểm tra áp suất, xiết lực bu-lông đúng tiêu chuẩn trước khi cho xe vận hành...</div>
      </div>
      <p><br/></p>
    `);
  };

  // Open Hyperlink Modal
  const handleOpenLinkModal = () => {
    saveCurrentSelection();
    const selected = typeof window !== 'undefined' ? window.getSelection()?.toString().trim() : '';
    setLinkText(selected || '');
    setLinkUrl('');
    setLinkNewTab(true);
    setShowLinkModal(true);
  };

  // Insert Hyperlink from Modal Form
  const handleConfirmInsertLink = () => {
    if (!linkUrl.trim()) return;
    const targetAttr = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    const textToUse = linkText.trim() || linkUrl.trim();
    insertHtmlAtCursor(`<a href="${linkUrl.trim()}"${targetAttr} class="text-[#D90429] font-bold underline hover:text-red-700">${textToUse}</a> `);
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  // Upload and Insert Image into Freeform Rich Text Body at Cursor
  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingInlineImage(true);
    try {
      const res = await AdminApiService.uploadImage(file);
      const uploadedUrl = res.data?.imageUrl || res.url || res.data?.url;
      if (res.ok && uploadedUrl) {
        const fullUrl = formatImageUrl(uploadedUrl);
        insertHtmlAtCursor(`
          <figure class="my-6 text-center group">
            <img src="${fullUrl}" alt="Hình ảnh bài viết" class="rounded-2xl w-full max-h-[550px] object-cover shadow-sm border border-slate-200/90 my-2 mx-auto" />
            <figcaption class="text-xs text-slate-500 italic mt-1 font-medium">Nhập chú thích hình ảnh tại đây...</figcaption>
          </figure>
          <p><br/></p>
        `);
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Đã Chèn Ảnh',
          message: 'Đã chèn hình ảnh mới vào đúng vị trí con trỏ!',
        });
      } else {
        alert(res.message || 'Lỗi khi upload hình ảnh');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingInlineImage(false);
      e.target.value = '';
    }
  };

  // Handle Rich HTML & Clipboard Image Paste (Properly replaces highlighted text selection!)
  const handleRichPaste = (e: React.ClipboardEvent) => {
    // 1. Direct Clipboard Image File Paste
    const files = e.clipboardData.files;
    if (files && files.length > 0 && files[0].type.startsWith('image/')) {
      e.preventDefault();
      const file = files[0];
      setToastState({
        id: String(Date.now()),
        type: 'info',
        title: 'Đang Upload Ảnh...',
        message: 'Đang tải ảnh từ Clipboard lên máy chủ...',
      });
      AdminApiService.uploadImage(file)
        .then((res) => {
          const uploadedUrl = res.data?.imageUrl || res.url || res.data?.url;
          if (uploadedUrl) {
            const fullUrl = formatImageUrl(uploadedUrl);
            insertHtmlAtCursor(`
              <figure class="my-6 text-center group">
                <img src="${fullUrl}" alt="Hình ảnh bài viết" class="rounded-2xl w-full max-h-[550px] object-cover shadow-sm border border-slate-200/90 my-2 mx-auto" />
                <figcaption class="text-xs text-slate-500 italic mt-1 font-medium">Chú thích hình ảnh...</figcaption>
              </figure>
              <p><br/></p>
            `);
            setToastState({
              id: String(Date.now()),
              type: 'success',
              title: 'Đã Chèn Ảnh',
              message: 'Đã tự động tải và chèn ảnh vào đúng vị trí con trỏ!',
            });
          }
        })
        .catch(console.error);
      return;
    }

    // 2. Text & HTML Paste
    const htmlData = e.clipboardData.getData('text/html');
    const textData = e.clipboardData.getData('text/plain');

    if (htmlData || textData) {
      e.preventDefault();
      let insertContent = '';

      if (htmlData) {
        let clean = htmlData
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/font-family:[^;"']*;?/gi, '')
          .replace(/font-family="[^"]*"/gi, '');

        const bodyMatch = clean.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          clean = bodyMatch[1];
        }
        insertContent = clean.trim();
      } else {
        const escaped = textData
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br/>');
        insertContent = escaped;
      }

      insertHtmlAtCursor(insertContent);
      setToastState({
        id: String(Date.now()),
        type: 'success',
        title: 'Đã Thay Thế / Dán Nội Dung',
        message: 'Đã dán nội dung và giữ nguyên định dạng!',
      });
    }
  };

  // Computed Slug
  const computedSlug = useMemo(() => {
    return customSlug.trim() ? slugify(customSlug) : slugify(title);
  }, [customSlug, title]);

  // Computed Word Count & Reading Time (Clean HTML tags for accurate reading time)
  const stats = useMemo(() => {
    const cleanTextFromHtml = (str: string) => {
      if (!str) return '';
      return str
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
        .replace(/<[^>]*>?/gm, ' ')
        .replace(/&[a-z0-9#]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const cleanTitle = title.trim();
    const cleanLead = leadSummary.trim();
    const cleanContent = cleanTextFromHtml(content);
    const cleanSections = sections.map((s) => s.heading + ' ' + cleanTextFromHtml(s.bodyText)).join(' ');

    const fullPlainText = `${cleanTitle} ${cleanLead} ${cleanContent} ${cleanSections}`.replace(/\s+/g, ' ').trim();
    const words = fullPlainText ? fullPlainText.split(/\s+/).length : 0;
    const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, readingTimeMinutes, charCount: fullPlainText.length };
  }, [title, leadSummary, content, sections]);

  // SEO Score Calculation (0-100)
  const seoChecklist = useMemo(() => {
    const checks = [
      { id: 'titleLen', text: 'Tiêu đề (40-70 ký tự)', pass: title.length >= 40 && title.length <= 70, val: `${title.length}/70` },
      { id: 'leadLen', text: 'Tóm tắt Meta (80-160 ký tự)', pass: leadSummary.length >= 80 && leadSummary.length <= 160, val: `${leadSummary.length}/160` },
      { id: 'hasCover', text: 'Ảnh bìa đại diện SEO', pass: Boolean(thumbnailUrl && thumbnailUrl.length > 5), val: thumbnailUrl ? 'Đã có' : 'Chưa có' },
      { id: 'wordCount', text: 'Độ dài bài viết (> 300 từ)', pass: stats.words >= 300, val: `${stats.words} từ` },
      { id: 'hasSlug', text: 'Đường dẫn URL thân thiện', pass: Boolean(computedSlug), val: computedSlug ? `/${computedSlug}` : 'Trống' },
    ];
    const passedCount = checks.filter((c) => c.pass).length;
    const score = Math.round((passedCount / checks.length) * 100);
    return { checks, score };
  }, [title, leadSummary, thumbnailUrl, stats.words, computedSlug]);

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

  // Helper to parse content
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

  // 2. Fetch Article Detail if Editing
  const fetchArticleDetail = useCallback(async (id: number) => {
    setLoadingArticle(true);
    try {
      const res = await AdminApiService.getNewsBySlug(id);
      const art = res.data?.data || res.data;
      if (art && (art.title || art.id)) {
        setTitle(art.title || '');
        if (art.slug) setCustomSlug(art.slug);
        setCategorySlug(art.categorySlug || 'cam-nang-ky-thuat');
        setThumbnailUrl(art.thumbnailUrl || '/images/logo/logonen.png');
        setIsFeatured(Boolean(art.isFeatured));
        if (Array.isArray(art.tags) && art.tags.length > 0) {
          const parsed = art.tags
            .flatMap((t: string) => (typeof t === 'string' ? t.split(',') : [t]))
            .map((t: string) => String(t).trim().replace(/^#+/, ''))
            .filter(Boolean);
          setArticleTags(Array.from(new Set(parsed)));
        } else if (typeof art.tags === 'string' && (art.tags as string).trim()) {
          const parsed = (art.tags as string)
            .split(',')
            .map((t: string) => t.trim().replace(/^#+/, ''))
            .filter(Boolean);
          setArticleTags(Array.from(new Set(parsed)));
        } else {
          setArticleTags([]);
        }

        let { mainContent, parsedSections } = parseContentAndSections(art.content || '');

        // Clean any residual Times New Roman or external font-family inline styles
        mainContent = mainContent.replace(/font-family\s*:\s*[^;"']*;?/gi, '').replace(/font-family\s*=\s*["'][^"']*["']/gi, '');

        // Extract lead summary meta excerpt if present
        const leadMatch = mainContent.match(/<p[^>]*class=["'][^"']*lead[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
        if (leadMatch) {
          const leadText = leadMatch[1].replace(/<[^>]*>?/gm, '').trim();
          setLeadSummary(leadText);
          const contentWithoutLead = mainContent.replace(/<p[^>]*class=["'][^"']*lead[^"']*["'][^>]*>[\s\S]*?<\/p>/i, '').trim();
          setContent(contentWithoutLead);
        } else {
          setContent(mainContent);
        }

        if (art.publishedAt) {
          const pubDate = new Date(art.publishedAt);
          setPublishedAt(formatDateToLocalInput(pubDate));
          if (pubDate.getTime() > Date.now()) {
            setPublishType('scheduled');
          } else {
            setPublishType('now');
          }
        }

        if (parsedSections.length > 0) {
          setSections(parsedSections);
          setEditorMode('sections');
        }
      }
    } catch (err) {
      console.error('Failed to fetch article detail:', err);
    } finally {
      setLoadingArticle(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    if (editingArticleId) {
      fetchArticleDetail(editingArticleId);
    }
  }, [fetchCategories, editingArticleId, fetchArticleDetail]);

  // Quick Insert Helpers into Rich Text Box
  const insertFormatting = (syntaxBefore: string, syntaxAfter: string = '') => {
    isUserEditedRef.current = true;
    setContent((prev) => prev + '\n' + syntaxBefore + syntaxAfter);
  };

  // Section Builder Actions
  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;
    setSections(newSections);
  };

  // Cover Image Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
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
        alert(res.message || 'Lỗi upload ảnh bìa');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingCover(false);
    }
  };

  // Section Image Upload
  const handleSectionUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSectionId(id);
    try {
      const res = await AdminApiService.uploadImage(file);
      const uploadedUrl = res.data?.imageUrl || res.url || res.data?.url;
      if (res.ok && uploadedUrl) {
        setSections((prev) =>
          prev.map((sec) => (sec.id === id ? { ...sec, imageUrl: uploadedUrl } : sec))
        );
      } else {
        alert(res.message || 'Lỗi upload ảnh bước');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingSectionId(null);
    }
  };

  // Submit Article (Save or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Capture live content from contentEditable if active
    let currentBodyHtml = content.trim();
    if (typeof document !== 'undefined') {
      const visualDiv = document.querySelector('.article-rich-body[contenteditable="true"]');
      if (visualDiv && visualDiv.innerHTML.trim()) {
        currentBodyHtml = visualDiv.innerHTML.trim();
        setContent(currentBodyHtml);
      }
    }

    // 2. Remove any existing lead paragraph from body to prevent stale/duplicate lead paragraphs
    currentBodyHtml = currentBodyHtml
      .replace(/<p[^>]*class=["'][^"']*lead[^"']*["'][^>]*>[\s\S]*?<\/p>/gi, '')
      .trim();

    let finalContent = currentBodyHtml;

    // 3. Compile section builder blocks if in section mode
    if (editorMode === 'sections' && sections.length > 0) {
      const compiledHtml = sections
        .filter((sec) => sec.heading.trim() || sec.imageUrl.trim() || sec.bodyText.trim())
        .map(
          (sec, idx) => `
<div class="my-6 space-y-3">
  ${sec.heading ? `<h2 class="text-xl sm:text-2xl font-black text-slate-900 uppercase font-heading flex items-center gap-3 pt-6 border-t border-slate-200"><span class="w-8 h-8 rounded-xl bg-[#D90429] text-white text-xs font-black flex items-center justify-center shadow-sm shrink-0 font-mono">${idx + 1}</span><span>${sec.heading}</span></h2>` : ''}
  ${sec.imageUrl ? `<img src="${sec.imageUrl}" alt="${sec.heading || 'Phụ tùng Q.BA'}" class="rounded-2xl w-full max-h-[500px] object-cover my-4 shadow-sm border border-slate-200/90" />` : ''}
  ${sec.bodyText ? `<p class="text-slate-700 text-base md:text-lg leading-relaxed whitespace-pre-wrap my-4 font-normal">${sec.bodyText}</p>` : ''}
</div>`
        )
        .join('\n');
      finalContent = (currentBodyHtml ? currentBodyHtml + '\n\n' : '') + compiledHtml;
    }

    // 4. Prepend fresh leadSummary meta excerpt if provided
    if (leadSummary.trim()) {
      const cleanLead = leadSummary.trim();
      const leadHtml = `<p class="lead text-slate-700 text-base md:text-lg leading-relaxed font-medium italic bg-[#f8fafc] p-4 rounded-2xl border-l-4 border-[#D90429] my-4">${cleanLead}</p>`;
      finalContent = leadHtml + '\n\n' + finalContent;
    }

    if (!title.trim() || !finalContent.trim()) {
      alert('Vui lòng điền đầy đủ Tiêu đề và Nội dung bài viết!');
      return;
    }

    setSubmitting(true);
    try {
      const finalPublishedAt = publishType === 'scheduled' && publishedAt
        ? new Date(publishedAt).toISOString()
        : new Date().toISOString();

      const payload = {
        title: title.trim(),
        slug: computedSlug,
        categorySlug,
        tags: Array.from(new Set(articleTags.map((t) => t.trim()).filter(Boolean))),
        content: finalContent,
        thumbnailUrl: thumbnailUrl || '/images/logo/logonen.png',
        isFeatured,
        publishedAt: finalPublishedAt,
      };

      if (editingArticleId) {
        const res = await AdminApiService.updateNews(editingArticleId, payload);
        if (res.ok) {
          initialFormStateRef.current = getFormSnapshot();
          setToastState({
            id: String(Date.now()),
            type: 'success',
            title: 'Cập Nhật Thành Công',
            message: `Đã cập nhật bài viết "${title}" thành công!`,
          });
          setTimeout(() => router.push('/admin/news'), 1200);
        } else {
          alert(res.message || 'Lỗi khi cập nhật bài viết');
        }
      } else {
        const res = await AdminApiService.createNews(payload);
        if (res.ok) {
          initialFormStateRef.current = getFormSnapshot();
          setToastState({
            id: String(Date.now()),
            type: 'success',
            title: 'Xuất Bản Thành Công',
            message: `Đã xuất bản bài viết mới "${title}"!`,
          });
          setTimeout(() => router.push('/admin/news'), 1200);
        } else {
          alert(res.message || 'Lỗi khi tạo bài viết');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#dc2626',
          borderRadius: 12,
          fontFamily: 'var(--font-inter), sans-serif',
        },
      }}
    >
      {modalContextHolder}
      <div className="space-y-4 pb-8 w-full max-w-full">
        {/* Top Navigation & Action Header */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackWithConfirm}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border border-slate-200/80"
              title="Quay lại danh sách bài viết"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {editingArticleId ? 'Chỉnh Sửa Bài Viết Kỹ Thuật' : 'Soạn Thảo Bài Viết Kỹ Thuật Chuẩn SEO'}
                </h1>
                {editingArticleId && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-600 border border-slate-200">
                    ID #{editingArticleId}
                  </span>
                )}
                {lastAutoSaveTime && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 font-mono text-[10px] font-bold text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                    <Save className="w-3 h-3 text-emerald-600" />
                    <span>Đã tự động lưu nháp lúc {lastAutoSaveTime}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Giao diện soạn thảo toàn màn hình nâng cao với bộ mẫu dựng sẵn, trợ lý AI SEO & chế độ tập trung.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsZenMode((prev) => !prev)}
              className="px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Bật/Tắt chế độ tập trung viết bài toàn màn hình"
            >
              {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{isZenMode ? 'Thoát Tập Trung' : 'Viết Tập Trung'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              className={`px-3 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${showPreview
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                }`}
            >
              <Eye className="w-4 h-4" />
              <span>{showPreview ? 'Đóng Xem Trước' : 'Xem Trước Bài Viết'}</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang Lưu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingArticleId ? 'Lưu Bài Viết' : 'Xuất Bản Ngay'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Unsaved Local Draft Recovery Banner */}
        {hasUnsavedDraft && (
          <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-amber-900 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Phát hiện bản nháp chưa lưu từ phiên làm việc trước. Bạn có muốn phục hồi bài viết không?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-extrabold cursor-pointer transition-all shadow-2xs"
              >
                Khôi Phục Bản Nháp
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-amber-300 rounded-md cursor-pointer transition-all"
              >
                Bỏ Qua
              </button>
            </div>
          </div>
        )}

        {/* Real-time Stats & SEO Score Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-lg border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Độ dài: <strong className="font-mono text-slate-900 font-extrabold">{stats.words.toLocaleString()}</strong> từ</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">
              <FileText className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Ký tự: <strong className="font-mono text-slate-900 font-extrabold">{stats.charCount.toLocaleString()}</strong></span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
              <ClockIcon className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Thời gian đọc: <strong className="font-mono text-slate-900 font-extrabold">~{stats.readingTimeMinutes} phút</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden sm:inline">Điểm Tối Ưu SEO:</span>
            <div className="w-28 sm:w-36">
              <Progress
                percent={seoChecklist.score}
                size="small"
                status={seoChecklist.score >= 80 ? 'success' : 'active'}
                strokeColor={seoChecklist.score >= 80 ? '#16a34a' : '#d97706'}
              />
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-md shadow-2xs ${seoChecklist.score >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
              {seoChecklist.score}/100 {seoChecklist.score >= 80 ? 'Tối Ưu Tốt' : 'Cần Cải Tiến'}
            </span>
          </div>
        </div>

        {loadingArticle ? (
          <div className="p-12 text-center bg-white rounded-lg border border-slate-200/80 space-y-3 shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
            <p className="text-xs font-bold text-slate-600">Đang tải thông tin bài viết kỹ thuật...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Column: Editor Tabs & Main Content Canvas (Col 8) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Tab Selector Card */}
              <div className="bg-white p-3 sm:p-3.5 rounded-lg border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('content')}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'content'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Nội Dung Bài Viết</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('seo')}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'seo'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    <Search className="w-4 h-4" />
                    <span>Tối Ưu SEO & Meta</span>
                  </button>
                </div>

                {/* Mode Selector for Content Tab */}
                {activeTab === 'content' && (
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md border border-slate-200/60 text-xs">
                    <button
                      type="button"
                      onClick={() => setEditorMode('freeform')}
                      className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${editorMode === 'freeform'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-[#111317]'
                        }`}
                    >
                      Soạn Thảo Tự Do
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode('sections')}
                      className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${editorMode === 'sections'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                      Xây Dựng Theo Bước (Section Builder)
                    </button>
                  </div>
                )}
              </div>

              {/* TAB 1: Content Editor */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  {/* Article Title Header Card */}
                  <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-xs space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                          Tiêu Đề Bài Viết Chuẩn SEO (*)
                        </label>
                        <span className={`text-[11px] font-mono font-bold ${title.length >= 40 && title.length <= 70 ? 'text-green-600' : 'text-slate-400'
                          }`}>
                          {title.length}/70 ký tự (Tối ưu 40-70)
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ví dụ: Hướng dẫn thay thế phớt dầu và bảo dưỡng hộp số Fast Gear xe HOWO..."
                        className="w-full p-3 border border-slate-200 rounded-lg font-black text-slate-900 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                          Đoạn Mở Đầu / Tóm Tắt Kỹ Thuật (Meta Excerpt)
                        </label>
                        <span className={`text-[11px] font-mono font-bold ${leadSummary.length >= 80 && leadSummary.length <= 160 ? 'text-green-600' : 'text-slate-400'
                          }`}>
                          {leadSummary.length}/160 ký tự
                        </span>
                      </div>
                      <textarea
                        // rows={2.5}
                        rows={10}
                        value={leadSummary}
                        onChange={(e) => setLeadSummary(e.target.value)}
                        placeholder="Tóm tắt ngắn gọn quy trình kỹ thuật hoặc điểm mấu chốt để người dùng và Google tìm kiếm nắm rõ..."
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 text-md focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>
                  </div>

                  {/* Mode A: Freeform Rich Text Canvas */}
                  {editorMode === 'freeform' && (
                    <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-xs space-y-3.5 relative">
                      {/* Rich Formatting Toolbar Suite (Sticky Glassmorphism) */}
                      <div className="p-2.5 bg-white/95 backdrop-blur-md rounded-lg border border-slate-200/90 space-y-2 sticky top-0 z-30 shadow-2xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                          {/* Formatting Toolbar Group 1: Text Style & Alignment */}
                          <div className="flex flex-wrap items-center gap-1">
                            <button
                              type="button"
                              onClick={() => execCmd('bold')}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 font-bold transition-all cursor-pointer"
                              title="In Đậm (Ctrl+B)"
                            >
                              <Bold className="w-4 h-4 text-slate-800" />
                            </button>
                            <button
                              type="button"
                              onClick={() => execCmd('italic')}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 italic transition-all cursor-pointer"
                              title="In Nghiêng (Ctrl+I)"
                            >
                              <Italic className="w-4 h-4 text-slate-800" />
                            </button>
                            <button
                              type="button"
                              onClick={() => execCmd('underline')}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 underline transition-all cursor-pointer"
                              title="Gạch Chân (Ctrl+U)"
                            >
                              <Underline className="w-4 h-4 text-slate-800" />
                            </button>
                            <button
                              type="button"
                              onClick={() => execCmd('strikeThrough')}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 line-through transition-all cursor-pointer"
                              title="Gạch Ngang"
                            >
                              <Strikethrough className="w-4 h-4 text-slate-800" />
                            </button>

                            <div className="h-4 w-px bg-slate-300 mx-1" />

                            {/* Headings H1, H2, H3, H4, P */}
                            <button
                              type="button"
                              onClick={() => formatHeading('h1')}
                              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-black text-xs transition-all cursor-pointer shadow-2xs"
                              title="Tiêu đề H1 (Heading 1)"
                            >
                              H1
                            </button>
                            <button
                              type="button"
                              onClick={() => formatHeading('h2')}
                              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-black text-xs transition-all cursor-pointer shadow-2xs"
                              title="Tiêu đề H2 (Heading 2)"
                            >
                              H2
                            </button>
                            <button
                              type="button"
                              onClick={() => formatHeading('h3')}
                              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                              title="Tiêu đề H3 (Heading 3)"
                            >
                              H3
                            </button>
                            <button
                              type="button"
                              onClick={() => formatHeading('h4')}
                              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                              title="Tiêu đề H4 (Heading 4)"
                            >
                              H4
                            </button>
                            <button
                              type="button"
                              onClick={() => formatHeading('p')}
                              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium text-xs transition-all cursor-pointer"
                              title="Văn bản thường (Paragraph)"
                            >
                              ¶ Đoạn
                            </button>

                            <div className="h-4 w-px bg-slate-300 mx-1" />

                            {/* Lists & Alignment */}
                            <button
                              type="button"
                              onClick={() => execCmd('insertUnorderedList')}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
                              title="Danh sách dấu chấm (Bullets)"
                            >
                              <List className="w-4 h-4 text-slate-800" />
                            </button>
                            <button
                              type="button"
                              onClick={() => execCmd('insertOrderedList')}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
                              title="Danh sách số thứ tự (Numbered)"
                            >
                              <ListOrdered className="w-4 h-4 text-slate-800" />
                            </button>

                            <div className="h-4 w-px bg-slate-300 mx-1" />

                            <button
                              type="button"
                              onClick={() => execCmd('justifyLeft')}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
                              title="Căn Trái"
                            >
                              <AlignLeft className="w-4 h-4 text-slate-800" />
                            </button>
                            <button
                              type="button"
                              onClick={() => execCmd('justifyCenter')}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
                              title="Căn Giữa"
                            >
                              <AlignCenter className="w-4 h-4 text-slate-800" />
                            </button>
                            <button
                              type="button"
                              onClick={() => execCmd('justifyRight')}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
                              title="Căn Phải"
                            >
                              <AlignRight className="w-4 h-4 text-slate-800" />
                            </button>
                          </div>

                          {/* Quick Tools Suite */}
                          <div className="flex items-center gap-1.5">
                            {/* View Switcher Tabs */}
                            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[11px] font-bold">
                              <button
                                type="button"
                                onClick={() => setVisualHtmlMode('visual')}
                                className={`px-3 py-1 rounded transition-all cursor-pointer ${visualHtmlMode === 'visual'
                                  ? 'bg-red-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                                  }`}
                              >
                                Soạn Thảo Trực Quan
                              </button>
                              <button
                                type="button"
                                onClick={() => setVisualHtmlMode('code')}
                                className={`px-3 py-1 rounded transition-all cursor-pointer ${visualHtmlMode === 'code'
                                  ? 'bg-red-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                                  }`}
                              >
                                Mã HTML
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Formatting Group 2: Blocks, Headings, Callouts & Media */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-0.5">Chèn Khối:</span>

                          <button
                            type="button"
                            onClick={() => insertFormatting('<h2>', '</h2>')}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-100 cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Heading2 className="w-3.5 h-3.5 text-red-600" />
                            <span>Tiêu đề H2</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => insertFormatting('<h3>', '</h3>')}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-100 cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Heading3 className="w-3.5 h-3.5 text-red-600" />
                            <span>Tiêu đề H3</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => insertFormatting('<blockquote class="p-4 bg-red-50 border-l-4 border-[#D90429] rounded-r-xl italic my-4 font-medium text-slate-900">', '---------</blockquote>')}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-100 cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                            <span>Khung Lời Khuyên</span>
                          </button>

                          <button
                            type="button"
                            onClick={insertWarningCallout}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Khung Cảnh Báo</span>
                          </button>

                          <button
                            type="button"
                            onClick={insertSpecTable}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold hover:bg-blue-100 cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Table className="w-3.5 h-3.5 text-blue-600" />
                            <span>Bảng Thông Số</span>
                          </button>

                          <button
                            type="button"
                            onClick={insertZaloCtaCard}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs font-bold hover:bg-red-100 cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Chèn Banner đặt hàng Zalo Q.BA vào bài viết"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                            <span>Card Zalo Q.BA</span>
                          </button>

                          <button
                            type="button"
                            onClick={insertFaqBlock}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-200 cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Chèn khối hỏi đáp FAQ"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-slate-700" />
                            <span>Khối Hỏi Đáp FAQ</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleOpenLinkModal}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-200 cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <LinkIcon className="w-3.5 h-3.5 text-slate-700" />
                            <span>Chèn Link</span>
                          </button>

                          <label
                            onClick={saveCurrentSelection}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-extrabold hover:bg-red-700 cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all"
                          >
                            {uploadingInlineImage ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            ) : (
                              <Upload className="w-3.5 h-3.5 text-white" />
                            )}
                            <span>{uploadingInlineImage ? 'Đang Upload...' : 'Chèn Ảnh Vị Trí Con Trỏ'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleInlineImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Main Rich Content Editor Canvas */}
                      <div className="relative">
                        {/* Notion/Medium Style Floating Selection Bubble Toolbar */}
                        {selectionBubble.visible && visualHtmlMode === 'visual' && (
                          <div
                            style={{ top: `${selectionBubble.top}px`, left: `${selectionBubble.left}px` }}
                            className="absolute z-40 bg-slate-900 text-white rounded-xl shadow-2xl p-1 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150 border border-slate-700"
                          >
                            <button
                              type="button"
                              onClick={() => execCmd('bold')}
                              className="px-2 py-1 hover:bg-slate-800 rounded font-bold text-xs"
                              title="In đậm"
                            >
                              B
                            </button>
                            <button
                              type="button"
                              onClick={() => execCmd('italic')}
                              className="px-2 py-1 hover:bg-slate-800 rounded italic text-xs"
                              title="In nghiêng"
                            >
                              I
                            </button>
                            <button
                              type="button"
                              onClick={() => execCmd('underline')}
                              className="px-2 py-1 hover:bg-slate-800 rounded underline text-xs"
                              title="Gạch chân"
                            >
                              U
                            </button>
                            <div className="w-px h-4 bg-slate-700 my-auto mx-0.5" />
                            <button
                              type="button"
                              onClick={() => formatHeading('h1')}
                              className="px-2 py-1 hover:bg-slate-800 rounded text-xs font-black text-red-400"
                              title="Tiêu đề H1"
                            >
                              H1
                            </button>
                            <button
                              type="button"
                              onClick={() => formatHeading('h2')}
                              className="px-2 py-1 hover:bg-slate-800 rounded text-xs font-bold text-red-400"
                              title="Tiêu đề H2"
                            >
                              H2
                            </button>
                            <button
                              type="button"
                              onClick={() => formatHeading('h3')}
                              className="px-2 py-1 hover:bg-slate-800 rounded text-xs font-bold text-amber-400"
                              title="Tiêu đề H3"
                            >
                              H3
                            </button>
                            <button
                              type="button"
                              onClick={() => formatHeading('h4')}
                              className="px-2 py-1 hover:bg-slate-800 rounded text-xs font-semibold text-slate-300"
                              title="Tiêu đề H4"
                            >
                              H4
                            </button>
                            <button
                              type="button"
                              onClick={() => formatHeading('p')}
                              className="px-2 py-1 hover:bg-slate-800 rounded text-xs text-slate-400"
                              title="Chuyển về văn bản thường"
                            >
                              Paragraph
                            </button>
                            <button
                              type="button"
                              onClick={() => execCmd('insertUnorderedList')}
                              className="px-2 py-1 hover:bg-slate-800 rounded text-xs"
                              title="Bullet List"
                            >
                              • List
                            </button>
                            <button
                              type="button"
                              onClick={handleOpenLinkModal}
                              className="px-2 py-1 hover:bg-slate-800 rounded text-xs"
                              title="Chèn link"
                            >
                              🔗 Link
                            </button>
                          </div>
                        )}

                        {visualHtmlMode === 'visual' ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                              <span className="font-bold text-slate-700">
                                Khung Soạn Thảo Trực Quan (Gõ trực tiếp hoặc dán Ctrl+V):
                              </span>
                              <span className="text-[11px] text-red-600 font-bold">
                                Hỗ trợ Bôi đen hiện thanh công cụ nổi Notion
                              </span>
                            </div>
                            <div
                              ref={editorRef}
                              contentEditable
                              suppressContentEditableWarning
                              onInput={() => {
                                isUserEditedRef.current = true;
                                saveCurrentSelection();
                              }}
                              onKeyUp={saveCurrentSelection}
                              onMouseUp={saveCurrentSelection}
                              onFocus={saveCurrentSelection}
                              onSelect={saveCurrentSelection}
                              onBlur={(e) => {
                                saveCurrentSelection();
                                setContent(e.currentTarget.innerHTML);
                              }}
                              onPaste={handleRichPaste}
                              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                              className="p-4 sm:p-5 rounded-lg border border-slate-200 bg-white font-sans text-slate-800 text-sm md:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500/20 overflow-y-auto article-rich-body custom-scrollbar min-h-[420px] max-h-[680px]"
                            />
                          </div>
                        ) : (
                          <textarea
                            rows={14}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onPaste={handleRichPaste}
                            placeholder="Nhập hoặc dán mã HTML bài viết tại đây..."
                            className="w-full p-4 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mode B: Step-by-Step Section Builder */}
                  {editorMode === 'sections' && (
                    <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            <Layers className="w-4 h-4 text-red-600" />
                            <span>Soạn Thảo Quy Trình Theo Bước Kèm Ảnh Sơ Đồ</span>
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Chia nhỏ bài viết thành các phần bước minh họa trực quan.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddSection}
                          className="px-3.5 py-1.5 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Thêm Bước Mới</span>
                        </button>
                      </div>

                      {sections.map((sec, idx) => (
                        <div
                          key={sec.id}
                          className="p-3.5 sm:p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 relative group"
                        >
                          {/* Step Header */}
                          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center font-mono">
                                {idx + 1}
                              </span>
                              <span className="font-extrabold text-slate-900 text-xs">
                                Bước #{idx + 1}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveSection(idx, 'up')}
                                className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-30 cursor-pointer"
                                title="Di chuyển lên"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === sections.length - 1}
                                onClick={() => handleMoveSection(idx, 'down')}
                                className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-30 cursor-pointer"
                                title="Di chuyển xuống"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSection(sec.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1 cursor-pointer"
                                title="Xóa bước này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Step Fields */}
                          <div className="space-y-3">
                            <div>
                              <label className="font-bold text-slate-700 text-xs block mb-1">
                                Tiêu Đề Bước (*)
                              </label>
                              <input
                                type="text"
                                value={sec.heading}
                                onChange={(e) => handleUpdateSection(sec.id, 'heading', e.target.value)}
                                placeholder={`Ví dụ: Bước ${idx + 1}: Kiểm tra mạt kim loại và tháo phớt dầu...`}
                                className="w-full p-2.5 border border-slate-200 rounded-lg font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 text-xs block mb-1">
                                Ảnh Sơ Đồ / Minh Họa Bước (Tùy chọn)
                              </label>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                {sec.imageUrl ? (
                                  <div className="w-28 h-16 rounded-lg border border-slate-200 bg-slate-100 relative overflow-hidden flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={sec.imageUrl}
                                      alt="Section Preview"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : null}

                                <div className="flex items-center gap-2">
                                  <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-100 transition-all flex items-center gap-1.5">
                                    {uploadingSectionId === sec.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                                    ) : (
                                      <Upload className="w-4 h-4 text-red-600" />
                                    )}
                                    <span>{sec.imageUrl ? 'Thay Ảnh' : 'Tải Ảnh Sơ Đồ Từ Máy'}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleSectionUpload(sec.id, e)}
                                      className="hidden"
                                    />
                                  </label>

                                  {sec.imageUrl && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateSection(sec.id, 'imageUrl', '')}
                                      className="p-1.5 text-slate-400 hover:text-red-600 text-xs font-semibold cursor-pointer"
                                    >
                                      Gỡ ảnh
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 text-xs block mb-1">
                                Nội Dung Chi Tiết Thao Tác Kỹ Thuật
                              </label>
                              <textarea
                                rows={3}
                                value={sec.bodyText}
                                onChange={(e) => handleUpdateSection(sec.id, 'bodyText', e.target.value)}
                                placeholder="Mô tả các lưu ý kỹ thuật, công cụ cần chuẩn bị khi thao tác bước này..."
                                className="w-full p-2.5 border border-slate-200 rounded-lg font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SEO & Meta Checklist Tab */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  {/* Google SERP Snippet Preview Box */}
                  <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-xs space-y-3">
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Xem Trước Khung Tìm Kiếm Google (Google SERP Preview)</span>
                    </h3>

                    <div className="p-3.5 sm:p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 font-sans">
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-mono truncate">
                        <div className="w-4 h-4 rounded-full bg-[#D90429] text-white font-bold text-[9px] flex items-center justify-center">
                          Q
                        </div>
                        <span className="truncate">{currentDomain} &gt; news &gt; {computedSlug || 'duong-dan-bai-viet'}</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-[#1a0dab] hover:underline cursor-pointer line-clamp-1 leading-snug">
                        {title || 'Tiêu đề bài viết kỹ thuật phụ tùng Q.BA'}
                      </h4>
                      <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed font-normal">
                        {leadSummary || 'Nội dung tóm tắt mở đầu bài viết sẽ hiển thị ở đây trên trang tìm kiếm Google giúp tăng tỷ lệ nhấp chuột (CTR)...'}
                      </p>
                    </div>
                  </div>

                  {/* Custom Slug Editor */}
                  <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-xs space-y-2.5">
                    <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider block">
                      Tùy Chỉnh Đường Dẫn URL Slug (SEO Friendly URL)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-xs font-mono select-none hidden sm:inline-block">
                        /news/
                      </span>
                      <input
                        type="text"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        placeholder={slugify(title) || 'huong-dan-thay-the-piston'}
                        className="flex-1 p-2 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Đường dẫn thực tế: <strong className="text-slate-900 font-mono">/news/{computedSlug}</strong>
                    </p>
                  </div>

                  {/* Real-time SEO Checklist Card */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>Danh Sách Kiểm Tra SEO Bài Viết</span>
                    </h3>

                    <div className="space-y-2.5">
                      {seoChecklist.checks.map((check) => (
                        <div
                          key={check.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                        >
                          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                            {check.pass ? (
                              <Check className="w-4 h-4 text-green-600 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                            )}
                            <span>{check.text}</span>
                          </div>

                          <span className={`text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-md ${check.pass ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                            }`}>
                            {check.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Publishing & Media Sidebar (Col 4) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Sidebar Card 1: Article SEO Cover Image */}
              <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                  <Tag className="w-4 h-4 text-red-600" />
                  <span>Ảnh Bìa Đại Diện (SEO Thumbnail)</span>
                </h3>

                <div className="w-full aspect-[16/10] rounded-lg border border-slate-200 bg-slate-50 relative overflow-hidden shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailUrl || '/images/logo/logonen.png'}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <label className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer transition-all border border-slate-200 flex items-center justify-center gap-2">
                    {uploadingCover ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                    ) : (
                      <Upload className="w-4 h-4 text-red-600" />
                    )}
                    <span>{uploadingCover ? 'Đang Upload...' : 'Tải Ảnh Bìa Từ Máy'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </label>

                  {thumbnailUrl && thumbnailUrl !== '/images/logo/logonen.png' && (
                    <button
                      type="button"
                      onClick={() => setThumbnailUrl('/images/logo/logonen.png')}
                      className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-[#D90429] font-bold text-xs border border-red-200/80 transition-all flex items-center gap-1.5 shrink-0"
                      title="Đặt lại ảnh về mặc định (Logo website)"
                    >
                      <Trash2 className="w-4 h-4 text-[#D90429]" />
                      <span>Xóa Ảnh</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    Hoặc Nhập Trực Tiếp URL Ảnh Bìa:
                  </label>
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                  />
                </div>
              </div>

              {/* Sidebar Card 2: Publishing Category & Featured Status */}
              <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-xs space-y-3.5">
                <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Sliders className="w-4 h-4 text-red-600" />
                  <span>Cấu Hình Xuất Bản Bài Viết</span>
                </h3>

                <div>
                  <label className="font-bold text-slate-700 text-xs block mb-1.5">
                    Danh Mục Kỹ Thuật (*)
                  </label>
                  <Select
                    value={categorySlug}
                    onChange={(val) => setCategorySlug(val)}
                    className="w-full font-bold text-xs"
                    // size="large"
                    options={categories.map((c) => ({
                      label: c.name,
                      value: c.slug,
                    }))}
                  />
                </div>

                {/* Scheduled Publishing Option */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4 text-red-600" />
                    <span>Thời Gian Xuất Bản (Hẹn Giờ Lên Bài)</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPublishType('now')}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${publishType === 'now'
                        ? 'bg-red-50 border-red-200 text-[#D90429] shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đăng Ngay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPublishType('scheduled');
                        if (!publishedAt) {
                          const future = new Date(Date.now() + 3600 * 1000);
                          setPublishedAt(formatDateToLocalInput(future));
                        }
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${publishType === 'scheduled'
                        ? 'bg-red-50 border-red-200 text-[#D90429] shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <ClockIcon className="w-3.5 h-3.5 text-amber-500" />
                      <span>Hẹn Giờ</span>
                    </button>
                  </div>

                  {publishType === 'scheduled' && (
                    <div className="pt-1 space-y-1.5">
                      <DatePicker
                        showTime={{ format: 'HH:mm' }}
                        format="DD/MM/YYYY HH:mm"
                        placeholder="Chọn ngày và giờ xuất bản"
                        value={publishedAt ? dayjs(publishedAt) : null}
                        onChange={(date) => setPublishedAt(date ? date.format('YYYY-MM-DDTHH:mm') : '')}
                        className="w-full h-9 border-slate-300 rounded-lg text-xs font-medium"
                        locale={localeVi.DatePicker}
                        needConfirm={false}
                      />
                      <p className="text-[11px] text-amber-700 font-medium italic flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Bài viết sẽ tự động hiển thị công khai khi tới thời điểm này.</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <label className="font-bold text-slate-700 text-xs block mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-red-600" />
                      <span>Hashtags Thẻ Bài Viết (Tùy chọn)</span>
                    </span>
                    {articleTags.length > 0 && (
                      <span className="text-[10px] font-mono text-red-600 font-bold bg-red-50 border border-red-200/60 px-2 py-0.5 rounded-full">
                        {articleTags.length} thẻ
                      </span>
                    )}
                  </label>
                  <Select
                    mode="tags"
                    tokenSeparators={[',']}
                    value={articleTags}
                    onChange={(newTags) => {
                      const cleaned = (newTags as string[])
                        .flatMap((t) => t.split(','))
                        .map((t) => t.trim().replace(/^#+/, ''))
                        .filter(Boolean);
                      setArticleTags(Array.from(new Set(cleaned)));
                    }}
                    placeholder="Gõ từ khóa rồi nhấn Enter (hoặc dấu phẩy)..."
                    className="w-full text-xs font-bold"
                    open={false}
                    tagRender={(props) => {
                      const { label, closable, onClose } = props;
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200/80 text-[#D90429] text-xs font-bold mr-1.5 my-1 shadow-2xs">
                          <span>#{label}</span>
                          {closable && (
                            <span
                              onClick={onClose}
                              className="inline-flex items-center justify-center cursor-pointer text-red-500 hover:text-red-800 transition-colors ml-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </span>
                      );
                    }}
                    options={[]}
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5 italic">
                    Gõ cụm từ rồi nhấn <strong>Enter</strong> để tạo thẻ hashtag badge. Để xóa thẻ, bấm biểu tượng (×).
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>Bài Viết Nổi Bật (Trang chủ)</span>
                    </span>
                    <Switch
                      checked={isFeatured}
                      onChange={(checked) => setIsFeatured(checked)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Insert Hyperlink Modal */}
        <Modal
          open={showLinkModal}
          onCancel={() => setShowLinkModal(false)}
          onOk={handleConfirmInsertLink}
          title={
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
              <LinkIcon className="w-4 h-4 text-[#D90429]" />
              <span>Chèn Đường Dẫn Liên Kết (Hyperlink)</span>
            </div>
          }
          okText="Chèn Liên Kết"
          cancelText="Hủy Bỏ"
          okButtonProps={{ className: 'bg-[#D90429] hover:bg-red-700 font-bold rounded-xl' }}
          cancelButtonProps={{ className: 'rounded-xl font-bold' }}
        >
          <div className="space-y-4 py-2 font-sans">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Văn Bản Hiển Thị (Anchor Text):
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Ví dụ: Xem chi tiết sản phẩm"
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Đường Dẫn URL:
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
              />
            </div>
          </div>
        </Modal>


        {/* FULLSCREEN ZEN FOCUS MODE OVERLAY */}
        {isZenMode && (
          <div className="fixed inset-0 z-[180] bg-slate-950/95 backdrop-blur-xl flex flex-col p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200 font-sans">
            {/* Zen Top Header */}
            <div className="w-full max-w-6xl mx-auto bg-slate-900 text-white rounded-2xl p-3.5 mb-3 border border-slate-800 shadow-2xl flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                <div>
                  <h3 className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2 tracking-tight">
                    <span>CHẾ ĐỘ TẬP TRUNG VIẾT BÀI (ZEN FOCUS MODE)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                    Soạn thảo rộng rãi toàn màn hình, loại bỏ mọi phân tâm. Nhấn ESC hoặc nút bên phải để thoát.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Realtime Stats Badge */}
                <div className="hidden md:flex items-center gap-3 text-xs font-mono font-bold text-slate-300 bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700/60">
                  <span>{stats.words.toLocaleString()} từ</span>
                  <span className="text-slate-600">•</span>
                  <span>~{stats.readingTimeMinutes} phút đọc</span>
                  <span className="text-slate-600">•</span>
                  <span>{stats.charCount.toLocaleString()} ký tự</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsZenMode(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  title="Thoát chế độ tập trung (ESC)"
                >
                  <Minimize2 className="w-4 h-4 text-slate-400" />
                  <span>Thoát Tập Trung (ESC)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang Lưu...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Lưu Bài Viết</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main Spacious Writing Canvas Paper Card */}
            <div className="w-full max-w-6xl mx-auto flex-1 bg-white rounded-2xl border border-slate-700/40 shadow-2xl flex flex-col overflow-hidden">
              {/* Sticky Rich Formatting Toolbar */}
              <div className="p-3 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => execCmd('bold')}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 font-bold transition-all cursor-pointer"
                    title="In Đậm (Ctrl+B)"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCmd('italic')}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 italic transition-all cursor-pointer"
                    title="In Nghiêng (Ctrl+I)"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCmd('underline')}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 underline transition-all cursor-pointer"
                    title="Gạch Chân (Ctrl+U)"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCmd('strikeThrough')}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 line-through transition-all cursor-pointer"
                    title="Gạch Ngang"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>

                  <div className="h-5 w-px bg-slate-300 mx-1.5" />

                  <button
                    type="button"
                    onClick={() => formatHeading('h1')}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-black text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer shadow-2xs"
                    title="Tiêu đề H1 (Heading 1)"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => formatHeading('h2')}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-black text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer shadow-2xs"
                    title="Tiêu đề H2 (Heading 2)"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => formatHeading('h3')}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer shadow-2xs"
                    title="Tiêu đề H3 (Heading 3)"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => formatHeading('h4')}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer shadow-2xs"
                    title="Tiêu đề H4 (Heading 4)"
                  >
                    H4
                  </button>
                  <button
                    type="button"
                    onClick={() => formatHeading('p')}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-100 cursor-pointer"
                    title="Văn bản thường (Paragraph)"
                  >
                    ¶ Đoạn
                  </button>

                  <div className="h-5 w-px bg-slate-300 mx-1.5" />

                  <button
                    type="button"
                    onClick={() => execCmd('insertUnorderedList')}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                    title="Danh sách Bullets"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCmd('insertOrderedList')}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                    title="Danh sách Số thứ tự"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>

                  <div className="h-5 w-px bg-slate-300 mx-1.5" />

                  <button
                    type="button"
                    onClick={() => execCmd('justifyLeft')}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                    title="Căn Trái"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCmd('justifyCenter')}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                    title="Căn Giữa"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCmd('justifyRight')}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                    title="Căn Phải"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Snippet Block Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={insertSpecTable}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold hover:bg-blue-100 cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Table className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bảng Thông Số</span>
                  </button>

                  <button
                    type="button"
                    onClick={insertZaloCtaCard}
                    className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs font-bold hover:bg-red-100 cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                    <span>Card Zalo Q.BA</span>
                  </button>

                  <button
                    type="button"
                    onClick={insertFaqBlock}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-200 cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-700" />
                    <span>Khối FAQ</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenLinkModal}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-200 cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-slate-700" />
                    <span>Link</span>
                  </button>

                  <label
                    onClick={saveCurrentSelection}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-extrabold hover:bg-red-700 cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    {uploadingInlineImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-white" />
                    )}
                    <span>{uploadingInlineImage ? 'Đang Upload...' : 'Chèn Ảnh'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleInlineImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Zen Title Input Area */}
              <div className="px-8 pt-6 pb-3 border-b border-slate-100 shrink-0">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề bài viết kỹ thuật..."
                  className="w-full text-2xl sm:text-3xl font-black text-slate-900 placeholder:text-slate-300 border-none outline-none focus:ring-0 bg-transparent font-sans"
                />
              </div>

              {/* Zen Content Editor Canvas (Massive Spacious View) */}
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto custom-scrollbar relative bg-white">
                <div
                  ref={zenEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => {
                    isUserEditedRef.current = true;
                    saveCurrentSelection();
                    setContent(e.currentTarget.innerHTML);
                  }}
                  onKeyUp={saveCurrentSelection}
                  onMouseUp={saveCurrentSelection}
                  onFocus={saveCurrentSelection}
                  onSelect={saveCurrentSelection}
                  onBlur={(e) => {
                    saveCurrentSelection();
                    setContent(e.currentTarget.innerHTML);
                  }}
                  onPaste={handleRichPaste}
                  style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                  className="w-full min-h-[500px] h-full font-sans text-slate-800 text-base md:text-lg leading-relaxed article-rich-body focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* HIGH-FIDELITY LIVE PREVIEW MODAL */}
        {showPreview && (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
            {/* Modal Controls Header Bar */}
            <div className="bg-white/95 text-slate-900 w-full max-w-7xl rounded-2xl p-3 mb-2 sm:mb-3 shadow-xl flex items-center justify-between border border-slate-200/90 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-xl bg-red-50 text-[#D90429] flex items-center justify-center border border-red-200/70 shadow-2xs">
                  <Eye className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <span>XEM TRƯỚC GIAO DIỆN BÀI VIẾT</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#D90429] font-mono text-[10px] font-extrabold border border-red-200">
                      Live Render 100%
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                    Mô phỏng hiển thị thực tế của bài viết như trên website
                  </p>
                </div>
              </div>

              {/* Device Mode Switcher Buttons */}
              <div className="flex items-center gap-3">
                <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs font-bold shadow-inner">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${previewDevice === 'desktop'
                      ? 'bg-[#D90429] text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="hidden sm:inline">Máy Tính</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${previewDevice === 'mobile'
                      ? 'bg-[#D90429] text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="hidden sm:inline">Điện Thoại</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-[#D90429] transition-all font-bold flex items-center justify-center cursor-pointer border border-slate-200"
                  title="Đóng xem trước"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* PREVIEW CANVAS AREA */}
            <div className="w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden">
              {previewDevice === 'mobile' ? (
                /* AUTHENTIC MOBILE ARTICLE VIEWPORT */
                <div className="w-full max-w-[430px] h-full max-h-[88vh] bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col shrink-0 min-h-0 overflow-hidden animate-in zoom-in-95 duration-200">
                  {/* Inner Scrollable Viewport */}
                  <div className="w-full flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar p-4 space-y-4 bg-slate-50 text-slate-900">
                    <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 pb-2 border-b border-slate-200/80 flex-wrap">
                      <span>Trang chủ</span>
                      <span>&gt;</span>
                      <span>Cẩm Nang Kỹ Thuật</span>
                    </nav>

                    <article className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                      <div className="space-y-3 pb-3 border-b border-slate-200/80">
                        <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-red-50 text-[#D90429] text-[10px] font-bold uppercase tracking-wider border border-red-200/60">
                          <Sparkles className="w-3 h-3 text-red-600" />
                          <span>{categories.find((c) => c.slug === categorySlug)?.name || 'Cẩm Nang Kỹ Thuật'}</span>
                        </div>

                        <h1 className="text-lg sm:text-xl font-black font-heading text-slate-900 leading-snug">
                          {title || 'Tiêu đề bài viết kỹ thuật phụ tùng Q.BA'}
                        </h1>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                          <div className="w-5.5 h-5.5 rounded-full bg-[#D90429] text-white flex items-center justify-center font-bold text-[9px] shrink-0 shadow-2xs">
                            QBA
                          </div>
                          <span className="font-bold text-slate-800">Ban Quản Lý Q.BA</span>
                          <span>•</span>
                          <span>{new Date().toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbnailUrl || '/images/news-section/news-1.png'}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {leadSummary && (
                        <p className="lead text-slate-700 text-xs sm:text-sm leading-relaxed font-medium italic bg-[#f8fafc] p-3.5 rounded-xl border-l-4 border-[#D90429]">
                          {leadSummary}
                        </p>
                      )}

                      <ArticleContentRenderer content={finalPreviewContent} />

                      {articleTags.length > 0 && (
                        <div className="pt-3 border-t border-slate-200 space-y-2">
                          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                            <Tag className="w-3 h-3 text-[#D90429]" /> THẺ BÀI VIẾT:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {articleTags.map((tag, idx) => (
                              <span key={`prev-m-tag-${idx}`} className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>

                    {/* Zalo Callout Widget on Mobile */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#D90429] to-[#99021C] text-white shadow-md space-y-2.5 text-center">
                      <h4 className="font-black text-xs uppercase text-white">TƯ VẤN BÁO GIÁ HỎA TỐC</h4>
                      <p className="text-[10px] sm:text-xs text-red-100 leading-snug">Gửi số khung (VIN) hoặc hình ảnh phụ tùng qua Zalo nhận báo giá trong 5 phút.</p>
                      <div className="py-2.5 bg-white text-[#D90429] font-black rounded-xl text-xs uppercase tracking-wider block shadow-xs">
                        CHAT ZALO (0903.588.167)
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* AUTHENTIC DESKTOP ARTICLE EDITORIAL VIEWPORT (SPACIOUS MAX-W-7XL) */
                <div className="w-full max-w-7xl h-full max-h-[88vh] bg-white rounded-2xl border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] flex flex-col shrink-0 min-h-0 overflow-hidden animate-in zoom-in-95 duration-200">
                  {/* Inner Scrollable Viewport */}
                  <div className="w-full flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar p-6 sm:p-8 bg-slate-50 text-slate-900">
                    <div className="max-w-7xl mx-auto space-y-5">
                      <nav className="flex items-center gap-2 text-xs font-medium text-slate-600 pb-2 border-b border-slate-200/80 flex-wrap">
                        <span>Trang chủ</span>
                        <span>&gt;</span>
                        <span>Cẩm Nang Kỹ Thuật</span>
                        <span>&gt;</span>
                        <span className="text-slate-900 font-bold truncate max-w-md">{title || 'Tiêu đề bài viết'}</span>
                      </nav>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Main Article Body Column (Col 8) */}
                        <article className="lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                          <div className="space-y-3 pb-5 border-b border-slate-200/80">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#D90429] text-xs font-bold uppercase tracking-wider border border-red-200/60">
                              <Sparkles className="w-3.5 h-3.5 text-red-600" />
                              <span>{categories.find((c) => c.slug === categorySlug)?.name || 'Cẩm Nang Kỹ Thuật'}</span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading text-slate-900 leading-tight">
                              {title || 'Tiêu đề bài viết kỹ thuật phụ tùng Q.BA'}
                            </h1>

                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium pt-1">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-[#D90429] text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs">
                                    QBA
                                  </div>
                                  <span className="font-bold text-slate-900">Ban Quản Lý Q.BA</span>
                                </div>
                                <span>•</span>
                                <span>Đăng: <strong className="text-slate-700">{new Date().toLocaleDateString('vi-VN')}</strong></span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-slate-400" /> 0 lượt xem</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-[11px] uppercase font-mono">CHIA SẺ:</span>
                                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/80 text-[11px] font-bold">Zalo</span>
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/80 text-[11px] font-bold">Facebook</span>
                              </div>
                            </div>
                          </div>

                          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumbnailUrl || '/images/news-section/news-1.png'}
                              alt="Cover Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {leadSummary && (
                            <p className="lead text-slate-700 text-sm sm:text-base leading-relaxed font-medium italic bg-[#f8fafc] p-4 rounded-xl border-l-4 border-[#D90429]">
                              {leadSummary}
                            </p>
                          )}

                          <ArticleContentRenderer content={finalPreviewContent} />

                          {articleTags.length > 0 && (
                            <div className="pt-5 border-t border-slate-200 space-y-2.5">
                              <span className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-[#D90429]" /> THẺ BÀI VIẾT:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {articleTags.map((tag, idx) => (
                                  <span key={`prev-d-tag-${idx}`} className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-[#D90429] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                              Q.BA
                            </div>
                            <div className="space-y-1 text-xs">
                              <h4 className="font-bold text-slate-900 text-sm">Ban Quản Lý Q.BA</h4>
                              <p className="text-slate-600 leading-relaxed">
                                Chuyên gia tra mã catalog & tư vấn phụ tùng xe tải nặng Trung Quốc (HOWO, Weichai, Fast Gear) với 25 năm kinh nghiệm.
                              </p>
                            </div>
                          </div>
                        </article>

                        {/* Right Sidebar Column (Col 4) */}
                        <aside className="lg:col-span-4 space-y-5">
                          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-4 shadow-xs">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#D90429] font-mono flex items-center gap-2 border-b border-slate-200 pb-2.5">
                              <TrendingUp className="w-4 h-4" /> BÀI VIẾT NỔI BẬT
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-start gap-2.5 border-b border-slate-100 pb-2">
                                <span className="text-sm font-black font-heading text-[#D90429] shrink-0">01</span>
                                <span className="font-bold text-xs text-slate-900 leading-snug">Quy trình bảo dưỡng động cơ Weichai WP12 định kỳ</span>
                              </div>
                              <div className="flex items-start gap-2.5">
                                <span className="text-sm font-black font-heading text-[#D90429] shrink-0">02</span>
                                <span className="font-bold text-xs text-slate-900 leading-snug">Hướng dẫn tra mã phụ tùng hộp số Fast Gear xe HOWO</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#D90429] to-[#99021C] text-white shadow-md space-y-3">
                            <h4 className="font-black text-sm uppercase text-white">TƯ VẤN BÁO GIÁ HỎA TỐC</h4>
                            <p className="text-xs text-red-100 leading-relaxed">Gửi số khung (VIN) hoặc hình ảnh phụ tùng qua Zalo nhận báo giá trong 5 phút.</p>
                            <div className="py-2.5 bg-white text-[#D90429] font-black rounded-xl text-xs uppercase tracking-wider text-center shadow-xs">
                              CHAT ZALO (0903.588.167)
                            </div>
                          </div>
                        </aside>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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

      </div>
    </ConfigProvider>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default function AdminNewsEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
          <p className="text-xs font-bold text-slate-600">Đang tải trình soạn thảo bài viết chuẩn SEO...</p>
        </div>
      }
    >
      <NewsEditorContent />
    </Suspense>
  );
}
