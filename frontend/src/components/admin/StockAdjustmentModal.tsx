'use client';

import React, { useState } from 'react';
import { Package, ShieldAlert, Loader2, Save, Plus, Minus, DollarSign } from 'lucide-react';
import { AdminApiService } from '@/services/adminApiService';

interface StockAdjustmentModalProps {
  product: {
    id: number;
    name: string;
    partNumber: string;
    internalCode: string;
    stock: number;
    price: string;
    costPrice: string;
    rawProduct?: any;
  };
  onClose: () => void;
  onSuccess: (updatedMsg: string) => void;
}

export default function StockAdjustmentModal({
  product,
  onClose,
  onSuccess,
}: StockAdjustmentModalProps) {
  // Extract raw numbers safely
  const initialStock = Number(product.stock) || 0;
  const initialPrice = product.rawProduct?.price ? Number(product.rawProduct.price) : 0;
  const initialCostPrice = product.rawProduct?.costPrice ? Number(product.rawProduct.costPrice) : 0;

  const [stockQuantity, setStockQuantity] = useState<number>(initialStock);
  const [price, setPrice] = useState<number>(initialPrice);
  const [costPrice, setCostPrice] = useState<number>(initialCostPrice);
  const [note, setNote] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validation function for non-negative values
  const handleStockChange = (val: number) => {
    if (isNaN(val) || val < 0) {
      setStockQuantity(0); // Clamp to 0
    } else {
      setStockQuantity(val);
    }
  };

  const handlePriceChange = (val: number) => {
    if (isNaN(val) || val < 0) {
      setPrice(0); // Clamp to 0
    } else {
      setPrice(val);
    }
  };

  const handleCostPriceChange = (val: number) => {
    if (isNaN(val) || val < 0) {
      setCostPrice(0); // Clamp to 0
    } else {
      setCostPrice(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict non-negative check
    if (stockQuantity < 0) {
      setErrorMsg('Số lượng tồn kho không được âm (< 0)');
      return;
    }
    if (price < 0) {
      setErrorMsg('Giá bán sản phẩm không được âm (< 0)');
      return;
    }
    if (costPrice < 0) {
      setErrorMsg('Giá vốn nhập kho không được âm (< 0)');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await AdminApiService.adjustProductStockAndPrice(product.id, {
        stockQuantity: Number(stockQuantity),
        price: Number(price),
        costPrice: Number(costPrice),
        adjustmentNote: note.trim() || undefined,
      });

      if (res.ok) {
        onSuccess(
          `Đã cập nhật tồn kho [${product.partNumber}] thành ${stockQuantity} cái, Giá bán: ${price.toLocaleString()} ₫!`
        );
      } else {
        setErrorMsg(res.message || res.error?.message || 'Cập nhật tồn kho thất bại.');
      }
    } catch {
      setErrorMsg('Không thể kết nối đến máy chủ Express Backend.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Package className="w-5 h-5 text-red-600" />
              <span>Quản Lý Tồn Kho & Giá Phụ Tùng</span>
            </h3>
            <p className="text-xs font-mono font-bold text-red-600 mt-0.5">
              Part No: {product.partNumber} | Mã Q.BA: {product.internalCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Product Name Display */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-xs text-slate-500 font-semibold">Tên sản phẩm:</div>
          <div className="text-sm font-extrabold text-slate-900 line-clamp-1">{product.name}</div>
        </div>

        {/* Validation Alert Message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Stock Quantity Section */}
          <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                <Package className="w-4 h-4 text-red-600" />
                <span>Số Lượng Tồn Kho Hiện Tại (*)</span>
              </label>
              <span className="text-[10px] text-red-600 font-bold">
                ⚠️ Cam kết không âm (≥ 0 cái)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => handleStockChange(parseInt(e.target.value) || 0)}
                className="flex-1 p-3 border-2 border-red-200 rounded-xl font-mono text-base font-extrabold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleStockChange(Math.max(0, stockQuantity - 1))}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-all cursor-pointer"
                  title="Trừ 1 cái"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStockChange(stockQuantity + 1)}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-all cursor-pointer"
                  title="Cộng 1 cái"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStockChange(stockQuantity + 5)}
                  className="px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  +5 Kho
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Section (Price & Cost Price) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Giá Bán Công Khai (₫)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={price}
                onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                placeholder="0 = Liên hệ Báo Giá"
                className="w-full p-2.5 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20"
              />
              <div className="text-[10px] text-slate-500 mt-1">
                {price > 0 ? `${price.toLocaleString()} ₫` : '0 = Báo Giá Zalo'}
              </div>
            </div>

            <div>
              <label className="font-extrabold text-slate-800 block mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Giá Vốn Nhập Kho (₫)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={costPrice}
                onChange={(e) => handleCostPriceChange(parseFloat(e.target.value) || 0)}
                placeholder="0 ₫"
                className="w-full p-2.5 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 bg-slate-50 focus:ring-2 focus:ring-red-500/20"
              />
              <div className="text-[10px] text-slate-500 mt-1">
                {costPrice > 0 ? `${costPrice.toLocaleString()} ₫` : 'Giá bảo mật'}
              </div>
            </div>
          </div>

          {/* Adjustment Note */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Ghi Chú Nhập / Điều Chỉnh Kho</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Nhập kho thêm 50 cái đợt tháng 8/2026..."
              className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-900/30 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Đang Lưu...' : 'Cập Nhật Tồn Kho & Giá'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
