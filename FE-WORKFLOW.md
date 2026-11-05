# WORKFLOW: QUY TRÌNH PHÁT TRIỂN & CHỈNH SỬA FRONTEND (FE-WORKFLOW)

> **Mục đích**: Hướng dẫn chuẩn hóa dành cho lập trình viên và các AI Coding Agent khi tiến hành thêm mới, chỉnh sửa giao diện hoặc tái cấu trúc mã nguồn trong thư mục `frontend/`. 
> Quy trình tích hợp sẵn bộ lọc chất lượng cao **Anti-Slop AI** nhằm đảm bảo giao diện mang đậm tính chuyên nghiệp, cơ khí đặc trưng của thương hiệu Phụ Tùng Ô Tô Q.BA, tránh các lỗi giao diện rập khuôn do AI tạo ra.

---

## 📋 TỔNG QUAN 7 BƯỚC THỰC THI (QUICK RUNBOOK)

```
[1. Tiếp nhận & Đọc Context]
          ↓
[2. Nạp Bộ lọc Anti-Slop & Design Guidelines]
          ↓
[3. Lập trình & Sửa đổi Mã nguồn]
          ↓
[4. Rà soát Tiêu chuẩn Giao diện (Anti-Slop Gate)]
          ↓
[5. Kiểm tra Kiểm thử & Type-Check (`tsc`)]
          ↓
[6. Cập nhật Tài liệu & Trạng thái]
          ↓
[7. Đóng gói & Commit Git]
```

---

## 🔍 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### BƯỚC 1: TIẾP NHẬN YÊU CẦU & ĐỌC CONTEXT DỰ ÁN
1. **Kiểm tra hợp đồng dữ liệu (API Contract)**:
   - Nếu tính năng liên quan đến dữ liệu sản phẩm, đơn hàng, danh mục: Đọc kiểu dữ liệu tại `frontend/src/types/product.ts` và service gọi API tại `frontend/src/services/adminApiService.ts` hoặc `frontend/src/config/api.ts`.
   - Đảm bảo dữ liệu từ Backend Express (`localhost:5000`) tương thích 100% với Frontend Next.js.
2. **Kiểm tra route & component liên quan**:
   - Trang công khai (Public): `frontend/src/app/(public)/...` hoặc `frontend/src/app/products/...`.
   - Trang quản trị (Admin): `frontend/src/app/admin/...`.
   - Thành phần dùng chung: `frontend/src/components/public/`, `frontend/src/components/admin/`, `frontend/src/components/ui/`.

---

### BƯỚC 2: NẠP QUY TẮC THIẾT KẾ & BỘ LỌC ANTI-SLOP
Trước khi viết mã, phải ghi nhớ bản sắc giao diện của Phụ Tùng Q.BA:
- **Ngành nghề**: Phụ tùng ô tô xe tải nặng Trung Quốc (HOWO, Fast Gear, Sinotruk, Yuchai,...).
- **Tone & Mood**: Mạnh mẽ, công nghiệp, cơ khí, đầm chắc, tin cậy.
- **Màu sắc chủ đạo**:
  - Đỏ thương hiệu: `#D90429` (Primary Brand Red).
  - Đen/Xám than: `slate-900`, `#111317` (Dark Industrial).
  - Nền phụ trợ: `slate-50`, `white`, `slate-100`.

---

### BƯỚC 3: LẬP TRÌNH MÃ NGUỒN (CLEAN CODE)
1. **Next.js Conventions**:
   - Sử dụng đúng chỉ thị `'use client'` khi component có tương tác state/hooks.
   - Các trang danh sách lớn phải áp dụng lazy loading, virtual list hoặc phân trang server-side để tránh lag DOM.
2. **Quản lý giá & trạng thái hiển thị (Odoo Integration)**:
   - Khi hiển thị giá sản phẩm, luôn kiểm tra cờ `showPrice`:
     ```tsx
     {product.showPrice === false
       ? "Liên hệ Báo Giá"
       : product.price && Number(product.price) > 0
       ? `${Number(product.price).toLocaleString("vi-VN")} ₫`
       : "Liên hệ Báo Giá"}
     ```
3. **Code Hygiene**:
   - Không chèn các comment hiển nhiên vô giá trị (như `// Render button`, `// Return div`).
   - Chỉ giữ lại comment mang tính giải thích nghiệp vụ kho hoặc kiến trúc quan trọng.

---

### BƯỚC 4: RÀ SOÁT CHẤT LƯỢNG GIAO DIỆN (ANTI-SLOP DELIVERY GATE)
Trước khi xuất xưởng giao diện, tự kiểm tra qua bảng đối soát sau:

| Mã quy tắc | Yêu cầu kiểm tra | Hành động bắt buộc |
| :--- | :--- | :--- |
| **R-02 (Copywriting)** | **Cấm dùng ký tự em dash (`—`)** trong văn bản hiển thị. | Thay bằng dấu phẩy `,`, dấu gạch ngang `-` hoặc viết lại câu văn tự nhiên. |
| **R-03 (Mobile Target)**| Nút bấm, icon thao tác phải đạt chuẩn **44px $\times$ 44px**. | Các nút đóng modal, icon click trên mobile phải có vùng bấm đủ lớn (`min-w-[44px] min-h-[44px]` hoặc padding). |
| **R-05 (Button Shape)** | **Tránh lạm dụng `rounded-full`** cho nút hành động chính. | Sử dụng `rounded-xl` hoặc `rounded-lg` cho các nút bấm mua hàng/báo giá để giữ vẻ cứng cáp của ngành cơ khí xe tải. |
| **No Neon Glow** | **Tránh dùng hiệu ứng đổ bóng phát sáng neon ảo** (`shadow-[0_0_25px_rgba(...)]`). | Thay bằng bóng mờ tự nhiên (`shadow-md`, `shadow-lg`, `shadow-slate-900/10`) kết hợp viền sắc nét (`border border-slate-200`). |
| **No Eyebrow Spams** | **Tránh lặp lại capsule badge kèm chấm nhấp nháy (`animate-pulse`) ở mọi tiêu đề**. | Chỉ dùng hiệu ứng nhấp nháy cho dữ liệu động thực tế (ví dụ: trạng thái kết nối ERP thời gian thực). |
| **Mobile Overflow** | Kiểm tra giao diện ở độ phân giải 375px (iPhone). | Tuyệt đối không để xảy ra thanh cuộn ngang ngoài ý muốn (`overflow-x-hidden`). |

---

### BƯỚC 5: KIỂM TRA KIỂM THỬ & TYPE-CHECK
Chạy lệnh kiểm tra TypeScript tại thư mục `frontend`:
```bash
cd frontend
npx tsc --noEmit
```
* **Yêu cầu**: Kết quả không được có bất kỳ lỗi cú pháp hoặc Type error nào trước khi chuyển bước.

---

### BƯỚC 6: CẬP NHẬT TÀI LIỆU
Nếu thay đổi có ảnh hưởng đến luồng dữ liệu, API hoặc giao diện quản trị, cập nhật ngắn gọn vào:
- `memory/ai-journal.md`: Ghi nhận nhật ký kỹ thuật.
- `CLAUDE.md` / `AGENTS.md` (nếu có bổ sung convention mới).

---

### BƯỚC 7: COMMIT & PUSH GIT
Soạn nội dung commit theo chuẩn Conventional Commits:
```bash
git add .
git commit -m "feat(fe): <tóm tắt tính năng mới>"
# Hoặc
git commit -m "fix(fe): <tóm tắt lỗi được sửa>"
# Hoặc
git commit -m "refactor(fe): <tóm tắt nội dung tái cấu trúc>"
```
Đẩy lên nhánh làm việc:
```bash
git push origin <tên-nhánh>
```

