export interface NavItem {
  title: string;
  href: string;
  isExternal?: boolean;
}

export const mainNavItems: NavItem[] = [
  { title: "TRANG CHỦ", href: "/" },
  { title: "GIỚI THIỆU", href: "/about" },
  { title: "DANH MỤC PHỤ TÙNG", href: "/products" },
  { title: "TIN TỨC & KỸ THUẬT", href: "/news" },
  { title: "TUYỂN DỤNG", href: "/careers" },
  { title: "LIÊN HỆ", href: "/contact" }
];

export const adminNavItems: NavItem[] = [
  { title: "Tổng quan", href: "/admin" },
  { title: "Quản lý Sản phẩm", href: "/admin/products" },
  { title: "Danh mục Phụ tùng", href: "/admin/categories" },
  { title: "Yêu cầu Báo giá", href: "/admin/orders" },
  { title: "Bài viết Tin tức", href: "/admin/news" },
  { title: "Danh sách Khách hàng", href: "/admin/customers" },
  { title: "Cấu hình Hệ thống", href: "/admin/settings" }
];
