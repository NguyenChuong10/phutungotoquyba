"use client";

import React, { useState } from "react";
import { Phone, ShoppingCart, PlusCircle, Check } from "lucide-react";
import { Product } from "@/types/product";
import QuotationModal from "@/components/public/QuotationModal";
import { useQuotation } from "@/context/QuotationContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { siteConfig } from "@/config/siteConfig";

interface ProductDetailActionsProps {
  product: Product;
}

export default function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useQuotation();
  const { settings } = useSiteSettings();

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const phoneText = settings.hotlineZalo || siteConfig.hotline;
  const rawPhone = settings.hotlineRaw || siteConfig.hotlineRaw;

  return (
    <div className="space-y-2.5 pt-2">
      {/* Main Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button 
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="py-3.5 px-4 rounded-xl bg-brand hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <ShoppingCart size={17} />
          <span>Báo Giá Zalo 1-Click</span>
        </button>

        <button 
          type="button"
          onClick={handleAddToCart}
          className={`py-3.5 px-4 rounded-xl border font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
            isAdded
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "bg-slate-900 hover:bg-slate-800 border-slate-900 text-white"
          }`}
        >
          {isAdded ? (
            <>
              <Check size={17} /> <span>Đã Thêm Báo Giá</span>
            </>
          ) : (
            <>
              <PlusCircle size={17} /> <span>Thêm Vào Danh Sách</span>
            </>
          )}
        </button>
      </div>

      {/* Direct Hotline Contact Button */}
      <div>
        <a 
          href={`tel:${rawPhone}`}
          className="w-full py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
        >
          <Phone size={15} className="text-emerald-600 animate-pulse shrink-0" />
          <span>Gọi Hotline Tư Vấn: {phoneText}</span>
        </a>
      </div>

      {/* Quotation Modal */}
      <QuotationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
      />
    </div>
  );
}
