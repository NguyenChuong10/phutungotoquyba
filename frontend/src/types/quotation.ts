export interface QuotationItemInput {
  productId: number;
  quantity?: number;
  itemNote?: string;
}

export interface QuotationRequest {
  id?: string;
  phoneNumber: string;       // Bắt buộc (*)
  customerName?: string;
  customerEmail?: string;
  fullName?: string;          // Không bắt buộc
  vehicleModel?: string;      // Dòng xe (HOWO, Shacman, Weichai...)
  partNameOrCode?: string;   // Mã phụ tùng hoặc tên chi tiết cần hỏi
  note?: string;
  notes?: string;             // Ghi chú thêm
  items?: QuotationItemInput[];
  createdAt?: string;
  status?: 'pending' | 'contacted' | 'quoted' | 'cancelled';
}

export interface QuickQuoteModalState {
  isOpen: boolean;
  selectedPartName?: string;
  selectedPartCode?: string;
}
