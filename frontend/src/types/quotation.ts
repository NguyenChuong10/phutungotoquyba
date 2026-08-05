export interface QuotationRequest {
  id?: string;
  phoneNumber: string;       // Bắt buộc (*)
  fullName?: string;          // Không bắt buộc
  vehicleModel?: string;      // Dòng xe (HOWO, Shacman, Weichai...)
  partNameOrCode?: string;   // Mã phụ tùng hoặc tên chi tiết cần hỏi
  notes?: string;             // Ghi chú thêm
  createdAt?: string;
  status?: 'pending' | 'contacted' | 'quoted' | 'cancelled';
}

export interface QuickQuoteModalState {
  isOpen: boolean;
  selectedPartName?: string;
  selectedPartCode?: string;
}
