"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types/product";

export interface QuotationItem {
  product: Product;
  quantity: number;
  note?: string;
}

interface QuotationContextType {
  items: QuotationItem[];
  addItem: (product: Product, quantity?: number, note?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const QuotationContext = createContext<QuotationContextType | undefined>(undefined);

export const QuotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<QuotationItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("qba_quotation_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(
            parsed.map((item: any) => ({
              ...item,
              quantity: Number(item.quantity) || 1,
            }))
          );
        }
      }
    } catch {
      // Ignore error
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("qba_quotation_cart", JSON.stringify(items));
    } catch {
      // Ignore error
    }
  }, [items]);

  const addItem = (product: Product, quantity = 1, note = "") => {
    const numQty = Number(quantity) || 1;
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => String(item.product.id) === String(product.id));
      if (existingIndex > -1) {
        const updated = [...prev];
        const currentQty = Number(updated[existingIndex].quantity) || 0;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + numQty,
          note: note || updated[existingIndex].note,
        };
        return updated;
      }
      return [...prev, { product, quantity: numQty, note }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => String(item.product.id) !== String(productId)));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const numQty = Number(quantity);
    if (numQty <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        String(item.product.id) === String(productId) ? { ...item, quantity: numQty } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);

  return (
    <QuotationContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems }}
    >
      {children}
    </QuotationContext.Provider>
  );
};

export const useQuotation = () => {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error("useQuotation must be used within a QuotationProvider");
  }
  return context;
};
