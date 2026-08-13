import prisma from "../config/db";
import { AppError } from "../utils/AppError";
import { comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { LoginInput } from "../validators/authValidator";

const ADMIN_ROLES = ["super_admin", "sales", "warehouse", "content_editor"];

export class AuthService {
  static async loginAdmin(input: LoginInput) {
    const { email, password } = input;

    // 1. Tìm người dùng trong Database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // Dùng hash giả để chống tấn công đo thời gian (Timing Attack User Enumeration)
    const DUMMY_HASH = "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ0123";

    if (!user) {
      // Thực hiện so sánh mật khẩu giả để thời gian phản hồi đồng nhất
      await comparePassword(password, DUMMY_HASH);
      throw new AppError("Email hoặc mật khẩu không chính xác", 401);
    }

    // 2. Kiểm tra mật khẩu trước tiên bằng thuật toán mã hóa Bcrypt
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Email hoặc mật khẩu không chính xác", 401);
    }

    // 3. Kiểm tra trạng thái tài khoản
    if (!user.isActive) {
      throw new AppError("Tài khoản quản trị đã bị vô hiệu hóa. Vui lòng liên hệ Admin", 403);
    }

    // 4. Phân quyền: Kiểm tra vai trò Admin
    if (!ADMIN_ROLES.includes(user.role)) {
      throw new AppError("Email hoặc mật khẩu không chính xác", 401); // Không tiết lộ sự tồn tại của role
    }

    // 5. Tạo JWT Token
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role
      },
      accessToken
    };
  }
}
