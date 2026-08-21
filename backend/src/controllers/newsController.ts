import { Request, Response, NextFunction } from "express";
import { NewsService } from "../services/newsService";

export class NewsController {
  /**
   * GET /api/v1/news - Public & Admin Get News Articles List
   */
  static async getNewsList(req: Request, res: Response, next: NextFunction) {
    try {
      const { categorySlug, search, page, limit } = req.query;
      const result = await NewsService.getNewsList({
        categorySlug: categorySlug as string,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      return res.status(200).json({
        success: true,
        data: result.news,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/news/:slug - Public Get Article Detail by Slug
   */
  static async getNewsBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug;
      const article = await NewsService.getNewsBySlug(slug);

      return res.status(200).json({
        success: true,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/news - Admin Create News Article
   */
  static async createNews(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, slug, categorySlug, content, thumbnailUrl, isFeatured } = req.body;
      const user = (req as any).user;

      const newArticle = await NewsService.createNews({
        title,
        slug,
        categorySlug,
        content,
        thumbnailUrl,
        isFeatured,
        authorId: user?.userId,
      });

      return res.status(201).json({
        success: true,
        message: "Tạo bài viết kỹ thuật thành công",
        data: newArticle,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/admin/news/:id - Admin Update News Article
   */
  static async updateNews(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { title, slug, categorySlug, content, thumbnailUrl, isFeatured } = req.body;

      const updated = await NewsService.updateNews(id, {
        title,
        slug,
        categorySlug,
        content,
        thumbnailUrl,
        isFeatured,
      });

      return res.status(200).json({
        success: true,
        message: "Cập nhật bài viết thành công",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/news/:id - Admin Delete News Article
   */
  static async deleteNews(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const result = await NewsService.deleteNews(id);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
