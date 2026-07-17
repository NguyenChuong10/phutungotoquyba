"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Truck, 
  Bus, 
  Tractor, 
  Caravan, 
  Zap, 
  Settings, 
  CircleDashed, 
  FlaskConical, 
  Cog, 
  CarFront, 
  BatteryCharging, 
  Wrench, 
  Package, 
  Link as LinkIcon, 
  ShieldCheck, 
  Sparkles, 
  Disc3,
  ChevronRight,
  HardHat,
  X,
  ArrowRight
} from "lucide-react";


const partCategories = [
  { name: "Gioăng - Phớt - Làm kín", icon: <CircleDashed size={32} strokeWidth={1.5} />, description: "Hệ thống làm kín động cơ, hộp số, và cầu. Gioăng mặt máy, phớt git, phớt trục khuỷu vật liệu chịu nhiệt, chịu dầu mỡ cực tốt." },
  { name: "Hóa chất ô tô", icon: <FlaskConical size={32} strokeWidth={1.5} />, description: "Dầu nhớt động cơ, dầu thủy lực, nước làm mát, dung dịch tẩy rửa và các loại phụ gia bảo vệ động cơ chuyên nghiệp." },
  { name: "Phụ tùng Ben", icon: <Cog size={32} strokeWidth={1.5} />, description: "Ty ben, bơm thủy lực ben, van chia hơi, công tắc lên xuống ben và các linh kiện nâng hạ chuyên dụng." },
  { name: "Phụ tùng CAB", icon: <CarFront size={32} strokeWidth={1.5} />, description: "Linh kiện Cabin: Bầu hơi cabin, giảm xóc cabin, cụm điều khiển trung tâm, vô lăng, ghế hơi và taplo." },
  { name: "Hệ thống Điện", icon: <BatteryCharging size={32} strokeWidth={1.5} />, description: "Hộp đen (ECU), dây điện tổng, củ đề, máy phát, hệ thống đèn chiếu sáng và các cảm biến thông minh." },
  { name: "Phụ tùng Gầm", icon: <Wrench size={32} strokeWidth={1.5} />, description: "Cầu xe, trục các-đăng, nhíp, phuộc nhún, mâm phanh, rô-tuyn, đáp ứng tải trọng cực đại." },
  { name: "Phụ tùng Hộp số", icon: <Settings size={32} strokeWidth={1.5} />, description: "Bánh răng hộp số, bộ đồng tốc, trục sơ cấp, thứ cấp, bàn ép, lá côn, bi T." },
  { name: "Động cơ & Máy", icon: <Tractor size={32} strokeWidth={1.5} />, description: "Xilanh, piston, xéc măng, trục khuỷu, tay biên, trục cam, xupap và toàn bộ cụm động cơ tổng thành." },
  { name: "Phụ tùng Rơ-mooc", icon: <LinkIcon size={32} strokeWidth={1.5} />, description: "Trục mooc, mooc sàn, mooc lồng, hệ thống treo rơ-mooc, chân chống." },
  { name: "Vòng bi các loại", icon: <Disc3 size={32} strokeWidth={1.5} />, description: "Vòng bi moay ơ, bi hộp số, bi chữ thập, bi treo các-đăng từ các thương hiệu chịu tải khét tiếng." },
  { name: "Phụ tùng Thân vỏ", icon: <ShieldCheck size={32} strokeWidth={1.5} />, comingSoon: true, description: "Cánh cửa, cản trước, mặt ga lăng, gương chiếu hậu." },
  { name: "Phụ tùng Trang trí", icon: <Sparkles size={32} strokeWidth={1.5} />, comingSoon: true, description: "Đèn LED trang trí, ốp viền Inox, còi hơi, phụ kiện làm đẹp xe." },
  { name: "Phụ tùng Khác", icon: <Package size={32} strokeWidth={1.5} />, description: "Ống xả, thùng dầu, lọc gió, lọc nhớt, và hàng ngàn chi tiết tiêu hao khác." },
];

export default function FeaturedProductsPage() {
  const [activePart, setActivePart] = useState<string | null>(null);

  const selectedPartData = partCategories.find(p => p.name === activePart);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col text-slate-800 selection:bg-brand selection:text-white overflow-hidden">
      
      {/* Vibrant Hero Banner */}
      <section className="relative pt-32 pb-24 px-4 md:px-8 bg-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] z-20">
        <div className="absolute top-0 right-10 w-[400px] h-[400px] bg-gradient-to-br from-brand/20 to-yellow-400/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-gradient-to-tr from-orange-500/10 to-transparent blur-[80px] rounded-full pointer-events-none"></div>
        
        {/* 3D Blueprint Floor Grid */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent)]" 
          style={{ 
            backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', 
            backgroundSize: '80px 80px', 
            transform: 'perspective(1000px) rotateX(75deg) translateY(-50px) translateZ(-200px)' 
          }}
        ></div>
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-sm font-bold tracking-widest uppercase mb-8 shadow-sm">
            <Sparkles size={16} className="animate-pulse" /> DANH MỤC CỐT LÕI
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-heading mb-8 tracking-tight leading-tight text-slate-900 drop-shadow-sm">
            HỆ THỐNG SẢN PHẨM <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-orange-500">
              THẾ MẠNH QUY BA
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Phân phối phụ tùng ô tô tải nặng đa dạng — <br className="hidden md:block" />
            <span className="text-slate-800 font-bold border-b-2 border-brand pb-1 bg-brand/5 px-2">25 năm phân phối hàng nội địa Trung Quốc</span>, cùng nhiều thương hiệu quốc tế uy tín khác.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 lg:px-8 pb-32 space-y-24 mt-16 relative">
        

        {/* Section 2: Theo Phụ Tùng */}
        <section className="min-h-[400px]">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-800 flex items-center gap-4">
              <span className="w-12 h-1.5 bg-gradient-to-r from-brand to-yellow-400 rounded-full shadow-sm"></span>
              CHỦNG LOẠI PHỤ TÙNG
            </h2>
          </div>
          
          <div className="relative">
            {/* Expanded Detail View */}
            {activePart && selectedPartData ? (
              <div className="absolute inset-0 z-10 bg-white rounded-3xl border border-slate-100 shadow-[0_30px_60px_-15px_rgba(255,100,0,0.15)] flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                {/* Left Side: Big Icon */}
                <div className="bg-gradient-to-br from-brand/5 to-yellow-400/10 md:w-1/3 flex flex-col items-center justify-center p-12 border-b md:border-b-0 md:border-r border-slate-100">
                  <div className="p-8 rounded-full bg-white shadow-xl text-brand mb-6 transform hover:scale-110 transition-transform duration-500 border border-slate-50">
                    {React.cloneElement(selectedPartData.icon as React.ReactElement<{ size: number, strokeWidth: number }>, { size: 80, strokeWidth: 1 })}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 text-center uppercase tracking-wide">
                    {selectedPartData.name}
                  </h3>
                </div>
                
                {/* Right Side: Content */}
                <div className="md:w-2/3 p-8 md:p-12 flex flex-col justify-center bg-white relative">
                  <button 
                    onClick={() => setActivePart(null)}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                  >
                    <X size={24} />
                  </button>
                  
                  <h4 className="text-xl font-bold text-slate-800 mb-4 border-l-4 border-brand pl-4">Giới thiệu tổng quan</h4>
                  <p className="text-slate-600 text-lg leading-relaxed mb-10 text-justify">
                    {selectedPartData.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mt-auto">
                    <button 
                      onClick={() => setActivePart(null)}
                      className="px-6 py-3 rounded-full font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      ← Thu gọn
                    </button>
                    {!selectedPartData.comingSoon && (
                      <Link href="/products" className="px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-brand to-orange-500 hover:shadow-lg hover:shadow-brand/30 transition-all flex items-center gap-2 group">
                        Khám phá danh mục <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Grid View */}
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 perspective-[1500px] transition-all duration-500 ${activePart ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
              {partCategories.map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => setActivePart(item.name)}
                  className={`group relative rounded-2xl p-6 border transform-gpu transition-all duration-700 ease-out overflow-hidden cursor-pointer ${
                    item.comingSoon 
                      ? 'bg-slate-100 border-slate-200 opacity-70' 
                      : 'bg-white border-slate-100 shadow-[0_5px_15px_rgba(0,0,0,0.02)] hover:[transform:translateZ(30px)_scale(1.02)] hover:shadow-[0_20px_50px_-10px_rgba(255,100,0,0.15)] hover:border-brand/40'
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {item.comingSoon && (
                    <div className="absolute top-0 right-0 bg-yellow-400/20 text-yellow-700 text-[10px] font-bold px-3 py-1.5 rounded-bl-xl border-b border-l border-yellow-400/30 uppercase tracking-wider backdrop-blur-md">
                      Sắp ra mắt
                    </div>
                  )}
                  
                  <div 
                    className={`relative z-10 flex flex-col items-start gap-5 transform-gpu transition-transform duration-700 ${!item.comingSoon && 'group-hover:[transform:translateZ(30px)]'}`}
                  >
                    <div className={`p-3 rounded-xl transition-all duration-500 ${!item.comingSoon && 'bg-slate-50 group-hover:bg-brand group-hover:text-white text-brand border border-slate-100 group-hover:border-transparent shadow-sm'} ${item.comingSoon && 'bg-slate-200 text-slate-500'}`}>
                      {item.icon}
                    </div>
                    <div className="space-y-1.5 w-full">
                      <h3 className={`text-sm md:text-base font-bold transition-colors ${!item.comingSoon ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-500'}`}>
                        {item.name}
                      </h3>
                      {!item.comingSoon && (
                        <div className="flex items-center justify-between w-full text-xs text-brand opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500 font-bold uppercase tracking-widest mt-2">
                          <span>Chi tiết</span>
                          <ChevronRight size={14} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Back Button (Vibrant 3D Pop) */}
        <div className="flex justify-center pt-16 perspective-[1000px]">
          <Link 
            href="/" 
            className="inline-flex items-center gap-3 bg-white hover:bg-gradient-to-r hover:from-brand hover:to-orange-500 text-slate-700 hover:text-white font-bold tracking-widest py-4 px-10 rounded-full transition-all duration-500 border-2 border-slate-200 hover:border-transparent transform-gpu hover:[transform:translateZ(20px)_scale(1.05)] shadow-lg hover:shadow-[0_15px_30px_rgba(255,100,0,0.3)] group"
          >
            <ChevronRight size={18} className="transform rotate-180 group-hover:-translate-x-1 transition-transform" /> 
            VỀ TRANG CHỦ
          </Link>
        </div>

      </div>
    </main>
  );
}
