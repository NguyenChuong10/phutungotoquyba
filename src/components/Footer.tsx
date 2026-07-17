import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#0B0F19] text-gray-300 pt-16 border-t-4 border-brand">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Contact Info */}
          <div>
            <div className="mb-2 bg-white inline-block p-2 rounded-lg">
               <Image 
                  src="/images/logo/logonen.png" 
                  alt="Q.BA Auto Parts Logo" 
                  width={200} 
                  height={45} 
                  className="object-contain"
               />
            </div>
            <p className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase mb-6 mt-2">
              Chất lượng • Uy tín • Bền bỉ
            </p>
            <p className="mb-4 text-gray-300">
              Số 43-45-47 Đường Nguyễn Văn Tạo, Phường An Khê, Quận Thanh Khê, Đà Nẵng
            </p>
            <p className="mb-6 text-gray-300">
              Email: phutungotoqbadanang@gmail.com
            </p>
            <h4 className="font-bold uppercase mb-4 tracking-wide text-gray-200">Tổng đài hỗ trợ</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-brand">▪</span> 
                <span>Phụ tùng ô tô: 0903.588.167</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand">▪</span> 
                <span>Sửa chữa đại tu: 0903.588.167</span>
              </li>
            </ul>
            
            <div className="mt-8">
              <h4 className="font-bold uppercase mb-4 tracking-wide text-gray-200">Kết nối với <strong className="text-[#EF233C] font-black">Q.BA</strong></h4>
              <div className="flex gap-2">
                {/* Facebook */}
                <a href="https://www.facebook.com/p/Ph%E1%BB%A5-t%C3%B9ng-%C3%B4-t%C3%B4-QBa-61574470388648/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white rounded flex items-center justify-center text-black hover:bg-gray-200 transition-colors cursor-pointer shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                
                {/* YouTube */}
                <a href="#" className="w-9 h-9 bg-white rounded flex items-center justify-center text-black hover:bg-gray-200 transition-colors cursor-pointer shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a href="#" className="w-9 h-9 bg-white rounded flex items-center justify-center text-black hover:bg-gray-200 transition-colors cursor-pointer shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>

                {/* TikTok */}
                <a href="#" className="w-9 h-9 bg-white rounded flex items-center justify-center text-black hover:bg-gray-200 transition-colors cursor-pointer shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                  </svg>
                </a>

                {/* Zalo */}
                <a href="https://zalo.me/0903588167" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white rounded flex items-center justify-center text-black hover:bg-gray-200 transition-colors cursor-pointer shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </div>
                  <span className="relative text-[8px] font-black text-black z-10 mt-[1px]">Zalo</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Company Links */}
          <div>
            <h3 className="text-lg font-bold uppercase mb-6 tracking-wide text-white">Công ty</h3>
            <ul className="space-y-4 text-gray-300">
              <li><Link href="#" className="hover:text-brand transition-colors">Giới thiệu</Link></li>
              <li><Link href="#" className="hover:text-brand transition-colors">Cửa hàng</Link></li>
              <li><Link href="#" className="hover:text-brand transition-colors">Tuyển dụng</Link></li>
              <li><Link href="#" className="hover:text-brand transition-colors">Liên hệ</Link></li>
            </ul>
            <div className="mt-8">
               <button className="bg-brand text-white font-bold uppercase py-2 px-6 rounded hover:bg-brand-hover transition-colors text-xs tracking-wider cursor-pointer">
                  E-CATALOGUE
               </button>
            </div>
          </div>

          {/* Col 3: Product Links */}
          <div>
            <h3 className="text-lg font-bold uppercase mb-6 tracking-wide text-white">Sản phẩm</h3>
            <ul className="space-y-4 text-gray-300">
              <li><Link href="#" className="hover:text-brand transition-colors">Phụ tùng máy</Link></li>
              <li><Link href="#" className="hover:text-brand transition-colors">Phụ tùng gầm</Link></li>
              <li><Link href="#" className="hover:text-brand transition-colors">Phụ tùng điện - thân vỏ</Link></li>
              <li><Link href="#" className="hover:text-brand transition-colors">Phụ tùng khác</Link></li>
              <li><Link href="#" className="hover:text-brand transition-colors">Tăm bua</Link></li>
            </ul>
          </div>

          {/* Col 4: Map */}
          <div>
            <h3 className="text-lg font-bold uppercase mb-6 tracking-wide text-white">Google Maps - Q.BA</h3>
            <div className="w-full h-48 bg-gray-600 rounded overflow-hidden">
               <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.916945532585!2d108.17518457597148!3d16.069792688880625!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219069d2d8e41%3A0xc3c516f461e712a!2sC%E1%BB%ADa%20H%C3%A0ng%20Ph%E1%BB%A5%20T%C3%B9ng%20%C3%94%20T%C3%B4%20v%E1%BA%ADn%20t%E1%BA%A3i%20Q.Ba!5e0!3m2!1svi!2s!4v1713589999999!5m2!1svi!2s" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Q.Ba Auto Parts Map"
               ></iframe>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="py-6 text-center border-t border-white/10 text-xs text-gray-500 uppercase tracking-widest">
        2026 © CÔNG TY TNHH CƠ KHÍ Ô TÔ Q.BA. ALL RIGHTS RESERVED
      </div>
      
    </footer>
  );
}
