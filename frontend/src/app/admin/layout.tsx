import type { Metadata } from 'next';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Hệ Thống Quản Trị - Phụ Tùng Ô Tô Q.BA',
  description: 'Bảng điều khiển quản trị phụ tùng ô tô xe tải nặng Trung Quốc Q.BA Đà Nẵng',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
