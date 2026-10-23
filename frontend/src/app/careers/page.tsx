export const dynamic = 'force-dynamic';

import React from "react";
import { Briefcase, Users, CheckCircle, MapPin, PhoneCall, ChevronRight, Award } from "lucide-react";
import ApplicationForm from "@/components/public/ApplicationForm";
import { API_BASE_URL } from "@/config/api";

export const metadata = {
  title: "Tuyển Dụng Nhân Sự - Phụ Tùng Ô Tô Q.BA Đà Nẵng",
  description: "Tuyển dụng nhân sự phụ tùng xe tải tại Phụ Tùng Ô Tô Q.BA Đà Nẵng. Môi trường chuyên nghiệp, chế độ đãi ngộ hấp dẫn.",
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. Header Hero Banner - Đồng bộ kích thước & phong cách với /products và /about */}
      <section className="bg-[#111317] text-white pt-28 sm:pt-32 md:pt-36 pb-8 md:pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 max-w-[1536px] relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-[11px] font-black tracking-widest uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
            Cơ Hội Nghề Nghiệp Q.BA
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading uppercase tracking-wide leading-tight mb-2 sm:mb-3">
            CƠ HỘI NGHỀ NGHIỆP & <span className="text-brand">TUYỂN DỤNG NHÂN SỰ</span>
          </h1>

          {/* <p className="text-gray-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Môi trường làm việc chuyên nghiệp, thu nhập xứng đáng cùng lộ trình phát triển nghề nghiệp bền vững tại tổng kho phụ tùng xe tải lớn nhất Miền Trung.
          </p> */}
        </div>
      </section>

      {/* 2. Open Job Positions List - Chỉ hiển thị dữ liệu thật từ Database */}
      <section className="py-8 md:py-12 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
              <Briefcase className="w-4 h-4 text-brand" />
              <span>Vị Trí Đang Tuyển Dụng {jobs.length > 0 && `(${jobs.length})`}</span>
            </div>
            <a
              href="#ung-tuyen"
              className="text-xs font-bold text-brand hover:underline"
            >
              Nộp hồ sơ trực tuyến &darr;
            </a>
          </div>

          {jobs.length === 0 ? (
            /* Khi chưa có tin tuyển dụng trong Database */
            <div className="p-8 sm:p-12 rounded-xl bg-white border border-slate-200/90 text-center space-y-3.5 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Briefcase size={26} />
              </div>
              <h2 className="text-base sm:text-lg font-black font-heading text-slate-900 uppercase">
                Hiện Tại Chưa Có Vị Trí Đang Mở Tuyển Dụng Mới
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                Đội ngũ nhân sự Q.BA hiện đang đủ định biên. Bạn vẫn có thể gửi thông tin ứng tuyển hoặc CV qua mẫu bên dưới để lưu hồ sơ ưu tiên cho các đợt tuyển dụng tiếp theo.
              </p>
              {/* <div className="pt-2">
                <a
                  href="#ung-tuyen"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  Gửi Hồ Sơ Ứng Tuyển Dự Bị
                  <ChevronRight size={14} />
                </a>
              </div> */}
            </div>
          ) : (
            /* Danh sách việc làm thật từ Database */
            <div className="space-y-5">
              {jobs.map((job: any, idx: number) => (
                <div
                  key={job.id || `job-card-${idx}`}
                  className="p-6 sm:p-7 md:p-8 rounded-xl bg-white border border-slate-200/90 hover:border-brand/40 shadow-xs hover:shadow-md transition-all duration-200 space-y-5"
                >
                  {/* Header row of Job Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-brand/10 text-brand text-[11px] font-bold uppercase tracking-wider inline-block">
                          {job.type || "Toàn thời gian"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold inline-block border border-emerald-200">
                          Đang nhận hồ sơ
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black font-heading text-slate-900 uppercase">
                        {job.title}
                      </h2>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="text-[11px] text-gray-500 uppercase font-bold block">Mức Lương Dự Kiến</span>
                      <span className="text-lg sm:text-xl font-black text-brand font-heading">
                        {job.salary}
                      </span>
                    </div>
                  </div>

                  {/* Metadata row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-brand shrink-0" />
                      <span><strong>Địa điểm:</strong> {job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={15} className="text-brand shrink-0" />
                      <span><strong>Số lượng:</strong> {job.quantity}</span>
                    </div>
                  </div>

                  {/* Requirements & Responsibilities columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                    <div className="space-y-2.5">
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase flex items-center gap-2">
                        <CheckCircle size={15} className="text-emerald-600" />
                        Yêu Cầu Ứng Viên:
                      </h3>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                        {Array.isArray(job.requirements) && job.requirements.map((req: string, rIdx: number) => (
                          <li key={`req-${idx}-${rIdx}`} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5"></span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2.5">
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase flex items-center gap-2">
                        <Award size={15} className="text-brand" />
                        Mô Tả Quyền Lợi & Công Việc:
                      </h3>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                        {Array.isArray(job.responsibilities) && job.responsibilities.map((res: string, resIdx: number) => (
                          <li key={`res-${idx}-${resIdx}`} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0 mt-1.5"></span>
                            <span>{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer action button */}
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <a
                      href="#ung-tuyen"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                    >
                      Ứng Tuyển Vị Trí Này
                      <ChevronRight size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Application Form Section */}
      <section id="ung-tuyen" className="py-12 md:py-16 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Form: Client Component */}
            <div className="lg:col-span-7">
              <ApplicationForm />
            </div>

            {/* Right Direct HR Contact Box */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-2.5">
                <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 uppercase">
                  HỎI ĐÁP TUYỂN DỤNG <span className="text-brand">Q.BA</span>
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed text-justify">
                  Bạn cần trao đổi trực tiếp thông tin tuyển dụng trước khi nộp hồ sơ? Đừng ngần ngại liên hệ hotline nhân sự hoặc ghé trực tiếp Cửa hàng Phụ Tùng Ô Tô Q.BA tại Đà Nẵng.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <PhoneCall size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase">Hotline Phòng Nhân Sự</h4>
                    <p className="text-base sm:text-lg font-black text-brand mt-0.5">0903.588.167</p>
                    <p className="text-xs text-gray-500">Hỗ trợ hỏi đáp ứng tuyển từ Thứ 2 đến Chủ Nhật</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-gray-700">
                  <div className="flex items-start gap-2">
                    <MapPin size={15} className="text-brand shrink-0 mt-0.5" />
                    <span><strong>Nộp hồ sơ trực tiếp:</strong> 43-45 Nguyễn Văn Tạo, P. An Khê, Q. Thanh Khê, Đà Nẵng</span>
                  </div>
                </div>
              </div>

              {/* Direct Zalo HR Box */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="font-black text-base uppercase">NỘP CV QUA ZALO</h4>
                  <p className="text-xs text-emerald-100 mt-0.5">Gửi trực tiếp thông tin ứng tuyển nhanh</p>
                </div>
                <a 
                  href="https://zalo.me/0903588167" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white text-emerald-800 font-bold rounded-full text-xs uppercase tracking-wider hover:bg-emerald-50 transition-colors shrink-0"
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
