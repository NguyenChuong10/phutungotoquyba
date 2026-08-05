# KNOWN ISSUES (DANH SÁCH LỖI VÀ LƯU Ý KỸ THUẬT)

## 📌 Lưu ý hiện tại (Non-Critical)
1. **Next.js Turbopack Multi-Lockfile Warning**:
   - Khi chạy `npm run build`, Next.js đưa ra cảnh báo nhẹ: `We detected multiple lockfiles and selected the directory of /Users/mac/Documents/package-lock.json as the root directory.`
   - Cảnh báo này không làm ảnh hưởng đến quá trình biên dịch HTML/CSS/JS (100% build thành công, 0 Type Error).
   - Có thể cấu hình `turbopack.root` trong `next.config.ts` nếu cần thiết trong tương lai.

2. **Trạng thái mã nguồn (Code Quality Review)**:
   - **0 Lỗi TypeScript**.
   - **0 Lỗi JSX / Unescaped Entities**.
   - **0 Cảnh báo ESLint (0 Error, 0 Warning)**.
   - **100% Static Page Generation** thành công cho tất cả 27 routes (Bao gồm 7 trang Admin & 20 trang bán hàng công khai).

