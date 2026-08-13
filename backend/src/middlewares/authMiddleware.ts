import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { AppError } from "../utils/AppError";

const ADMIN_ROLES = ["super_admin", "sales", "warehouse", "content_editor"];

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function verifyAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Vui lòng cung cấp mã truy cập (Bearer Token)", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!ADMIN_ROLES.includes(decoded.role)) {
      throw new AppError("Bạn không có quyền truy cập vào tài nguyên Quản trị", 403);
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Mã xác thực không hợp lệ hoặc đã hết hạn", 401));
    }
  }
}
