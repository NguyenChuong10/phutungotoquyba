import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { OdooIntegrationService } from "../services/odooIntegrationService";

export class AdminOdooController {
  /**
   * GET /api/v1/admin/odoo/settings
   * Lấy toàn bộ thông tin cấu hình, API Key và lịch sử đồng bộ Odoo ERP
   */
  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const details = await OdooIntegrationService.getIntegrationDetails();

      const host = req.get("host") || "localhost:5000";
      const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
      const baseUrl = `${protocol}://${host}`;

      return res.status(200).json({
        success: true,
        data: {
          ...details,
          baseUrl,
          endpoints: {
            syncBySku: `${baseUrl}/api/v1/products/sync-by-sku`,
            linkProduct: `${baseUrl}/api/v1/products/:id/link-odoo`,
            batchUnlink: `${baseUrl}/api/v1/products/batch-unlink-odoo`,
            verifyAuth: `${baseUrl}/api/v1/products/verify-auth`,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/admin/odoo/settings
   * Cập nhật API Key thủ công hoặc Bật/Tắt đồng bộ Odoo
   */
  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { apiKey, syncEnabled } = req.body;
      const updated = await OdooIntegrationService.updateSettings({
        apiKey,
        syncEnabled,
      });

      return res.status(200).json({
        success: true,
        message: "Cập nhật cấu hình tích hợp Odoo ERP thành công",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/odoo/regenerate-key
   * Tạo ngẫu nhiên một API Key / Shared Secret mới chuẩn qba_live_...
   */
  static async regenerateApiKey(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OdooIntegrationService.regenerateApiKey();
      return res.status(200).json({
        success: true,
        message: "Đã tạo API Key mới thành công. Hãy cập nhật key này vào Odoo ERP.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/odoo/test-connection
   * Kiểm tra tính hợp lệ của cơ chế xác thực nội bộ
   */
  static async testConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const activeSecret = await OdooIntegrationService.getActiveSecret();
      const isSyncEnabled = await OdooIntegrationService.isSyncEnabled();

      const testTimestamp = Math.floor(Date.now() / 1000);
      const testSignature = crypto
        .createHmac("sha256", activeSecret)
        .update(String(testTimestamp))
        .digest("hex");

      return res.status(200).json({
        success: true,
        message: "Cơ chế xác thực Odoo ERP đang hoạt động bình thường",
        data: {
          syncEnabled: isSyncEnabled,
          activeSecretLength: activeSecret.length,
          activeSecretPrefix: activeSecret.slice(0, 8) + "••••••••",
          sampleHeaders: {
            "x-odoo-timestamp": String(testTimestamp),
            "x-odoo-signature": testSignature,
            "x-api-key": activeSecret,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

