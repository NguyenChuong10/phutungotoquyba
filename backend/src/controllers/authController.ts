import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { loginSchema } from "../validators/authValidator";

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Validate Input Body với Zod
      const validatedInput = loginSchema.parse(req.body);

      // 2. Gọi Service thực thi Đăng nhập Admin
      const result = await AuthService.loginAdmin(validatedInput);

      // 3. Trả về kết quả thành công
      return res.status(200).json({
        success: true,
        message: "Đăng nhập hệ thống Quản trị thành công",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
