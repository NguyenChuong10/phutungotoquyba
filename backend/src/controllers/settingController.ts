import { Request, Response, NextFunction } from "express";
import { SettingService } from "../services/settingService";

export class SettingController {
  /**
   * GET /api/v1/settings - Public & Admin Get System Settings
   */
  static async getSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingService.getSettings();
      return res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/admin/settings - Admin Update System Settings
   */
  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settingsData = req.body;
      const updated = await SettingService.updateSettings(settingsData);
      return res.status(200).json({
        success: true,
        message: "Cập nhật cấu hình hệ thống thành công",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
