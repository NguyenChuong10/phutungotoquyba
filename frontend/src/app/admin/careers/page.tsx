'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ToastNotification, { ToastMessage } from '@/components/ui/ToastNotification';
import {
  Briefcase,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Users,
  DollarSign,
  Eye,
  EyeOff,
  PlusCircle,
  X,
  FileText,
} from 'lucide-react';
import { AdminApiService } from '@/services/adminApiService';

export interface JobPostingItem {
  id: number;
  title: string;
  slug: string;
  type: string;
  salary: string;
  location: string;
  quantity: string;
  requirements: string[];
  responsibilities: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState<JobPostingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPostingItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Toàn thời gian');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('43-45 Nguyễn Văn Tạo, Q. Thanh Khê, Đà Nẵng');
  const [quantity, setQuantity] = useState('02 Người');
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Confirm Delete & Toast State
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    id: number | null;
    title: string;
    loading: boolean;
  }>({
    isOpen: false,
    id: null,
    title: '',
    loading: false,
  });

  const [toastState, setToastState] = useState<ToastMessage | null>(null);

  // Fetch Jobs from Database
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminApiService.getAllJobs();
      if (res.ok && Array.isArray(res.data)) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch job postings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Filter Jobs
  const filteredJobs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return jobs;
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.salary.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.type.toLowerCase().includes(q)
    );
  }, [jobs, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingJob(null);
    setTitle('');
    setType('Toàn thời gian');
    setSalary('10.000.000đ - 18.000.000đ');
    setLocation('43-45 Nguyễn Văn Tạo, Q. Thanh Khê, Đà Nẵng');
    setQuantity('02 Người');
    setRequirements(['Am hiểu phụ tùng xe tải nặng Trung Quốc (HOWO, Weichai...)']);
    setResponsibilities(['Báo giá và tư vấn phụ tùng cho khách hàng trực tiếp và qua Zalo']);
    setIsActive(true);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (job: JobPostingItem) => {
    setEditingJob(job);
    setTitle(job.title);
    setType(job.type || 'Toàn thời gian');
    setSalary(job.salary);
    setLocation(job.location);
    setQuantity(job.quantity || '01 Người');
    setRequirements(Array.isArray(job.requirements) && job.requirements.length > 0 ? job.requirements : ['']);
    setResponsibilities(Array.isArray(job.responsibilities) && job.responsibilities.length > 0 ? job.responsibilities : ['']);
    setIsActive(job.isActive);
    setShowModal(true);
  };

  // Requirements Dynamic List Operations
  const handleAddRequirement = () => {
    setRequirements((prev) => [...prev, '']);
  };
  const handleUpdateRequirement = (idx: number, val: string) => {
    setRequirements((prev) => prev.map((item, i) => (i === idx ? val : item)));
  };
  const handleRemoveRequirement = (idx: number) => {
    setRequirements((prev) => prev.filter((_, i) => i !== idx));
  };

  // Responsibilities Dynamic List Operations
  const handleAddResponsibility = () => {
    setResponsibilities((prev) => [...prev, '']);
  };
  const handleUpdateResponsibility = (idx: number, val: string) => {
    setResponsibilities((prev) => prev.map((item, i) => (i === idx ? val : item)));
  };
  const handleRemoveResponsibility = (idx: number) => {
    setResponsibilities((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Job Posting (Create / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !salary.trim() || !location.trim()) {
      alert('Vui lòng nhập đầy đủ Tiêu đề, Mức lương và Địa điểm làm việc!');
      return;
    }

    const cleanedReqs = requirements.map((r) => r.trim()).filter(Boolean);
    const cleanedResps = responsibilities.map((r) => r.trim()).filter(Boolean);

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        type: type.trim(),
        salary: salary.trim(),
        location: location.trim(),
        quantity: quantity.trim(),
        requirements: cleanedReqs,
        responsibilities: cleanedResps,
        isActive,
      };

      if (editingJob) {
        const res = await AdminApiService.updateJob(editingJob.id, payload);
        if (res.ok) {
          setToastState({
            id: String(Date.now()),
            type: 'success',
            title: 'Cập Nhật Thành Công',
            message: `Đã cập nhật vị trí tuyển dụng "${title}"!`,
          });
          setShowModal(false);
          fetchJobs();
        } else {
          alert(res.message || 'Lỗi khi cập nhật tin tuyển dụng');
        }
      } else {
        const res = await AdminApiService.createJob(payload);
        if (res.ok) {
          setToastState({
            id: String(Date.now()),
            type: 'success',
            title: 'Đăng Tin Thành Công',
            message: `Đã đăng tin tuyển dụng mới "${title}"!`,
          });
          setShowModal(false);
          fetchJobs();
        } else {
          alert(res.message || 'Lỗi khi đăng tin tuyển dụng');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Job Active Status
  const handleToggleActive = async (job: JobPostingItem) => {
    try {
      const res = await AdminApiService.updateJob(job.id, { isActive: !job.isActive });
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Thay Đổi Trạng Thái',
          message: `Đã ${!job.isActive ? 'kích hoạt' : 'tạm dừng'} tin "${job.title}"!`,
        });
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Execute Delete
  const handleDeleteClick = (job: JobPostingItem) => {
    setDeleteConfirmState({
      isOpen: true,
      id: job.id,
      title: job.title,
      loading: false,
    });
  };

  const executeDelete = async () => {
    if (!deleteConfirmState.id) return;
    setDeleteConfirmState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await AdminApiService.deleteJob(deleteConfirmState.id);
      if (res.ok) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Xóa Tin Tuyển Dụng Thành Công',
          message: `Đã xóa tin tuyển dụng "${deleteConfirmState.title}" khỏi CSDL!`,
        });
        fetchJobs();
      } else {
        alert(res.message || 'Lỗi khi xóa tin tuyển dụng');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirmState({ isOpen: false, id: null, title: '', loading: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Popup */}
      <ToastNotification toast={toastState} onClose={() => setToastState(null)} />

      {/* Header Banner Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-red-600" />
              <span>Quản Lý Tuyển Dụng Nhân Sự Q.BA</span>
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-600 border border-red-200">
              {jobs.length} Vị Trí
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đăng tin vị trí tuyển dụng, chỉnh sửa yêu cầu ứng viên và theo dõi hồ sơ ứng tuyển real-time
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Đăng Tin Tuyển Dụng Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm vị trí tuyển dụng, mức lương, địa điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-red-600 focus:bg-white transition-all"
          />
        </div>

        <span className="text-xs font-extrabold text-slate-500">
          Hiển thị: <span className="text-slate-900">{filteredJobs.length}</span> vị trí
        </span>
      </div>

      {/* Main Enterprise Jobs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
            <p className="text-xs font-bold">Đang tải danh sách vị trí tuyển dụng...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-extrabold text-slate-800">Chưa có tin tuyển dụng nào</p>
            <p className="text-xs text-slate-500">Bấm "+ Đăng Tin Tuyển Dụng Mới" để tạo vị trí tuyển dụng đầu tiên.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-4 px-5">Vị Trí Tuyển Dụng</th>
                  <th className="py-4 px-4">Mức Lương Dự Kiến</th>
                  <th className="py-4 px-4">Địa Điểm & Số Lượng</th>
                  <th className="py-4 px-4">Hình Thức</th>
                  <th className="py-4 px-4 text-center">Trạng Thái</th>
                  <th className="py-4 px-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <span className="font-extrabold text-slate-900 text-sm block">
                          {job.title}
                        </span>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                          <span>Yêu cầu: {job.requirements?.length || 0} mục</span>
                          <span>•</span>
                          <span>Mô tả: {job.responsibilities?.length || 0} mục</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-extrabold text-red-600 text-xs bg-red-50 px-2.5 py-1 rounded-lg border border-red-200/60 inline-block">
                        {job.salary}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Cần tuyển: <strong>{job.quantity}</strong></span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-700">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px]">
                        {job.type}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(job)}
                        className={`px-3 py-1 rounded-full text-[11px] font-black border cursor-pointer transition-all ${
                          job.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Bấm để ẩn/hiện tin tuyển dụng"
                      >
                        {job.isActive ? '🟢 Đang Tuyển' : '⚪ Tạm Dừng'}
                      </button>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(job)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Chỉnh sửa tin tuyển dụng"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(job)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors cursor-pointer"
                          title="Xóa tin tuyển dụng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT JOB POSTING MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col justify-between my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-red-600" />
                  <span>{editingJob ? 'Chỉnh Sửa Tin Tuyển Dụng' : 'Đăng Tin Tuyển Dụng Mới'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Điền đầy đủ vị trí, mức lương, yêu cầu và mô tả công việc để hiển thị công khai trên website Q.BA
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-1 flex-1">
              {/* Row 1: Title & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8">
                  <label className="font-extrabold text-slate-800 text-xs block mb-1.5">
                    Tiêu Đề Vị Trí Tuyển Dụng (*)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: NHÂN VIÊN KINH DOANH PHỤ TÙNG XE TẢI"
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 uppercase focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="font-extrabold text-slate-800 text-xs block mb-1.5">
                    Hình Thức Làm Việc
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-red-600 cursor-pointer"
                  >
                    <option value="Toàn thời gian">Toàn thời gian</option>
                    <option value="Bán thời gian">Bán thời gian</option>
                    <option value="Thực tập sinh">Thực tập sinh</option>
                    <option value="Thời vụ / Dự án">Thời vụ / Dự án</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Salary, Quantity & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-5">
                  <label className="font-extrabold text-slate-800 text-xs block mb-1.5">
                    Mức Lương Dự Kiến (*)
                  </label>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="Ví dụ: 12.000.000đ - 25.000.000đ + % Hoa hồng"
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-extrabold text-red-600 focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="font-extrabold text-slate-800 text-xs block mb-1.5">
                    Số Lượng Tuyển Dụng
                  </label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Ví dụ: 03 Người"
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="font-extrabold text-slate-800 text-xs block mb-1.5">
                    Trạng Thái Tin
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 accent-red-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      {isActive ? 'Đang tuyển' : 'Tạm dừng'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Row 3: Location */}
              <div>
                <label className="font-extrabold text-slate-800 text-xs block mb-1.5">
                  Địa Điểm Làm Việc (*)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ví dụ: 43-45 Nguyễn Văn Tạo, Q. Thanh Khê, Đà Nẵng"
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              {/* Section 4: Dynamic Requirements List */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Yêu Cầu Ứng Viên ({requirements.length} mục)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Yêu Cầu</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {requirements.map((req, rIdx) => (
                    <div key={`req-input-${rIdx}`} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-extrabold shrink-0">
                        {rIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => handleUpdateRequirement(rIdx, e.target.value)}
                        placeholder={`Mục yêu cầu #${rIdx + 1}...`}
                        className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs font-medium bg-white focus:outline-none focus:border-red-600"
                      />
                      {requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(rIdx)}
                          className="p-2 text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Xóa dòng yêu cầu này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Dynamic Responsibilities List */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-red-600" />
                    <span>Mô Tả Công Việc / Trách Nhiệm ({responsibilities.length} mục)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddResponsibility}
                    className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Mô Tả</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {responsibilities.map((res, resIdx) => (
                    <div key={`res-input-${resIdx}`} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-extrabold shrink-0">
                        {resIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={res}
                        onChange={(e) => handleUpdateResponsibility(resIdx, e.target.value)}
                        placeholder={`Mục mô tả công việc #${resIdx + 1}...`}
                        className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs font-medium bg-white focus:outline-none focus:border-red-600"
                      />
                      {responsibilities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveResponsibility(resIdx)}
                          className="p-2 text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Xóa dòng mô tả này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingJob ? 'Lưu Cập Nhật' : 'Đăng Tin Tuyển Dụng'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={deleteConfirmState.isOpen}
        title="Xóa Vị Trí Tuyển Dụng"
        message="Bạn có chắc chắn muốn xóa vị trí tuyển dụng này khỏi hệ thống tin tuyển dụng Q.BA?"
        itemName={deleteConfirmState.title}
        confirmText="Xác Nhận Xóa"
        cancelText="Hủy Bỏ"
        isLoading={deleteConfirmState.loading}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmState({ isOpen: false, id: null, title: '', loading: false })}
      />
    </div>
  );
}
