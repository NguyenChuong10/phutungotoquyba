"use client";

import React, { useState } from "react";
import { Phone, ShoppingCart, PlusCircle, Check } from "lucide-react";
import { Product } from "@/types/product";
import QuotationModal from "@/components/public/QuotationModal";
import { useQuotation } from "@/context/QuotationContext";

interface ProductDetailActionsProps {
  product: Product;
}

export default function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useQuotation();

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4 shadow-2xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase text-[#FF0000] tracking-widest">TƯ VẤN & BÁO GIÁ HỎA TỐC</span>
        <span className="text-xs text-slate-400">Phản hồi trong 5 phút</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF0000] to-red-700 hover:from-red-600 hover:to-[#FF0000] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <ShoppingCart size={18} />
          BÁO GIÁ ZALO 1-CLICK
        </button>

        <button 
          onClick={handleAddToCart}
          className={`py-4 px-6 rounded-2xl border font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
            isAdded
              ? "bg-emerald-600 border-emerald-500 text-white"
              : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white"
          }`}
        >
          {isAdded ? (
            <>
              <Check size={18} /> ĐÃ THÊM BÁO GIÁ
            </>
          ) : (
            <>
              <PlusCircle size={18} /> THÊM VÀO DANH SÁCH
            </>
          )}
        </button>
      </div>

      <div className="pt-2 text-center">
        <a 
          href="tel:0903588167"
          className="inline-flex items-center justify-center gap-2 text-emerald-400 hover:text-emerald-300 font-extrabold text-sm uppercase tracking-wider transition-colors"
        >
          <Phone size={16} />
          GỌI HOTLINE 0903.588.167 (24/7)
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
