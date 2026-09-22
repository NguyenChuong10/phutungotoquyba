import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1. Lỗi Validation Zod
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => e.message).join("; ");
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: formattedErrors
      }
    });
  }

  // 2. Lỗi AppError Custom
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: "APP_ERROR",
        message: err.message
      }
    });
  }

  // 3. Lỗi Prisma Unique Constraint Violation (P2002)
  if (err?.code === 'P2002') {
    const fields = Array.isArray(err?.meta?.target) ? err.meta.target.join(', ') : 'tên hoặc mã';
    return res.status(400).json({
      success: false,
      error: {
        code: "DUPLICATE_ERROR",
        message: `Sản phẩm phụ tùng này (${fields}) đã tồn tại trong kho hàng và không được tạo lại!`
      }
    });
  }

  // 4. Lỗi Multer Upload Error
  if (err?.name === "MulterError") {
    let message = "Lỗi upload file";
    if (err.code === "LIMIT_FILE_SIZE") message = "Kích thước file vượt quá giới hạn 10MB";
    else if (err.code === "LIMIT_FILE_COUNT") message = "Số lượng file tải lên vượt quá giới hạn cho phép";
    else if (err.code === "LIMIT_UNEXPECTED_FILE") message = "Trường file upload không đúng hoặc vượt số lượng cho phép";
    else message = err.message || message;

    return res.status(400).json({
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message: message
      }
    });
  }

  // 5. Lỗi Server 500 không xác định
  console.error("🔥 [Unhandled Server Error]:", err);
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau."
    }
  });
}
