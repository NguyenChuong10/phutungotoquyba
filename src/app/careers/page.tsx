import React from "react";
import { Briefcase, Award, TrendingUp, Users, ShieldCheck, MapPin, DollarSign, Clock, CheckCircle, PhoneCall } from "lucide-react";
import ApplicationForm from "@/components/ApplicationForm";

export const metadata = {
  title: "Tuyển Dụng Nhân Sự - Phụ Tùng Ô Tô Q.BA Đà Nẵng",
  description: "Tuyển dụng Nhân viên Kinh doanh phụ tùng xe tải, Kỹ thuật viên tra Catalog & Thủ kho phụ tùng tại Phụ Tùng Ô Tô Q.BA Đà Nẵng. Thu nhập 12-25 triệu + Hoa hồng hấp dẫn.",
};

const benefits = [
  {
    icon: DollarSign,
    title: "THU NHẬP HẤP DẪN & HOA HỒNG UNLIMITED",
    desc: "Lương cứng cạnh tranh theo năng lực + Thưởng % hoa hồng doanh số bán lẻ & hợp đồng fleet xe tải không giới hạn."
  },
  {
    icon: TrendingUp,
    title: "ĐÀO TẠO TRA CATALOG NHÀ MÁY BÀI BẢN",
    desc: "Được làm việc trực tiếp với chuyên gia 25 năm am hiểu mã phụ tùng HOWO, Shacman, FAW, Weichai, Fast Gear."
  },
  {
    icon: Users,
    title: "MÔI TRƯỜNG THÂN THIỆN & ỔN ĐỊNH LÂU DÀI",
    desc: "Công việc lâu dài tại trung tâm Đà Nẵng, phụ cấp ăn trưa, chế độ BHXH, thưởng ngày Lễ/Tết và lương tháng 13 đầy đủ."
  }
];

const jobs = [
  {
    title: "NHÂN VIÊN KINH DOANH PHỤ TÙNG XE TẢI",
    salary: "12.000.000đ - 25.000.000đ + % Hoa hồng",
    location: "43-45 Nguyễn Văn Tạo, Q. Thanh Khê, Đà Nẵng",
    quantity: "03 Người",
    type: "Toàn thời gian",
    requirements: [
      "Am hiểu hoặc từng bán phụ tùng xe tải nặng Trung Quốc (HOWO, Shacman, FAW, Dongfeng...)",
      "Có khả năng giao tiếp tốt với chủ xe, tài xế, chủ garage và đơn vị vận tải",
      "Nhanh nhẹn, trung thực, có tinh thần trách nhiệm cao với công việc",
      "Có kỹ năng tra cứu mã sản phẩm cơ bản là một lợi thế"
    ],
    responsibilities: [
      "Báo giá và tư vấn bán lẻ/bán sỉ phụ tùng cho khách hàng trực tiếp và qua Zalo/Điện thoại",
      "Chăm sóc danh sách garage, hạm đội xe ben, xe đầu kéo khu vực Miền Trung & Tây Nguyên",
      "Phối hợp với kho hàng chuẩn bị đơn hàng gửi xe toàn quốc"
    ]
  },
  {
    title: "KỸ THUẬT VIÊN TRA CATALOG & MÃ PHỤ TÙNG",
    salary: "10.000.000đ - 18.000.000đ",
    location: "43-45 Nguyễn Văn Tạo, Q. Thanh Khê, Đà Nẵng",
    quantity: "02 Người",
    type: "Toàn thời gian",
    requirements: [
      "Tốt nghiệp Chuyên ngành Ô tô hoặc có 1 năm kinh nghiệm tra cứu catalog kỹ thuật",
      "Thành thạo phần mềm tra mã Sinotruk, Weichai, Yuchai, Fast Gear",
      "Cẩn thận, chính xác 100% trong việc soi mã phụ tùng cơ khí"
    ],
    responsibilities: [
      "Tiếp nhận số khung (VIN), mã động cơ từ khách hàng để xuất mã phụ tùng chính xác",
      "Đảm bảo tư vấn đúng thông số kỹ thuật (lá lót, phớt, chạt tay gạt, bộ rơ-moóc...)",
      "Cập nhật dữ liệu danh mục phụ tùng mới nhập kho"
    ]
  },
  {
    title: "THỦ KHO & QUẢN LÝ KIỆN HÀNG PHỤ TÙNG",
    salary: "9.000.000đ - 14.000.000đ",
    location: "43-45 Nguyễn Văn Tạo, Q. Thanh Khê, Đà Nẵng",
    quantity: "02 Người",
    type: "Toàn thời gian",
    requirements: [
      "Sức khỏe tốt, chịu khó, cẩn thận trong việc sắp xếp hàng hóa phụ tùng nặng",
      "Trung thực, có kinh nghiệm quản lý kho hàng cơ khí/ô tô là một lợi thế",
      "Biết đóng gói thùng gỗ, cố định kiện hàng chịu lực"
    ],
    responsibilities: [
      "Quản lý nhập - xuất - tồn kho phụ tùng xe tải Q.BA",
      "Đóng gói hàng hóa chắc chắn và giao gửi chành xe toàn quốc đúng tiến độ",
      "Kiểm kê hàng định kỳ cùng bộ phận kế toán"
    ]
  }
];

export default function CareersPage() {
  return (
    <div>

      {/* 1. Header Banner */}
      <section className="bg-[#111317] text-white pt-32 md:pt-40 pb-16 md:pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-black tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
            Tuyển Dụng Nhân Sự Q.BA 2026
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black font-heading uppercase tracking-wide leading-tight mb-6">
            GIA NHẬP ĐỘI NGŨ <span className="text-brand">PHỤ TÙNG Ô TÔ Q.BA</span>
          </h1>

          <p className="text-gray-300 text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            Cùng đồng hành với thương hiệu 25 năm uy tín cung ứng phụ tùng xe tải nặng hàng đầu tại Đà Nẵng, Miền Trung và Tây Nguyên.
          </p>
        </div>
      </section>

      {/* 2. 3 Benefits Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={`benefit-card-${idx}`}
                  className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-lg hover:border-brand/40 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-colors duration-300 shadow-sm">
                    <IconComp size={26} />
                  </div>
                  <h3 className="text-base font-black font-heading text-slate-900 uppercase tracking-wider mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Open Job Positions List */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-brand" />
              Cơ Hội NGHỀ NGHIỆP HOT
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-heading uppercase text-slate-900">
              VỊ TRÍ ĐANG <span className="text-brand">TUYỂN DỤNG</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Làm việc tại Cửa hàng Phụ Tùng Ô Tô Q.BA Đà Nẵng (43-45 Nguyễn Văn Tạo) với mức thu nhập hấp dẫn.
            </p>
          </div>

          <div className="space-y-8">
            {jobs.map((job, idx) => (
              <div 
                key={`job-card-${idx}`}
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
                      {job.requirements.map((req, rIdx) => (
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
                      {job.responsibilities.map((res, resIdx) => (
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
        </div>
      </section>

      {/* 4. Application Form Section */}
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
                    <p className="text-xs text-gray-500 mt-1">Hỗ trợ hỏi đáp ứng tuyển 07:00 - 17:00 hàng ngày</p>
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
