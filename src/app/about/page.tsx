import React from "react";
import Image from "next/image";
import { ShieldCheck, Truck, Package, Award, Phone, ArrowRight, MapPin } from "lucide-react";


export const metadata = {
  title: "Giới Thiệu - Phụ Tùng Ô Tô Q.BA | 25 Năm Uy Tín Hàng Đầu",
  description: "Tìm hiểu về Phụ Tùng Ô Tô Q.BA - Đơn vị 25 năm kinh nghiệm phân phối phụ tùng xe ben, xe đầu kéo, xe tải Trung Quốc chuẩn OEM tại Đà Nẵng và miền Trung.",
};

const warehouseImages = [
  {
    src: "/images/about/kho-hang-1.png",
    alt: "Kệ hàng phụ tùng quy chuẩn Q.BA",
    title: "Kho linh kiện đa dạng",
    desc: "10.000+ chủng loại phụ tùng luôn sẵn kho đáp ứng ngay mọi tiến độ sửa chữa"
  },
  {
    src: "/images/about/kho-hang-2.png",
    alt: "Cửa hàng Phụ Tùng Q.BA và nhân viên kỹ thuật",
    title: "Đội ngũ 25 năm kinh nghiệm",
    desc: "Tư vấn kỹ thuật chuẩn xác theo đúng mã phụ tùng của từng dòng xe"
  },
  {
    src: "/images/about/kho-hang-3.png",
    alt: "Kiện thùng gỗ hàng nhập khẩu chính ngạch Q.BA",
    title: "Hàng nhập khẩu chính ngạch",
    desc: "Đóng gói nguyên đai nguyên kiện thùng gỗ từ nhà máy uy tín Trung Quốc"
  },
  {
    src: "/images/about/kho-hang-4.png",
    alt: "Kệ hàng linh kiện lưu trữ quy mô lớn",
    title: "Lưu trữ quy chuẩn",
    desc: "Bảo quản phụ tùng trong môi trường khô ráo, chống gỉ sét tuyệt đối"
  },
  {
    src: "/images/about/kho-hang-5.png",
    alt: "Kho chi tiết linh kiện ron phớt tay gạt Q.BA",
    title: "Linh kiện làm kín & phụ trợ",
    desc: "Đầy đủ các bộ phớt, lá lót, chạt tay gạt, gioăng máy chất lượng cao"
  },
  {
    src: "/images/about/giao-hang-van-chuyen.jpg",
    alt: "Đội xe vận chuyển giao hàng hỏa tốc Q.BA",
    title: "Vận chuyển hỏa tốc",
    desc: "Giao hàng tận nơi tại Đà Nẵng và đóng gói gửi hàng toàn quốc"
  }
];

const qualityCommitments = [
  {
    number: "01",
    title: "Nhập khẩu trực tiếp",
    desc: "Nguồn hàng nhập thẳng từ các tập đoàn phụ tùng uy tín (Weichai, Sinotruk, Fast Gear, Bosch, Yuchai)."
  },
  {
    number: "02",
    title: "Tư vấn đúng mã chuẩn xác",
    desc: "Tra cứu catalog nhà máy theo số khung, mã động cơ, đảm bảo lắp ráp vừa vặn 100%."
  },
  {
    number: "03",
    title: "Cam kết hàng chuẩn loại 1",

    desc: "Chỉ phân phối dòng phụ tùng loại 1 cao cấp, vật liệu chịu tải siêu trường siêu trọng."
  },
  {
    number: "04",
    title: "Đóng gói kiện gỗ bảo vệ",
    desc: "Hàng nặng (hộp số, trục cầu, ty ben) được cố định thùng gỗ chắc chắn tránh móp méo va đập."
  },
  {
    number: "05",
    title: "Bảo hành & Hỗ trợ kỹ thuật",
    desc: "Chính sách đổi trả minh bạch, đồng hành cùng chủ xe trong suốt quá trình vận hành."
  }
];

export default function AboutPage() {
  return (
    <div>
      
      {/* 1. Header Banner */}
      <section className="bg-[#111317] text-white pt-32 md:pt-40 pb-16 md:pb-24 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-black tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
            Hành Trình 25 Năm Uy Tín
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black font-heading uppercase tracking-wide leading-tight mb-6">
            GIỚI THIỆU <span className="text-brand">PHỤ TÙNG Ô TÔ Q.BA</span>
          </h1>

          <p className="text-gray-300 text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            Chuyên cung cấp & phân phối phụ tùng ô tô xe tải nặng, xe ben, xe đầu kéo, rơ-moóc Trung Quốc chính hãng với độ bền vượt trội và giá thành tối ưu nhất thị trường.
          </p>
        </div>
      </section>

      {/* 2. Main Story & Storefront Image */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Story Text */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-100 border border-slate-200 text-slate-800 text-xs font-extrabold uppercase tracking-wider">
                <Award className="w-4 h-4 text-brand" />
                Thương hiệu uy tín từ 2001
              </div>

              <h2 className="text-3xl sm:text-4xl font-black font-heading text-[#111317] uppercase leading-tight">
                25 NĂM ĐỒNG HÀNH CÙNG <br />
                <span className="text-brand">MỌI CHUYẾN XE VẬN TẢI</span>
              </h2>

              <p className="text-gray-700 leading-relaxed text-base md:text-lg text-justify">
                Ngành công nghiệp ô tô đóng vai trò huyết mạch trong sự vươn mình của nền kinh tế hiện đại. Tại <strong className="text-brand font-black">Q.BA</strong>, với 25 năm kinh nghiệm làm việc chuyên sâu với các chủng loại phụ tùng xe tải Trung Quốc (HOWO, SHACMAN, FAW, DONGFENG, WEICHAI, YUCHAI, CUMMINS...), chúng tôi tự tin phục vụ mọi cá nhân và doanh nghiệp bằng chất lượng thực giá trị thực.
              </p>

              <p className="text-gray-700 leading-relaxed text-base md:text-lg text-justify">
                Nằm tại trung tâm giao thương Đà Nẵng (43-45 Nguyễn Văn Tạo), <strong className="text-brand font-black">Q.BA</strong> sở hữu kho linh kiện quy mô lớn, sẵn sàng đáp ứng hỏa tốc nhu cầu thay thế, đại tu động cơ, hộp số, khung gầm cho các đơn vị vận tải trên khắp miền Trung, Tây Nguyên và toàn quốc.
              </p>


              {/* Highlight Badges */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase">Cam kết chất lượng</h4>

                    <p className="text-xs text-gray-600">Hàng chuẩn loại 1 cao cấp</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <Truck className="w-8 h-8 text-brand shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase">Gửi Hàng Toàn Quốc</h4>
                    <p className="text-xs text-gray-600">Gửi hàng toàn quốc</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Storefront Image */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 group">
                <div className="relative aspect-[4/3] w-full">
                  <Image 
                    src="/images/about/mat-tien-cua-hang.jpg" 
                    alt="Cửa Hàng Phụ Tùng Ô Tô Q.BA tại 43-45 Nguyễn Văn Tạo Đà Nẵng" 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                </div>

                {/* Floating Location Card */}
                <div className="absolute bottom-6 left-6 right-6 p-4 md:p-6 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111317] text-sm md:text-base uppercase">CỬA HÀNG PHỤ TÙNG Q.BA</h4>
                      <p className="text-xs md:text-sm text-gray-600">43-45 Nguyễn Văn Tạo, An Khê, Thanh Khê, Đà Nẵng</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* 4. Real Warehouse Bento Grid Gallery */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-extrabold uppercase tracking-widest">
              <Package className="w-4 h-4" />
              Năng lực thực tế
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-heading text-[#111317] uppercase tracking-wider">
              HÌNH ẢNH KHO HÀNG & <span className="text-brand">VẬN CHUYỂN</span>
            </h2>
            <p className="text-gray-600 text-base md:text-lg">
              Hình ảnh thực tế về quy mô lưu trữ, đóng gói kiện thùng gỗ và hoạt động vận chuyển tại Phụ Tùng Ô Tô Q.BA
            </p>
          </div>

          {/* Gallery Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {warehouseImages.map((img, idx) => (
              <div 
                key={`wh-img-${idx}`}
                className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col justify-end min-h-[320px]"
              >
                <Image 
                  src={img.src} 
                  alt={img.alt} 
                  fill 
                  className="object-cover opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>

                {/* Text Content */}
                <div className="relative z-10 p-6 space-y-2 text-white">
                  <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-xs font-bold mb-2">
                    0{idx + 1}
                  </div>
                  <h4 className="text-xl font-extrabold font-heading uppercase text-white group-hover:text-brand transition-colors">
                    {img.title}
                  </h4>
                  <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                    {img.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 5-Step Quality Verification */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black font-heading text-[#111317] uppercase tracking-wider">
              QUY TRÌNH KIỂM ĐỊNH <span className="text-brand">5 BƯỚC</span>
            </h2>
            <p className="text-gray-600 text-base md:text-lg">
              Đảm bảo 100% phụ tùng khi tới tay khách hàng đều đúng chuẩn thông số và đạt chất lượng cao nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {qualityCommitments.map((item, idx) => (
              <div 
                key={`qc-${idx}`}
                className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-brand/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <span className="text-4xl font-black font-heading text-brand/30 block mb-4">
                    {item.number}
                  </span>
                  <h4 className="text-lg font-bold font-heading text-[#111317] uppercase mb-2">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Call To Action (CTA) */}
      <section className="py-16 bg-[#111317] text-white relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading uppercase tracking-wide leading-tight">
            CẦN TƯ VẤN BÁO GIÁ <span className="text-brand">MÃ PHỤ TÙNG?</span>
          </h2>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
            Liên hệ ngay với đội ngũ kỹ thuật 25 năm kinh nghiệm của Phụ Tùng Q.BA để nhận báo giá ưu đãi nhất!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <a 
              href="tel:0903588167" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-brand text-white font-black py-4 px-8 rounded-full text-base uppercase tracking-wider hover:bg-white hover:text-brand hover:scale-105 transition-all duration-300 shadow-[0_0_25px_rgba(217,4,41,0.4)]"
            >
              <Phone size={20} />
              GỌI HOTLINE: 0903.588.167
            </a>

            <a 
              href="https://zalo.me/0903588167" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-blue-600 text-white font-black py-4 px-8 rounded-full text-base uppercase tracking-wider hover:bg-white hover:text-blue-600 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              TƯ VẤN QUA ZALO OA
              <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
