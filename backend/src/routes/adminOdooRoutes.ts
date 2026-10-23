import { Router } from "express";
import { AdminOdooController } from "../controllers/adminOdooController";
import { verifyAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Tất cả các route quản lý Odoo đều yêu cầu quyền Quản trị viên
router.use(verifyAdmin);

// Lấy thông tin cấu hình Odoo, API Key và lịch sử đồng bộ
router.get("/settings", AdminOdooController.getSettings);

// Cập nhật cấu hình Odoo (đổi key thủ công hoặc bật/tắt sync)
router.put("/settings", AdminOdooController.updateSettings);

// Sinh mã API Key ngẫu nhiên mới (Regenerate Key)
router.post("/regenerate-key", AdminOdooController.regenerateApiKey);

// Kiểm tra kết nối & sinh chữ ký mẫu để test
router.post("/test-connection", AdminOdooController.testConnection);

export default router;

