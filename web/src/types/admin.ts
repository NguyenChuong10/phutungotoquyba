export interface AdminMetricCard {
  title: string;
  value: string | number;
  changePercent: string;
  isPositive: boolean;
  iconName: string;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  phoneNumber: string;
  totalItems: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  phoneNumber: string;
  location: string;
  totalOrders: number;
}
