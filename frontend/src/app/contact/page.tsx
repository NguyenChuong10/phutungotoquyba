'use client';

import React from "react";
import { MapPin, Phone, Mail, Clock, Truck, MessageSquare } from "lucide-react";
import ContactForm from "@/components/public/ContactForm";
import { siteConfig } from "@/config/siteConfig";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function ContactPage() {
  const { settings } = useSiteSettings();

  const contactCards = [
    {
      icon: MapPin,
      title: "ĐỊA CHỈ CỬA HÀNG",
      detail: settings.warehouseAddress || siteConfig.address,
      subText: "Trung tâm giao thương phụ tùng miền Trung",
      linkText: "Xem vị trí Google Maps",
      linkHref: "#google-maps-section"
    },
    {
      icon: Phone,
      title: "HOTLINE BÁO GIÁ TRỰC TIẾP",
      detail: settings.hotlineZalo || siteConfig.hotline,
      subText: "Tư vấn kỹ thuật đúng mã phụ tùng hỏa tốc",
      linkText: "Gọi điện ngay",
      linkHref: `tel:${settings.hotlineRaw || siteConfig.hotlineRaw}`
    },
    {
      icon: Mail,
      title: "EMAIL THƯƠNG MẠI",
      detail: settings.emailContact || siteConfig.email,
      subText: "Tiếp nhận đơn hàng & hợp đồng doanh nghiệp",
      linkText: "Gửi Email",
      linkHref: `mailto:${settings.emailContact || siteConfig.email}`
    },
    {
      icon: Clock,
      title: "THỜI GIAN PHỤC VỤ",
      detail: settings.workingHours || siteConfig.workingHours,
      subText: "Phục vụ cả Ngày lễ & Tết",
      linkText: "Hỗ trợ qua Zalo",
      linkHref: settings.zaloLink || siteConfig.zaloLink
    }
  ];

  return (
    <div>
      {/* 1. Header Banner */}
      <section className="bg-[#111317] text-white pt-32 md:pt-40 pb-16 md:pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-black tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
            Hỗ Trợ Kỹ Thuật & Báo Giá Trực Tiếp
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black font-heading uppercase tracking-wide leading-tight mb-6">
            LIÊN HỆ & VỊ TRÍ <span className="text-brand">CỬA HÀNG Q.BA</span>
          </h1>

          <p className="text-gray-300 text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            Hệ thống tư vấn kỹ thuật đúng mã chuẩn xác, sẵn sàng phản hồi báo giá hỏa tốc cho các chủ xe, bác tài và doanh nghiệp vận tải.
          </p>
        </div>
      </section>

      {/* 2. 4 Contact Cards Grid */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((card, idx) => {
              const IconComp = card.icon;
              const hasColon = card.detail.includes(': ');
              const detailParts = hasColon ? card.detail.split(': ') : [card.detail];

              return (
                <div
                  key={`contact-card-${idx}`}
                  className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 hover:border-brand/40 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-5 group-hover:bg-brand group-hover:text-white transition-colors duration-300 shadow-sm">
                      <IconComp size={24} />
                    </div>
                    <h3 className="text-xs sm:text-sm font-black font-heading text-slate-900 uppercase tracking-wider mb-2.5">
                      {card.title}
                    </h3>

                    {/* Detail Container with smart formatting */}
                    <div className="min-h-[52px] flex flex-col justify-center mb-3">
                      {hasColon ? (
                        <div className="space-y-1.5">
                          <span className="block text-xs sm:text-sm font-extrabold text-slate-800">
                            {detailParts[0]}
                          </span>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-brand/10 border border-brand/20 text-brand font-black text-xs sm:text-sm shadow-2xs">
                            {detailParts.slice(1).join(': ')}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm font-black text-brand leading-relaxed break-all sm:break-words">
                          {card.detail}
                        </p>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                      {card.subText}
                    </p>
                  </div>

                  <div className="pt-5 border-t border-slate-100 mt-5">
                    <a
                      href={card.linkHref}
                      className="inline-flex items-center text-xs font-extrabold text-slate-900 group-hover:text-brand transition-colors uppercase tracking-wider gap-1.5"
                    >
                      <span>{card.linkText}</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Main Form & Storefront Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* Left Form: Client Component */}
            <ContactForm />

            {/* Right Information & Store Image */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-black font-heading text-slate-900 uppercase">
                  CAM KẾT DỊCH VỤ <span className="text-brand">TẠI Q.BA</span>
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed text-justify">
                  Với 25 năm làm việc chuyên sâu với các dòng phụ tùng xe tải Trung Quốc tại miền Trung, Phụ Tùng Ô Tô Q.BA tự tin cung cấp dịch vụ bán hàng & tư vấn kỹ thuật tốt nhất thị trường.
                </p>
              </div>

              {/* Service Badges */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Truck size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase">Gửi Hàng Toàn Quốc</h4>
                    <p className="text-xs text-gray-600 mt-1">Giao hàng hỏa tốc tận nơi tại Đà Nẵng và đóng gói thùng gỗ gửi chành xe toàn quốc.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase">Tư Vấn Zalo OA Trực Tiếp</h4>
                    <p className="text-xs text-gray-600 mt-1">Gửi hình ảnh mẫu phụ tùng qua Zalo {settings.hotlineZalo || siteConfig.hotline} để nhận diện đúng mã ngay lập tức.</p>
                  </div>
                </div>
              </div>

              {/* Direct Zalo Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-xl flex items-center justify-between">
                <div>
                  <h4 className="font-black text-lg uppercase">TƯ VẤN NHANH QUA ZALO</h4>
                  <p className="text-xs text-blue-100 mt-1">Gửi hình ảnh mẫu phụ tùng cũ để soi mã</p>
                </div>
                <a
                  href={settings.zaloLink || siteConfig.zaloLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-white text-blue-700 font-bold rounded-full text-xs uppercase tracking-wider hover:bg-blue-50 transition-colors shrink-0"
                >
                  MỞ ZALO
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Large Interactive Google Maps Embed Section */}
      <section id="google-maps-section" className="py-16 bg-slate-100">
        <div className="container mx-auto px-4 max-w-7xl space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black font-heading uppercase text-slate-900">
              BẢN ĐỒ VỊ TRÍ <span className="text-brand">CỬA HÀNG Q.BA</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              {settings.warehouseAddress || siteConfig.address}
            </p>
          </div>

          <div className="w-full h-[450px] md:h-[550px] bg-slate-900 rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl relative group">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.916945532585!2d108.17518457597148!3d16.069792688880625!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219069d2d8e41%3A0xc3c516f461e712a!2sC%E1%BB%ADa%20H%C3%A0ng%20Ph%E1%BB%A5%20T%C3%B9ng%20%C3%94%20T%C3%B4%20v%E1%BA%ADn%20t%E1%BA%A3i%20Q.Ba!5e0!3m2!1svi!2s!4v1713589999999!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Q.Ba Auto Parts Map Location"
              className="w-full h-full border-0"
            ></iframe>
          </div>
        </div>
      </section>

    </div>
  );
}
