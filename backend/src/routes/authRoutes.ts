import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { verifyAdmin, AuthenticatedRequest } from "../middlewares/authMiddleware";
import { loginRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

// POST /api/v1/auth/login - Đăng nhập tài khoản Admin (Tích hợp Brute Force Rate Limiter)
router.post("/login", loginRateLimiter, AuthController.login);

// GET /api/v1/auth/me - Lấy thông tin Admin đang đăng nhập (Protected Route)
router.get("/me", verifyAdmin, (req: AuthenticatedRequest, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

export default router;
