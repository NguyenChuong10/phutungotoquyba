import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#0B0F19] text-gray-300 pt-16 pb-8 border-t-4 border-brand relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 mb-16 items-start">
          
          {/* Col 1: Brand & Contact Info (5 Cols) */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white inline-block px-4 py-2.5 rounded-xl shadow-md">
              <Image 
                src="/images/logo/logonen.png" 
                alt="Q.BA Auto Parts Logo" 
                width={260} 
                height={60} 
                className="w-auto h-14 object-contain"
              />
            </div>
            
            <p className="text-xs font-black text-brand tracking-[0.25em] uppercase">
              Chất lượng • Uy tín • Bền bỉ
            </p>

            <div className="space-y-3.5 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Số 43-45-47 Đường Nguyễn Văn Tạo, Phường An Khê, Quận Thanh Khê, Đà Nẵng
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand shrink-0" />
                <a href="mailto:phutungotoqbadanang@gmail.com" className="hover:text-white transition-colors">
                  phutungotoqbadanang@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Phone className="w-5 h-5 text-brand shrink-0" />
                <span className="font-bold text-white text-base">
                  0903.588.167
                </span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase text-gray-400 tracking-wider block mb-3">
                Kết nối với Q.BA
              </span>
              <div className="flex items-center gap-3">
                {/* Facebook */}
                <a 
                  href="https://www.facebook.com/p/Ph%E1%BB%A5-t%C3%B9ng-%C3%B4-t%C3%B4-QBa-61574470388648/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 bg-slate-800 hover:bg-brand text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:scale-105"
                  aria-label="Facebook Q.BA"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>

                {/* Zalo */}
                <a 
                  href="https://zalo.me/0903588167" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 bg-slate-800 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:scale-105"
                  aria-label="Zalo Q.BA"
                >
                  <span className="text-xs font-black tracking-tighter">Zalo</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Company Navigation (3 Cols) */}
          <div className="md:col-span-3 space-y-6">
            <h3 className="text-base font-black uppercase tracking-wider text-white border-l-4 border-brand pl-3">
              CÔNG TY
            </h3>
            
            <ul className="space-y-3.5 text-sm text-gray-300">
              <li>
                <Link href="/about" className="hover:text-brand transition-colors inline-flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand group-hover:scale-125 transition-transform"></span>
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="#recruitment" className="hover:text-brand transition-colors inline-flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand group-hover:scale-125 transition-transform"></span>
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-brand transition-colors inline-flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand group-hover:scale-125 transition-transform"></span>
                  Liên hệ
                </Link>
              </li>
            </ul>

            <div className="pt-4">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-red-700 text-white font-bold py-3 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(217,4,41,0.4)] transition-all duration-300 text-xs tracking-wider uppercase cursor-pointer">
                E-CATALOGUE
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>

          {/* Col 3: Google Maps Embed (4 Cols) */}
          <div className="md:col-span-4 space-y-6">
            <h3 className="text-base font-black uppercase tracking-wider text-white border-l-4 border-brand pl-3">
              GOOGLE MAPS - Q.BA
            </h3>

            <div className="w-full h-52 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.916945532585!2d108.17518457597148!3d16.069792688880625!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219069d2d8e41%3A0xc3c516f461e712a!2sC%E1%BB%ADa%20H%C3%A0ng%20Ph%E1%BB%A5%20T%C3%B9ng%20%C3%94%20T%C3%B4%20v%E1%BA%ADn%20t%E1%BA%A3i%20Q.Ba!5e0!3m2!1svi!2s!4v1713589999999!5m2!1svi!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Q.Ba Auto Parts Map"
                className="grayscale group-hover:grayscale-0 transition-all duration-500 opacity-90 group-hover:opacity-100"
              ></iframe>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
