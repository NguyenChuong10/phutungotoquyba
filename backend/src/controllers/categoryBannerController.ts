import { Request, Response, NextFunction } from "express";
import { CategoryBannerService } from "../services/categoryBannerService";

export class CategoryBannerController {
  static async getBanners(req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await CategoryBannerService.getActiveBanners();
      return res.json({
        success: true,
        ok: true,
        data: banners,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllBannersAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await CategoryBannerService.getCategoryBanners();
      return res.json({
        success: true,
        ok: true,
        data: banners,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await CategoryBannerService.createBanner(req.body);
      return res.status(201).json({
        success: true,
        ok: true,
        message: "Tạo banner danh mục mới thành công",
        data: banner,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const banner = await CategoryBannerService.updateBanner(id, req.body);
      return res.json({
        success: true,
        ok: true,
        message: "Cập nhật banner danh mục thành công",
        data: banner,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await CategoryBannerService.deleteBanner(id);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
