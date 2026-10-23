import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";
import { OdooIntegrationService } from "../services/odooIntegrationService";

const ADMIN_ROLES = ["super_admin", "sales", "warehouse", "content_editor"];

/**
 * Middleware xác thực đa phương thức:
 * 1. Chấp nhận chữ ký điện tử HMAC-SHA256 từ Odoo ERP (x-odoo-timestamp & x-odoo-signature)
 * 2. Chấp nhận Direct API Key (header x-odoo-api-key hoặc x-api-key)
 * 3. Chấp nhận Bearer Token: Nếu trùng API Key Odoo hoặc là Bearer JWT của Quản trị viên
 */
export async function verifyOdooOrAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const activeSecret = await OdooIntegrationService.getActiveSecret();
    const isSyncEnabled = await OdooIntegrationService.isSyncEnabled();

    // 1. Kiểm tra xác thực HMAC-SHA256 từ Odoo ERP
    const timestampHeader = req.headers["x-odoo-timestamp"];
    const signatureHeader = req.headers["x-odoo-signature"];

    if (timestampHeader && signatureHeader) {
      if (!isSyncEnabled) {
        return next(
          new AppError(
            "Tích hợp Odoo ERP hiện đang tạm ngắt kết nối bởi Quản trị viên trong Cài đặt Hệ thống.",
            403
          )
        );
      }

      const timestampStr = Array.isArray(timestampHeader) ? timestampHeader[0] : timestampHeader;
      const signatureStr = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
      const timestamp = parseInt(timestampStr, 10);

      if (!isNaN(timestamp)) {
        const nowSec = Math.floor(Date.now() / 1000);
        // Chống Replay Attack: Cho phép độ lệch tối đa 300 giây (5 phút)
        if (Math.abs(nowSec - timestamp) <= 300) {
          const expectedSignature = crypto
            .createHmac("sha256", activeSecret)
            .update(String(timestamp))
            .digest("hex");

          if (
            signatureStr.length === expectedSignature.length &&
            crypto.timingSafeEqual(Buffer.from(signatureStr, "utf-8"), Buffer.from(expectedSignature, "utf-8"))
          ) {
            (req as any).isOdooMachine = true;
            return next();
          }
        } else {
          return next(new AppError("Chữ ký xác thực Odoo đã hết hạn (Timestamp expired).", 401));
        }
      }
    }

    // 2. Kiểm tra Direct API Key qua Header (x-odoo-api-key hoặc x-api-key)
    const directApiKeyHeader = req.headers["x-odoo-api-key"] || req.headers["x-api-key"];
    if (directApiKeyHeader) {
      if (!isSyncEnabled) {
        return next(
          new AppError(
            "Tích hợp Odoo ERP hiện đang tạm ngắt kết nối bởi Quản trị viên trong Cài đặt Hệ thống.",
            403
          )
        );
      }

      const providedKey = Array.isArray(directApiKeyHeader) ? directApiKeyHeader[0] : directApiKeyHeader;
      if (
        providedKey.length === activeSecret.length &&
        crypto.timingSafeEqual(Buffer.from(providedKey, "utf-8"), Buffer.from(activeSecret, "utf-8"))
      ) {
        (req as any).isOdooMachine = true;
        return next();
      }
    }

    // 3. Fallback: Kiểm tra Bearer Token (Có thể là API Key Odoo hoặc Admin JWT)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      // 3.1. Nếu Bearer Token khớp chính xác với API Key Odoo
      if (
        token.length === activeSecret.length &&
        crypto.timingSafeEqual(Buffer.from(token, "utf-8"), Buffer.from(activeSecret, "utf-8"))
      ) {
        if (!isSyncEnabled) {
          return next(
            new AppError(
              "Tích hợp Odoo ERP hiện đang tạm ngắt kết nối bởi Quản trị viên trong Cài đặt Hệ thống.",
              403
            )
          );
        }
        (req as any).isOdooMachine = true;
        return next();
      }

      // 3.2. Nếu Bearer Token là JWT của Quản trị viên Web (Admin UI)
      try {
        const decoded = verifyToken(token);
        if (ADMIN_ROLES.includes(decoded.role)) {
          (req as any).user = decoded;
          return next();
        }
      } catch {
        // JWT không hợp lệ
      }
    }

    // 4. Từ chối mọi yêu cầu không có xác thực hợp lệ
    return next(
      new AppError(
        "Không có quyền truy cập. Yêu cầu API Key/HMAC hợp lệ từ Odoo ERP hoặc quyền Quản trị.",
        401
      )
    );
  } catch (error) {
    next(error);
  }
}
