export const dynamic = 'force-dynamic';

import { Briefcase, Users, CheckCircle, MapPin, PhoneCall } from "lucide-react";
import ApplicationForm from "@/components/public/ApplicationForm";
import { API_BASE_URL } from "@/config/api";

export const metadata = {
  title: "Tuyển Dụng Nhân Sự - Phụ Tùng Ô Tô Q.BA Đà Nẵng",
  description: "Tuyển dụng Nhân viên Kinh doanh phụ tùng xe tải, Kỹ thuật viên tra Catalog & Thủ kho phụ tùng tại Phụ Tùng Ô Tô Q.BA Đà Nẵng. Thu nhập 12-25 triệu + Hoa hồng hấp dẫn.",
};

async function getJobPostings() {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch (err) {
    console.error("Failed to fetch jobs from API:", err);
  }
  return [];
}

export default async function CareersPage() {
  const jobs = await getJobPostings();

  return (
    <div>
      {/* 1. Open Job Positions List */}
      <section className="pt-32 md:pt-40 pb-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-brand" />
              Cơ Hội NGHỀ NGHIỆP HOT
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-heading uppercase text-slate-900">
              VỊ TRÍ ĐANG <span className="text-brand">TUYỂN DỤNG</span>
            </h2>
          </div>

          {jobs.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-900">Hiện Tại Chưa Có Vị Trí Tuyển Dụng Mới</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Quý ứng viên có thể nộp CV trực tiếp qua Zalo phòng Nhân sự hoặc nộp hồ sơ tại cửa hàng Q.BA Đà Nẵng để lưu thông tin khi có đợt tuyển mới.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {jobs.map((job: any, idx: number) => (
              <div 
                key={job.id || `job-card-${idx}`}
                className="p-8 md:p-10 rounded-3xl bg-slate-50 border border-slate-200/90 hover:border-brand/50 shadow-xl transition-all duration-300 space-y-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider inline-block mb-2">
                      {job.type}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 uppercase">
                      {job.title}
                    </h3>
                  </div>

                  <div className="lg:text-right shrink-0">
                    <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Mức Lương Dự Kiến</span>
                    <span className="text-xl sm:text-2xl font-black text-brand font-heading">
                      {job.salary}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-brand shrink-0" />
                    <span><strong>Địa điểm:</strong> {job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-brand shrink-0" />
                    <span><strong>Số lượng:</strong> {job.quantity}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm uppercase flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-600" />
                      Yêu Cầu Ứng Viên:
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                      {Array.isArray(job.requirements) && job.requirements.map((req: string, rIdx: number) => (
                        <li key={`req-${idx}-${rIdx}`} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5"></span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm uppercase flex items-center gap-2">
                      <Briefcase size={16} className="text-brand" />
                      Mô Tả Công Việc:
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                      {Array.isArray(job.responsibilities) && job.responsibilities.map((res: string, resIdx: number) => (
                        <li key={`res-${idx}-${resIdx}`} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0 mt-1.5"></span>
                          <span>{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Form: Client Component */}
            <div className="lg:col-span-7">
              <ApplicationForm />
            </div>

            {/* Right Direct HR Contact Box */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-black font-heading text-slate-900 uppercase">
                  HỎI ĐÁP TUYỂN DỤNG <span className="text-brand">Q.BA</span>
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed text-justify">
                  Bạn cần trao đổi trực tiếp thông tin tuyển dụng trước khi nộp hồ sơ? Đừng ngần ngại liên hệ hotline nhân sự hoặc ghé trực tiếp Cửa hàng Phụ Tùng Ô Tô Q.BA tại Đà Nẵng.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <PhoneCall size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase">Hotline Phòng Nhân Sự</h4>
                    <p className="text-lg font-black text-brand mt-1">0903.588.167</p>
                    <p className="text-xs text-gray-500 mt-1">Hỗ trợ hỏi đáp ứng tuyển từ Thứ 2 đến Chủ Nhật</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-3 text-xs sm:text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-brand shrink-0" />
                    <span><strong>Nộp hồ sơ trực tiếp:</strong> 43-45 Nguyễn Văn Tạo, P. An Khê, Q. Thanh Khê, Đà Nẵng</span>
                  </div>
                </div>
              </div>

              {/* Direct Zalo HR Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl flex items-center justify-between">
                <div>
                  <h4 className="font-black text-lg uppercase">NỘP CV QUA ZALO</h4>
                  <p className="text-xs text-emerald-100 mt-1">Gửi trực tiếp thông tin ứng tuyển nhanh</p>
                </div>
                <a 
                  href="https://zalo.me/0903588167" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-white text-emerald-800 font-bold rounded-full text-xs uppercase tracking-wider hover:bg-emerald-50 transition-colors shrink-0"
                >
                  GỬI ZALO
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
