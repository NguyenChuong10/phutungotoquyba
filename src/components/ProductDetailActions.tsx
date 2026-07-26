"use client";

import React, { useState } from "react";
import { Phone, ShoppingCart } from "lucide-react";

import { Product } from "@/data/productsData";
import QuotationModal from "@/components/QuotationModal";

interface ProductDetailActionsProps {
  product: Product;
}

export default function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-2xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase text-brand tracking-widest">TƯ VẤN & BÁO GIÁ HỎA TỐC</span>
        <span className="text-xs text-gray-400">Phản hồi trong 5 phút</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="py-4 px-6 rounded-2xl bg-gradient-to-r from-brand to-red-700 hover:from-red-600 hover:to-brand text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <ShoppingCart size={18} />
          BÁO GIÁ NHANH
        </button>

        <a 
          href="tel:0903588167"
          className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <Phone size={18} />
          GỌI HOTLINE 0903.588.167
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
