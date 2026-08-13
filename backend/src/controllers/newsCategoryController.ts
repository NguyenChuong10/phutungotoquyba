import { Request, Response, NextFunction } from "express";
import { NewsCategoryService } from "../services/newsCategoryService";

export class NewsCategoryController {
  /**
   * GET /api/v1/news/categories - Get All News Categories
   */
  static async getAllCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await NewsCategoryService.getAllCategories();
      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/news/categories - Create News Category
   */
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const category = await NewsCategoryService.createCategory(name);
      return res.status(201).json({
        success: true,
        message: "Tạo danh mục bài viết thành công",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/admin/news/categories/:id - Update News Category
   */
  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      const updated = await NewsCategoryService.updateCategory(id, name);
      return res.status(200).json({
        success: true,
        message: "Cập nhật danh mục thành công",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/news/categories/:id - Delete News Category
   */
  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const result = await NewsCategoryService.deleteCategory(id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
