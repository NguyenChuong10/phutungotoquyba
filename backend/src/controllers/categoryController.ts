import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/categoryService";
import { createCategorySchema, updateCategorySchema } from "../validators/categoryValidator";

export class CategoryController {
  /**
   * GET /api/v1/categories - Get 2-Level Category Tree
   */
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getCategoryTree();
      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/categories/:id - Get Category by ID
   */
  static async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const category = await CategoryService.getCategoryById(id);
      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/categories - Create Category (Admin Only)
   */
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = createCategorySchema.parse(req.body);
      const newCategory = await CategoryService.createCategory(validatedInput);
      return res.status(201).json({
        success: true,
        message: "Tạo danh mục phụ tùng mới thành công",
        data: newCategory,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/admin/categories/:id - Update Category (Admin Only)
   */
  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const validatedInput = updateCategorySchema.parse(req.body);
      const updatedCategory = await CategoryService.updateCategory(id, validatedInput);
      return res.status(200).json({
        success: true,
        message: "Cập nhật danh mục thành công",
        data: updatedCategory,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/categories/:id - Delete Category (Admin Only)
   */
  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await CategoryService.deleteCategory(id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
