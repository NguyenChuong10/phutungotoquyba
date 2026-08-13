'use client';

import { useState } from 'react';
import { Sparkles, FolderPlus, FileText, CornerDownRight } from 'lucide-react';
import { AdminApiService } from '@/services/adminApiService';

interface AddCategoryModalProps {
  parentCategory?: { id: number; name: string } | null;
  editingCategory?: { id: number; name: string; description?: string; parentId?: number | null } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCategoryModal({
  parentCategory,
  editingCategory,
  onClose,
  onSuccess,
}: AddCategoryModalProps) {
  const [name, setName] = useState(editingCategory?.name || '');
  const [description, setDescription] = useState(editingCategory?.description || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSubCategory = !!parentCategory || (editingCategory && !!editingCategory.parentId);
  const isEditing = !!editingCategory;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên danh mục');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isEditing) {
        const res = await AdminApiService.updateCategory(editingCategory.id, {
          name: name.trim(),
          description: description.trim() || undefined,
        });

        if (res.ok) {
          onSuccess();
        } else {
          setErrorMsg(res.message || 'Cập nhật danh mục thất bại');
        }
      } else {
        const res = await AdminApiService.createCategory({
          name: name.trim(),
          parentId: parentCategory ? parentCategory.id : null,
          description: description.trim() || undefined,
        });

        if (res.ok) {
          onSuccess();
        } else {
          setErrorMsg(res.message || 'Tạo danh mục thất bại');
        }
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-red-600" />
              <span>
                {isEditing
                  ? `Sửa ${isSubCategory ? 'Danh Mục Phụ Con' : 'Danh Mục Chính'}`
                  : `Tạo ${isSubCategory ? 'Danh Mục Phụ Con' : 'Danh Mục Chính Mới'}`}
              </span>
            </h3>
            {parentCategory && (
              <p className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                <CornerDownRight className="w-3.5 h-3.5" />
                <span>Trực thuộc danh mục chính: {parentCategory.name}</span>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Tên {isSubCategory ? 'Danh Mục Phụ' : 'Danh Mục Chính'} (*)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isSubCategory ? 'vd: Bộ Piston & Xéc Măng' : 'vd: Động Cơ & Máy Phát'}
              className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-red-600" />
              <span>Mô Tả Danh Mục Phụ Tùng</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập ghi chú chủng loại phụ tùng thuộc nhóm danh mục này..."
              className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-900/30 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Đang lưu...' : isEditing ? 'Cập Nhật' : 'Lưu Danh Mục'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
