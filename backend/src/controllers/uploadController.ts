import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export class UploadController {
  /**
   * POST /api/v1/admin/upload - Handle Product Image Upload
   */
  static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError("Vui lòng chọn file hình ảnh để upload", 400);
      }

      // Return uploaded file URL
      const fileUrl = `/uploads/${req.file.filename}`;

      return res.status(200).json({
        success: true,
        message: "Upload ảnh phụ tùng chuẩn SEO thành công",
        data: {
          imageUrl: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          sizeBytes: req.file.size,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/upload/multiple - Handle Multiple Product Images Upload
   */
  static async uploadMultipleImages(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new AppError("Vui lòng chọn ít nhất 1 file hình ảnh để upload", 400);
      }

      const uploadedFiles = files.map((file, idx) => ({
        imageUrl: `/uploads/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        sizeBytes: file.size,
        isPrimary: idx === 0,
        sortOrder: idx,
      }));

      return res.status(200).json({
        success: true,
        message: `Upload thành công ${uploadedFiles.length} ảnh phụ tùng chuẩn SEO`,
        data: uploadedFiles,
      });
    } catch (error) {
      next(error);
    }
  }
}
