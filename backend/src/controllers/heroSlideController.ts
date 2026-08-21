import { Request, Response, NextFunction } from "express";
import { HeroSlideService } from "../services/heroSlideService";

export class HeroSlideController {
  static async getSlidesPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const slides = await HeroSlideService.getActiveSlides();
      return res.json({
        success: true,
        ok: true,
        data: slides,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllSlidesAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const slides = await HeroSlideService.getAllSlidesAdmin();
      return res.json({
        success: true,
        ok: true,
        data: slides,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSlide(req: Request, res: Response, next: NextFunction) {
    try {
      const slide = await HeroSlideService.createSlide(req.body);
      return res.status(201).json({
        success: true,
        ok: true,
        message: "Tạo slide banner mới thành công",
        data: slide,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSlide(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const slide = await HeroSlideService.updateSlide(id, req.body);
      return res.json({
        success: true,
        ok: true,
        message: "Cập nhật slide banner thành công",
        data: slide,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSlide(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await HeroSlideService.deleteSlide(id);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
