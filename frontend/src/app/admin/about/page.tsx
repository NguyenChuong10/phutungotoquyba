"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { AdminApiService } from "@/services/adminApiService";
import {
  Plus,
  Trash2,
  Save,
  ImageIcon,
  Upload,
  Loader2,
  Layout,
  Store,
  Sparkles,
  GripVertical,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  ChevronsDownUp,
  Zap,
  X,
  Check,
  Lightbulb,
  TrendingUp,
  Search,
  RefreshCw,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import ToastNotification, { ToastMessage } from "@/components/ui/ToastNotification";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { formatImageUrl } from "@/utils/imageHelper";

interface StoryBlock {
  id: string;
  badge: string;
  title: string;
  content: string;
  image: string;
}

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title: string;
  desc: string;
}

/* Fast & Compact Modal Sortable Story Item */
function SortableModalStoryItem({
  story,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: {
  story: StoryBlock;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: story.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition || "transform 180ms ease",
    zIndex: isDragging ? 50 : "auto",
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="p-2.5 rounded-md border-2 border-dashed border-red-500 bg-red-50/60 h-[44px] flex items-center justify-between opacity-80"
      >
        <span className="text-xs font-bold text-red-600">
          Vị trí #{index + 1} (thả tại đây)
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-2.5 rounded-md border border-slate-200/80 bg-white hover:border-red-400/80 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-2 shadow-2xs select-none"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-slate-100 touch-none select-none shrink-0"
          title="Kéo thả để di chuyển vị trí"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <span className="font-extrabold text-[11px] text-slate-400 font-mono shrink-0">
          #{index + 1}
        </span>

        <div className="min-w-0 flex-1 truncate">
          <span className="font-extrabold text-xs text-slate-900 truncate block">
            {story.badge ? `[${story.badge}] ` : ""}
            {story.title || "Mục câu chuyện chưa đặt tiêu đề"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          disabled={isFirst}
          onClick={onMoveUp}
          className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-25 transition-colors cursor-pointer"
          title="Di chuyển lên"
        >
          <ArrowUp size={13} />
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={onMoveDown}
          className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-25 transition-colors cursor-pointer"
          title="Di chuyển xuống"
        >
          <ArrowDown size={13} />
        </button>
      </div>
    </div>
  );
}

/* Fast & Compact Modal Sortable Gallery Item */
function SortableModalGalleryItem({
  img,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: {
  img: GalleryImage;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition || "transform 180ms ease",
    zIndex: isDragging ? 50 : "auto",
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="p-2 rounded-md border-2 border-dashed border-red-500 bg-red-50/60 h-[44px] flex items-center justify-between opacity-80"
      >
        <span className="text-xs font-bold text-red-600">
          Vị trí #{index + 1} (thả tại đây)
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-2 rounded-md border border-slate-200/80 bg-white hover:border-red-400/80 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-2 shadow-2xs select-none"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-slate-100 touch-none select-none shrink-0"
          title="Kéo thả để di chuyển vị trí"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {img.src ? (
          <div className="relative w-8 h-8 rounded border border-slate-200 overflow-hidden shrink-0 bg-slate-100">
            <Image
              src={formatImageUrl(img.src)}
              alt={img.title || "Ảnh gallery"}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center text-slate-400">
            <ImageIcon className="w-4 h-4" />
          </div>
        )}

        <span className="font-extrabold text-[11px] text-slate-400 font-mono shrink-0">
          #{index + 1}
        </span>

        <div className="min-w-0 flex-1 truncate">
          <span className="font-extrabold text-xs text-slate-900 truncate block">
            {img.title || "Hình ảnh chưa đặt tiêu đề"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          disabled={isFirst}
          onClick={onMoveUp}
          className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-25 transition-colors cursor-pointer"
          title="Di chuyển lên"
        >
          <ArrowUp size={13} />
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={onMoveDown}
          className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-25 transition-colors cursor-pointer"
          title="Di chuyển xuống"
        >
          <ArrowDown size={13} />
        </button>
      </div>
    </div>
  );
}

/* Fast & Collapsible Sortable Story Item */
function SortableStoryItem({
  story,
  index,
  isFirst,
  isLast,
  isCollapsed,
  onToggleCollapse,
  onMoveUp,
  onMoveDown,
  onUpdate,
  onDelete,
  onUploadImage,
  uploadingId,
}: {
  story: StoryBlock;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdate: (id: string, field: keyof StoryBlock, value: string) => void;
  onDelete: (id: string) => void;
  onUploadImage: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingId: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: story.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition || "transform 180ms ease",
    zIndex: isDragging ? 50 : "auto",
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="p-3 rounded-lg border-2 border-dashed border-red-500 bg-red-50/60 h-[48px] flex items-center justify-between opacity-80"
      >
        <span className="text-xs font-bold text-red-600">
          Vị trí câu chuyện #{index + 1} (thả tại đây)
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-slate-50/80 rounded-lg border border-slate-200/80 transition-all ${isCollapsed ? "hover:bg-slate-100/80" : ""
        }`}
    >
      {/* Compact Header Bar */}
      <div
        className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer select-none"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-slate-200/60 touch-none select-none shrink-0"
            title="Kéo thả để di chuyển vị trí mục câu chuyện này"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          <span className="font-extrabold text-[11px] text-slate-400 font-mono shrink-0">
            #{index + 1}
          </span>

          <div className="min-w-0 flex-1 truncate">
            <span className="font-extrabold text-xs text-slate-900 truncate">
              {story.badge ? `[${story.badge}] ` : ""}
              {story.title || "Mục câu chuyện chưa đặt tiêu đề"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Quick Step Move Up/Down */}
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            className="p-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 transition-colors cursor-pointer"
            title="Di chuyển lên"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            className="p-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 transition-colors cursor-pointer"
            title="Di chuyển xuống"
          >
            <ArrowDown size={13} />
          </button>

          {/* Toggle Expand/Collapse */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isCollapsed ? "Mở rộng chi tiết" : "Thu gọn"}
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(story.id)}
            className="p-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
            title="Xóa mục câu chuyện"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expandable Form Body */}
      {!isCollapsed && (
        <div className="p-4 pt-2 border-t border-slate-200/60 space-y-3 bg-white/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
            {/* Left Inputs (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Huy Hiệu / Mốc Thời Gian
                  </label>
                  <input
                    type="text"
                    value={story.badge}
                    onChange={(e) => onUpdate(story.id, "badge", e.target.value)}
                    placeholder="Ví dụ: Năm 2001 - Thành Lập"
                    className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Tiêu Đề Mục Câu Chuyện <span className="text-red-600 font-bold">*</span></span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold tracking-normal uppercase">Thẻ H3 - SEO</span>
                  </label>
                  <input
                    type="text"
                    value={story.title}
                    onChange={(e) => onUpdate(story.id, "title", e.target.value)}
                    placeholder="Ví dụ: 25 Năm Đồng Hành Cùng Ngành Vận Tải"
                    className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs font-extrabold text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Nội Dung Mô Tả Chi Tiết <span className="text-red-600 font-bold">*</span></span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-bold tracking-normal uppercase">Nội dung SEO</span>
                </label>
                <textarea
                  rows={3}
                  value={story.content}
                  onChange={(e) => onUpdate(story.id, "content", e.target.value)}
                  placeholder="Nhập nội dung câu chuyện..."
                  className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Right Image Upload (5 cols) */}
            <div className="lg:col-span-5 space-y-2">
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Hình Ảnh Minh Họa (Tùy chọn)
              </label>

              <div className="relative aspect-[16/10] w-full bg-slate-200/80 rounded-md border border-slate-200 overflow-hidden group shadow-2xs">
                {story.image ? (
                  <Image
                    src={formatImageUrl(story.image)}
                    alt={story.title || "Ảnh minh họa"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-7 h-7 mb-1 opacity-40" />
                    <span className="text-[10px] font-bold uppercase">Chưa chọn ảnh</span>
                  </div>
                )}

                <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer z-10">
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    onChange={(e) => onUploadImage(story.id, e)}
                    disabled={uploadingId === story.id}
                  />
                  {uploadingId === story.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mb-1 text-white" />
                      <span className="text-[10px] font-bold">Đang tải lên...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center mb-1">
                        <Upload className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Tải Ảnh Lên</span>
                    </>
                  )}
                </label>
              </div>

              <input
                type="text"
                value={story.image}
                onChange={(e) => onUpdate(story.id, "image", e.target.value)}
                placeholder="URL ảnh minh họa..."
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-mono text-[11px] text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Fast & Smooth Sortable Gallery Card Component */
function SortableGalleryCard({
  img,
  index,
  onUpdate,
  onDelete,
  onUploadImage,
  uploadingId,
}: {
  img: GalleryImage;
  index: number;
  onUpdate: (id: string, field: keyof GalleryImage, value: string) => void;
  onDelete: (id: string) => void;
  onUploadImage: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingId: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition || "transform 180ms ease",
    zIndex: isDragging ? 50 : "auto",
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="aspect-[16/10] rounded-lg border-2 border-dashed border-red-500 bg-red-50/60 flex items-center justify-center opacity-80"
      >
        <span className="text-xs font-bold text-red-600">
          Vị trí #{index + 1}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-2xs hover:border-red-500/50 transition-colors flex flex-col group"
    >
      {/* Image Preview & Drag Handle */}
      <div className="relative aspect-[16/10] bg-slate-100 flex-shrink-0 border-b border-slate-200/60">
        {img.src ? (
          <Image
            src={formatImageUrl(img.src)}
            alt={img.alt || img.title || "Hình ảnh kho hàng Q.BA"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <ImageIcon className="w-8 h-8 mb-1 opacity-40" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Chưa chọn ảnh</span>
          </div>
        )}

        {/* Upload Overlay (Hover) */}
        <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer z-10">
          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            onChange={(e) => onUploadImage(img.id, e)}
            disabled={uploadingId === img.id}
          />
          {uploadingId === img.id ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mb-1 text-white" />
              <span className="text-[10px] font-bold">Đang tải lên...</span>
            </>
          ) : (
            <>
              <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center mb-1">
                <Upload className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Tải Ảnh Lên</span>
            </>
          )}
        </label>

        {/* Handle & Delete Buttons */}
        <div className="absolute top-2 right-2 left-2 flex justify-between items-center z-20 pointer-events-none">
          <div
            {...attributes}
            {...listeners}
            className="p-1 rounded-md bg-white/95 text-slate-700 hover:bg-red-600 hover:text-white flex items-center justify-center shadow-2xs border border-slate-200/60 cursor-grab active:cursor-grabbing pointer-events-auto transition-colors touch-none select-none"
            title="Kéo thả để di chuyển vị trí ảnh này"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          <button
            type="button"
            onClick={() => onDelete(img.id)}
            className="w-6 h-6 rounded-md bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-2xs transition-colors pointer-events-auto cursor-pointer"
            title="Xóa hình ảnh"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="p-3 space-y-2.5 flex-1 flex flex-col bg-white">
        <div>
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5 flex items-center justify-between">
            <span>Tiêu đề ảnh <span className="text-red-600 font-bold">*</span></span>
          </label>
          <input
            type="text"
            value={img.title}
            onChange={(e) => onUpdate(img.id, "title", e.target.value)}
            placeholder="Nhập tiêu đề..."
            className="w-full text-xs font-bold text-slate-900 border-b border-slate-200 focus:border-red-500 focus:outline-none py-1 transition-colors bg-transparent"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5 block">
            Mô tả ngắn
          </label>
          <textarea
            value={img.desc}
            onChange={(e) => onUpdate(img.id, "desc", e.target.value)}
            placeholder="Nhập mô tả..."
            rows={2}
            className="w-full text-[11px] text-slate-700 font-medium bg-slate-50/80 border border-slate-200 rounded-md p-1.5 focus:border-red-500 focus:outline-none transition-colors resize-none leading-snug"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5 flex items-center justify-between">
            <span>Thẻ ALT (SEO) <span className="text-red-600 font-bold">*</span></span>
            <span className="text-[9px] text-red-600 font-bold tracking-normal lowercase">google image</span>
          </label>
          <input
            type="text"
            value={img.alt}
            onChange={(e) => onUpdate(img.id, "alt", e.target.value)}
            placeholder="Văn bản thay thế giúp Google index ảnh..."
            className="w-full text-[11px] text-slate-600 font-medium border-b border-slate-200 focus:border-red-500 focus:outline-none py-0.5 transition-colors bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}

export default function AboutPageAdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingGalleryId, setUploadingGalleryId] = useState<string | null>(null);
  const [uploadingStoryId, setUploadingStoryId] = useState<string | null>(null);
  const [toastState, setToastState] = useState<ToastMessage | null>(null);

  // Collapsed Story State Map
  const [collapsedStories, setCollapsedStories] = useState<Record<string, boolean>>({});

  // Quick Reorder Modal States
  const [isStoryReorderModalOpen, setIsStoryReorderModalOpen] = useState(false);
  const [isGalleryReorderModalOpen, setIsGalleryReorderModalOpen] = useState(false);

  // Delete Confirmation Modal State
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    type: "story" | "gallery";
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: "story",
    id: "",
    name: "",
  });

  // Active Drag Items for Smooth DragOverlay
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [activeGalleryId, setActiveGalleryId] = useState<string | null>(null);

  // General Text & Content Settings
  const [settings, setSettings] = useState({
    aboutHeaderBadge: "Hành Trình 25 Năm Uy Tín",
    aboutHeaderTitle: "GIỚI THIỆU PHỤ TÙNG Ô TÔ Q.BA",
    aboutHeaderSubtitle: "Chuyên cung cấp & phân phối phụ tùng ô tô xe tải nặng, xe ben, xe đầu kéo, rơ-moóc Trung Quốc chính hãng với độ bền vượt trội và giá thành tối ưu nhất thị trường.",
    aboutStorySectionBadge: "Lịch Sử & Uy Tín",
    aboutStorySectionTitle: "25 NĂM ĐỒNG HÀNH CÙNG MỌI CHUYẾN XE VẬN TẢI",
    aboutGallerySectionBadge: "Năng lực thực tế",
    aboutGallerySectionTitle: "HÌNH ẢNH KHO HÀNG & VẬN CHUYỂN",
    aboutGallerySectionDesc: "Hình ảnh thực tế về quy mô lưu trữ, đóng gói kiện thùng gỗ và hoạt động vận chuyển tại Phụ Tùng Ô Tô Q.BA",
  });

  // Story Blocks State
  const [storyBlocks, setStoryBlocks] = useState<StoryBlock[]>([]);

  // Gallery Images Array State
  const [images, setImages] = useState<GalleryImage[]>([]);

  // Sensors for DnD Kit
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await AdminApiService.getSettings();
      if (res.ok && res.data) {
        setSettings((prev) => ({
          ...prev,
          aboutHeaderBadge: res.data.aboutHeaderBadge !== undefined ? res.data.aboutHeaderBadge : prev.aboutHeaderBadge,
          aboutHeaderTitle: res.data.aboutHeaderTitle !== undefined ? res.data.aboutHeaderTitle : prev.aboutHeaderTitle,
          aboutHeaderSubtitle: res.data.aboutHeaderSubtitle !== undefined ? res.data.aboutHeaderSubtitle : prev.aboutHeaderSubtitle,
          aboutStorySectionBadge: res.data.aboutStorySectionBadge !== undefined ? res.data.aboutStorySectionBadge : (res.data.aboutStoryBadge !== undefined ? res.data.aboutStoryBadge : prev.aboutStorySectionBadge),
          aboutStorySectionTitle: res.data.aboutStorySectionTitle !== undefined ? res.data.aboutStorySectionTitle : (res.data.aboutStoryTitle !== undefined ? res.data.aboutStoryTitle : prev.aboutStorySectionTitle),
          aboutGallerySectionBadge: res.data.aboutGallerySectionBadge !== undefined ? res.data.aboutGallerySectionBadge : prev.aboutGallerySectionBadge,
          aboutGallerySectionTitle: res.data.aboutGallerySectionTitle !== undefined ? res.data.aboutGallerySectionTitle : prev.aboutGallerySectionTitle,
          aboutGallerySectionDesc: res.data.aboutGallerySectionDesc !== undefined ? res.data.aboutGallerySectionDesc : prev.aboutGallerySectionDesc,
        }));

        // Load Story Blocks
        if (res.data.aboutStoryBlocks) {
          try {
            const parsedStory = JSON.parse(res.data.aboutStoryBlocks);
            if (Array.isArray(parsedStory)) {
              setStoryBlocks(parsedStory);
            }
          } catch {
            setStoryBlocks([]);
          }
        } else {
          setStoryBlocks([]);
        }

        // Load Gallery Images
        if (res.data.aboutGalleryImages) {
          const parsedGallery = JSON.parse(res.data.aboutGalleryImages);
          if (Array.isArray(parsedGallery)) {
            setImages(parsedGallery);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch about page settings:", error);
      setToastState({
        id: Date.now().toString(),
        type: "error",
        title: "Lỗi Tải Dữ Liệu",
        message: "Không thể tải dữ liệu cấu hình từ máy chủ.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSetting = (field: keyof typeof settings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = async () => {
    // 1. Header Banner Title Validation (H1 Tag)
    if (!settings.aboutHeaderTitle.trim()) {
      setToastState({
        id: Date.now().toString(),
        type: "error",
        title: "Chưa Điền Tiêu Đề Banner (Thẻ H1)",
        message: "Vui lòng nhập Tiêu đề chính Banner (Thẻ H1). Đây là thông tin bắt buộc và rất quan trọng cho SEO!",
      });
      return;
    }

    // 2. Story Blocks Validation (Each item must have Title and Content)
    for (let i = 0; i < storyBlocks.length; i++) {
      const story = storyBlocks[i];
      if (!story.title.trim()) {
        setToastState({
          id: Date.now().toString(),
          type: "error",
          title: `Thiếu Tiêu Đề Mục Câu Chuyện #${i + 1}`,
          message: `Mục câu chuyện #${i + 1} chưa được nhập Tiêu đề. Vui lòng nhập tiêu đề hoặc xóa mục rỗng này trước khi lưu!`,
        });
        return;
      }
      if (!story.content.trim()) {
        setToastState({
          id: Date.now().toString(),
          type: "error",
          title: `Thiếu Nội Dung Chi Tiết Mục #${i + 1}`,
          message: `Mục câu chuyện #${i + 1} chưa được nhập Nội dung chi tiết. Vui lòng điền nội dung hoặc xóa mục rỗng này trước khi lưu!`,
        });
        return;
      }
    }

    // 3. Gallery Images Validation (Each item must have an Image URL/Uploaded file and Title)
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.src.trim()) {
        setToastState({
          id: Date.now().toString(),
          type: "error",
          title: `Thiếu Hình Ảnh ở Khung Ảnh #${i + 1}`,
          message: `Khung ảnh kho hàng #${i + 1} chưa được tải ảnh lên hoặc dán URL. Vui lòng tải ảnh lên hoặc xóa khung rỗng này trước khi lưu!`,
        });
        return;
      }
      if (!img.title.trim()) {
        setToastState({
          id: Date.now().toString(),
          type: "error",
          title: `Thiếu Tiêu Đề Ảnh #${i + 1}`,
          message: `Khung ảnh kho hàng #${i + 1} chưa được nhập Tiêu đề. Vui lòng điền tiêu đề trước khi lưu!`,
        });
        return;
      }
    }

    try {
      setSaving(true);
      // Auto fallback ALT tag for images if empty to protect Image SEO
      const sanitizedImages = images.map((img) => ({
        ...img,
        alt: img.alt.trim() || img.title.trim() || "Phụ Tùng Ô Tô Q.BA Đà Nẵng",
      }));

      const payload = {
        ...settings,
        aboutStoryBlocks: JSON.stringify(storyBlocks),
        aboutGalleryImages: JSON.stringify(sanitizedImages),
      };

      const res = await AdminApiService.updateSettings(payload);

      if (res.ok) {
        setToastState({
          id: Date.now().toString(),
          type: "success",
          title: "Lưu Thành Công",
          message: "Đã kiểm tra & lưu toàn bộ thông tin cấu hình chuẩn SEO!",
        });
        await fetchSettings();
      } else {
        throw new Error(res.message || "Lỗi lưu cấu hình");
      }
    } catch (error: any) {
      setToastState({
        id: Date.now().toString(),
        type: "error",
        title: "Lỗi Lưu Cấu Hình",
        message: error.message || "Không thể kết nối máy chủ.",
      });
    } finally {
      setSaving(false);
    }
  };

  /* Story Blocks Handlers & Collapse Utilities */
  const toggleCollapseStory = (id: string) => {
    setCollapsedStories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const collapseAllStories = () => {
    const next: Record<string, boolean> = {};
    storyBlocks.forEach((s) => {
      next[s.id] = true;
    });
    setCollapsedStories(next);
  };

  const expandAllStories = () => {
    setCollapsedStories({});
  };

  const handleMoveStory = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= storyBlocks.length) return;
    setStoryBlocks(arrayMove(storyBlocks, index, targetIndex));
  };

  const handleAddStory = () => {
    const newStory: StoryBlock = {
      id: `story-${Date.now()}`,
      badge: "",
      title: "",
      content: "",
      image: "",
    };
    setStoryBlocks([...storyBlocks, newStory]);
  };

  const handleDeleteStory = (id: string) => {
    const story = storyBlocks.find((s) => s.id === id);
    setDeleteConfirmState({
      isOpen: true,
      type: "story",
      id,
      name: story?.title || story?.badge || "mục câu chuyện này",
    });
  };

  const handleUpdateStory = (id: string, field: keyof StoryBlock, value: string) => {
    setStoryBlocks(storyBlocks.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleUploadStoryImage = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingStoryId(id);
      const res = await AdminApiService.uploadImage(file);
      const uploadedUrl = res.data?.imageUrl || res.url || res.data?.url;

      if (res.ok && uploadedUrl) {
        setStoryBlocks(storyBlocks.map((s) => (s.id === id ? { ...s, image: uploadedUrl } : s)));
        setToastState({
          id: Date.now().toString(),
          type: "success",
          title: "Upload Tải Ảnh Thành Công",
          message: "Đã cập nhật ảnh câu chuyện!",
        });
      } else {
        throw new Error(res.message || "Lỗi upload ảnh");
      }
    } catch (err: any) {
      setToastState({
        id: Date.now().toString(),
        type: "error",
        title: "Lỗi Upload",
        message: err.message,
      });
    } finally {
      setUploadingStoryId(null);
      e.target.value = "";
    }
  };

  const handleStoryDragStart = (event: DragStartEvent) => {
    setActiveStoryId(String(event.active.id));
  };

  const handleStoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveStoryId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = storyBlocks.findIndex((s) => s.id === active.id);
    const newIndex = storyBlocks.findIndex((s) => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      setStoryBlocks(arrayMove(storyBlocks, oldIndex, newIndex));
    }
  };

  /* Gallery Handlers */
  const handleAddGalleryImage = () => {
    const newImage: GalleryImage = {
      id: `img-${Date.now()}`,
      src: "",
      alt: "",
      title: "",
      desc: "",
    };
    setImages([...images, newImage]);
  };

  const handleDeleteGalleryImage = (id: string) => {
    const img = images.find((i) => i.id === id);
    setDeleteConfirmState({
      isOpen: true,
      type: "gallery",
      id,
      name: img?.title || "hình ảnh này",
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmState.type === "story") {
      setStoryBlocks((prev) => prev.filter((s) => s.id !== deleteConfirmState.id));
      setToastState({
        id: Date.now().toString(),
        type: "success",
        title: "Đã Xóa Mục Câu Chuyện",
        message: "Đã xóa mục khỏi danh sách!",
      });
    } else if (deleteConfirmState.type === "gallery") {
      setImages((prev) => prev.filter((img) => img.id !== deleteConfirmState.id));
      setToastState({
        id: Date.now().toString(),
        type: "success",
        title: "Đã Xóa Hình Ảnh",
        message: "Đã xóa hình ảnh khỏi thư viện kho hàng!",
      });
    }
    setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleUpdateGalleryImage = (id: string, field: keyof GalleryImage, value: string) => {
    setImages(images.map((img) => (img.id === id ? { ...img, [field]: value } : img)));
  };

  const handleUploadGalleryImage = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingGalleryId(id);
      const res = await AdminApiService.uploadImage(file);
      const uploadedUrl = res.data?.imageUrl || res.url || res.data?.url;

      if (res.ok && uploadedUrl) {
        setImages(images.map((img) => (img.id === id ? { ...img, src: uploadedUrl } : img)));
        setToastState({
          id: Date.now().toString(),
          type: "success",
          title: "Upload Tải Ảnh Thành Công",
          message: "Đã cập nhật ảnh kho hàng!",
        });
      } else {
        throw new Error(res.message || "Lỗi upload ảnh");
      }
    } catch (err: any) {
      setToastState({
        id: Date.now().toString(),
        type: "error",
        title: "Lỗi Upload",
        message: err.message,
      });
    } finally {
      setUploadingGalleryId(null);
      e.target.value = "";
    }
  };

  const handleGalleryDragStart = (event: DragStartEvent) => {
    setActiveGalleryId(String(event.active.id));
  };

  const handleGalleryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveGalleryId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      setImages(arrayMove(images, oldIndex, newIndex));
    }
  };

  const activeStoryItem = useMemo(
    () => storyBlocks.find((s) => s.id === activeStoryId) || null,
    [activeStoryId, storyBlocks]
  );

  const activeGalleryItem = useMemo(
    () => images.find((img) => img.id === activeGalleryId) || null,
    [activeGalleryId, images]
  );

  const isAllStoriesCollapsed = useMemo(() => {
    if (storyBlocks.length === 0) return false;
    return storyBlocks.every((s) => Boolean(collapsedStories[s.id]));
  }, [storyBlocks, collapsedStories]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-3" />
        <p className="text-slate-600 font-bold text-xs">Đang tải cấu hình trang Giới Thiệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12">
      <ToastNotification toast={toastState} onClose={() => setToastState(null)} />

      {/* Top Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600" />
            Quản Lý Trang Giới Thiệu
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Tùy chỉnh nội dung Header Banner, Danh sách câu chuyện lịch sử phát triển và Thư viện hình ảnh kho hàng.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <button
            type="button"
            disabled={loading || saving}
            onClick={fetchSettings}
            className="px-3.5 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 border border-slate-200"
            title="Tải lại dữ liệu mới nhất từ máy chủ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-red-600" : ""}`} />
            <span>Làm Mới</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAll}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
          </button>
        </div>
      </div>

      {/* SEO Keywords Suggestion & Warning Box */}
      <div className="bg-amber-50/80 rounded-lg border border-amber-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs sm:text-sm">
          <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Lightbulb size={15} />
          </div>
          <span>Gợi Ý Tối Ưu SEO & Từ Khóa Phổ Biến (Google Search Console)</span>
        </div>

        <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
          Khuyến nghị lồng ghép khéo léo các từ khóa tìm kiếm hàng đầu bên dưới vào <strong>Tiêu đề Banner</strong>, <strong>Mô tả</strong> hoặc <strong>Huy hiệu mốc câu chuyện</strong> để duy trì và gia tăng thứ hạng hiển thị trên Google:
        </p>

        {/* Keywords Badges List */}
        <div className="flex flex-wrap gap-2 pt-0.5">
          <div className="px-2.5 py-1 rounded bg-white border border-amber-300/80 text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5 shadow-2xs">
            <TrendingUp size={12} className="text-amber-600" />
            <span>phụ tùng ô tô đà nẵng</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-white border border-amber-300/80 text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5 shadow-2xs">
            <TrendingUp size={12} className="text-amber-600" />
            <span>phụ tùng xe tải</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-white border border-amber-300/80 text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5 shadow-2xs">
            <TrendingUp size={12} className="text-amber-600" />
            <span>q ba</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-white border border-amber-300/80 text-[11px] font-bold text-slate-800 flex items-center gap-1.5 shadow-2xs">
            <Search size={11} className="text-slate-400" />
            <span>phụ kiện bán tải đà nẵng</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-white border border-amber-300/80 text-[11px] font-bold text-slate-800 flex items-center gap-1.5 shadow-2xs">
            <Search size={11} className="text-slate-400" />
            <span>phụ tùng oto</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-white border border-amber-300/80 text-[11px] font-bold text-slate-800 flex items-center gap-1.5 shadow-2xs">
            <Search size={11} className="text-slate-400" />
            <span>cửa hàng phụ tùng ô tô gần nhất</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-white border border-amber-300/80 text-[11px] font-bold text-slate-800 flex items-center gap-1.5 shadow-2xs">
            <Search size={11} className="text-slate-400" />
            <span>phụ kiện ô tô đà nẵng</span>
          </div>
        </div>
      </div>

      {/* Section 1: Header Banner Settings */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-7 h-7 rounded-md bg-red-50 text-red-600 flex items-center justify-center font-bold shrink-0">
            <Layout className="w-4 h-4" />
          </div>
          <h2 className="font-extrabold text-slate-900 text-xs sm:text-sm">
            1. Banner Trang Giới Thiệu
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Huy Hiệu Nhỏ (Badge Đỉnh Banner)
            </label>
            <input
              type="text"
              value={settings.aboutHeaderBadge}
              onChange={(e) => handleChangeSetting("aboutHeaderBadge", e.target.value)}
              placeholder="Ví dụ: Hành Trình 25 Năm Uy Tín"
              className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Tiêu Đề Chính Banner Header <span className="text-red-600 font-bold">*</span></span>
              <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 text-[10px] font-bold tracking-normal uppercase">Thẻ H1 - SEO</span>
            </label>
            <input
              type="text"
              value={settings.aboutHeaderTitle}
              onChange={(e) => handleChangeSetting("aboutHeaderTitle", e.target.value)}
              placeholder="Ví dụ: GIỚI THIỆU PHỤ TÙNG Ô TÔ Q.BA"
              className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs font-extrabold text-red-600 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Mô Tả Phụ Ngắn Dưới Tiêu Đề Banner <span className="text-red-600 font-bold">*</span></span>
              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold tracking-normal uppercase">SEO Meta Description</span>
            </label>
            <textarea
              rows={2}
              value={settings.aboutHeaderSubtitle}
              onChange={(e) => handleChangeSetting("aboutHeaderSubtitle", e.target.value)}
              placeholder="Nhập đoạn mô tả ngắn giới thiệu..."
              className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 transition-all resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Multi-Story Blocks & Timeline Management */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-red-50 text-red-600 flex items-center justify-center font-bold shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                2. Danh Sách Câu Chuyện & Lịch Sử ({storyBlocks.length} Mục)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Reorder Modal Button */}
            <button
              type="button"
              onClick={() => setIsStoryReorderModalOpen(true)}
              className="px-2.5 py-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-red-200/80 shadow-2xs"
              title="Mở bảng sắp xếp nhanh thứ tự các mục câu chuyện"
            >
              <Zap size={14} className="text-red-600 fill-red-600" />
              <span>Sắp Xếp Nhanh</span>
            </button>

            {/* Collapse All / Expand All Toggle Button */}
            <button
              type="button"
              onClick={isAllStoriesCollapsed ? expandAllStories : collapseAllStories}
              className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title={isAllStoriesCollapsed ? "Mở rộng tất cả các mục" : "Thu gọn tất cả để kéo thả dễ dàng"}
            >
              {isAllStoriesCollapsed ? (
                <>
                  <ChevronsUpDown size={14} className="text-red-600" />
                  <span>Mở Rộng Tất Cả</span>
                </>
              ) : (
                <>
                  <ChevronsDownUp size={14} className="text-slate-600" />
                  <span>Thu Gọn Để Kéo Thả</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleAddStory}
              className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-red-500" />
              <span>Thêm Mục</span>
            </button>
          </div>
        </div>



        {/* Drag & Drop Story Blocks */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleStoryDragStart}
          onDragEnd={handleStoryDragEnd}
        >
          <SortableContext items={storyBlocks.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2.5 pt-1">
              {storyBlocks.map((story, index) => (
                <SortableStoryItem
                  key={story.id}
                  story={story}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === storyBlocks.length - 1}
                  isCollapsed={Boolean(collapsedStories[story.id])}
                  onToggleCollapse={() => toggleCollapseStory(story.id)}
                  onMoveUp={() => handleMoveStory(index, "up")}
                  onMoveDown={() => handleMoveStory(index, "down")}
                  onUpdate={handleUpdateStory}
                  onDelete={handleDeleteStory}
                  onUploadImage={handleUploadStoryImage}
                  uploadingId={uploadingStoryId}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
            {activeStoryItem ? (
              <div className="p-3 rounded-lg bg-white border-2 border-red-600 shadow-2xl flex items-center justify-between opacity-95 scale-[1.01] select-none">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-red-600" />
                  <span className="font-extrabold text-slate-900 text-xs">
                    {activeStoryItem.badge ? `[${activeStoryItem.badge}] ` : ""}{activeStoryItem.title || "Mục câu chuyện"}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-red-600 px-2 py-0.5 rounded bg-red-50 border border-red-200">
                  Đang di chuyển
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Section 3: Warehouse Bento Gallery Section */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-red-50 text-red-600 flex items-center justify-center font-bold shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                3. Thư Viện Hình Ảnh Kho Hàng ({images.length} Ảnh)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsGalleryReorderModalOpen(true)}
              className="px-2.5 py-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-red-200/80 shadow-2xs"
              title="Mở bảng sắp xếp nhanh thứ tự các ảnh trong thư viện"
            >
              <Zap size={14} className="text-red-600 fill-red-600" />
              <span>Sắp Xếp Nhanh</span>
            </button>

            <button
              type="button"
              onClick={handleAddGalleryImage}
              className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-red-500" />
              <span>Thêm Ảnh Mới</span>
            </button>
          </div>
        </div>

        {/* Section Header Labels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Huy Hiệu Phần Thư Viện Ảnh
            </label>
            <input
              type="text"
              value={settings.aboutGallerySectionBadge}
              onChange={(e) => handleChangeSetting("aboutGallerySectionBadge", e.target.value)}
              placeholder="Ví dụ: Năng lực thực tế"
              className="w-full px-3 py-2 rounded-md border border-slate-200 font-bold text-slate-900 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Tiêu Đề Mục Thư Viện Ảnh
            </label>
            <input
              type="text"
              value={settings.aboutGallerySectionTitle}
              onChange={(e) => handleChangeSetting("aboutGallerySectionTitle", e.target.value)}
              placeholder="Ví dụ: HÌNH ẢNH KHO HÀNG & VẬN CHUYỂN"
              className="w-full px-3 py-2 rounded-md border border-slate-200 font-extrabold text-slate-900 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Mô Tả Ngắn Dưới Tiêu Đề
            </label>
            <input
              type="text"
              value={settings.aboutGallerySectionDesc}
              onChange={(e) => handleChangeSetting("aboutGallerySectionDesc", e.target.value)}
              placeholder="Hình ảnh thực tế..."
              className="w-full px-3 py-2 rounded-md border border-slate-200 font-medium text-slate-800 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Drag & Drop Gallery Grid */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleGalleryDragStart}
          onDragEnd={handleGalleryDragEnd}
        >
          <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1">
              {images.map((img, index) => (
                <SortableGalleryCard
                  key={img.id}
                  img={img}
                  index={index}
                  onUpdate={handleUpdateGalleryImage}
                  onDelete={handleDeleteGalleryImage}
                  onUploadImage={handleUploadGalleryImage}
                  uploadingId={uploadingGalleryId}
                />
              ))}

              {/* Add New Button Card */}
              <button
                type="button"
                onClick={handleAddGalleryImage}
                className="bg-slate-50/60 border-2 border-dashed border-slate-200 hover:border-red-500/60 hover:bg-red-50/30 rounded-lg flex flex-col items-center justify-center min-h-[200px] text-slate-400 hover:text-red-600 transition-all group cursor-pointer p-4"
              >
                <div className="w-10 h-10 rounded-md bg-white border border-slate-200 group-hover:border-red-200 flex items-center justify-center shadow-2xs mb-2 group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5 text-slate-600 group-hover:text-red-600" />
                </div>
                <span className="font-extrabold uppercase tracking-wider text-[11px]">Thêm Hình Ảnh Mới</span>
              </button>
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
            {activeGalleryItem ? (
              <div className="aspect-[16/10] rounded-lg border-2 border-red-600 bg-white shadow-2xl overflow-hidden opacity-95 scale-[1.03] flex items-center justify-center relative select-none">
                {activeGalleryItem.src ? (
                  <Image
                    src={formatImageUrl(activeGalleryItem.src)}
                    alt="Active drag image"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xs font-extrabold text-red-600">Đang di chuyển ảnh</span>
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-bold">
                  {activeGalleryItem.title || "Ảnh"}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Quick Reorder Modal for Story Blocks */}
      {isStoryReorderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <Zap size={15} className="fill-red-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Sắp Xếp Nhanh Thứ Tự Câu Chuyện
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Kéo thả hoặc sử dụng nút mũi tên để đổi vị trí mốc thời gian siêu tốc
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStoryReorderModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body with DndContext */}
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2 flex-1 bg-slate-50/30">
              {storyBlocks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-bold">
                  Chưa có mục câu chuyện nào để sắp xếp.
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleStoryDragStart}
                  onDragEnd={handleStoryDragEnd}
                >
                  <SortableContext items={storyBlocks.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {storyBlocks.map((story, index) => (
                        <SortableModalStoryItem
                          key={story.id}
                          story={story}
                          index={index}
                          isFirst={index === 0}
                          isLast={index === storyBlocks.length - 1}
                          onMoveUp={() => handleMoveStory(index, "up")}
                          onMoveDown={() => handleMoveStory(index, "down")}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-bold">
                Tổng cộng {storyBlocks.length} mục câu chuyện
              </span>
              <button
                type="button"
                onClick={() => setIsStoryReorderModalOpen(false)}
                className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Check size={14} className="text-red-500" />
                <span>Hoàn Tất Sắp Xếp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reorder Modal for Gallery Images */}
      {isGalleryReorderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <Zap size={15} className="fill-red-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Sắp Xếp Nhanh Thứ Tự Thư Viện Ảnh
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Kéo thả hoặc sử dụng nút mũi tên để thay đổi vị trí ảnh kho hàng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryReorderModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body with DndContext */}
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2 flex-1 bg-slate-50/30">
              {images.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-bold">
                  Chưa có hình ảnh nào trong thư viện để sắp xếp.
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleGalleryDragStart}
                  onDragEnd={handleGalleryDragEnd}
                >
                  <SortableContext items={images.map((img) => img.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {images.map((img, index) => (
                        <SortableModalGalleryItem
                          key={img.id}
                          img={img}
                          index={index}
                          isFirst={index === 0}
                          isLast={index === images.length - 1}
                          onMoveUp={() => {
                            if (index > 0) setImages(arrayMove(images, index, index - 1));
                          }}
                          onMoveDown={() => {
                            if (index < images.length - 1) setImages(arrayMove(images, index, index + 1));
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-bold">
                Tổng cộng {images.length} hình ảnh
              </span>
              <button
                type="button"
                onClick={() => setIsGalleryReorderModalOpen(false)}
                className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Check size={14} className="text-red-500" />
                <span>Hoàn Tất Sắp Xếp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteConfirmState.isOpen}
        title={deleteConfirmState.type === "story" ? "Xác Nhận Xóa Câu Chuyện" : "Xác Nhận Xóa Hình Ảnh Kho Hàng"}
        message={deleteConfirmState.type === "story" ? "Bạn có chắc chắn muốn xóa mục câu chuyện" : "Bạn có chắc chắn muốn xóa hình ảnh"}
        itemName={deleteConfirmState.name}
        confirmText="Xóa Vĩnh Viễn"
        cancelText="Hủy Bỏ"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
