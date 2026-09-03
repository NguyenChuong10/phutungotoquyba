import { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { AppError } from "../utils/AppError";

/**
 * Optimize an uploaded file with sharp to WebP format, KEEPING the original file intact.
 * Returns the original filename, webp filename, and size in bytes.
 */
async function optimizeUploadedFile(file: Express.Multer.File): Promise<{
  originalFilename: string;
  webpFilename: string;
  sizeBytes: number;
}> {
  const filePath = file.path;
  const ext = path.extname(filePath).toLowerCase();
  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);
  const webpFilename = `${baseName}.webp`;
  const webpPath = path.join(dir, webpFilename);

  // If already webp, return directly
  if (ext === ".webp") {
    return {
      originalFilename: file.filename,
      webpFilename: file.filename,
      sizeBytes: file.size,
    };
  }

  try {
    await sharp(filePath)
      .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 95, smartSubsample: true, effort: 6 })
      .toFile(webpPath);

    const stat = fs.statSync(webpPath);
    // KEEP ORIGINAL FILE INTACT (do NOT delete original file!)

    return {
      originalFilename: file.filename,
      webpFilename: webpFilename,
      sizeBytes: stat.size,
    };
  } catch (err) {
    console.error("Image optimization failed, using original:", err);
    return {
      originalFilename: file.filename,
      webpFilename: file.filename,
      sizeBytes: file.size,
    };
  }
}

export class UploadController {
  /**
   * POST /api/v1/admin/upload - Handle Product / Banner Image Upload (Preserves Original + WebP)
   */
  static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError("Vui lòng chọn file hình ảnh để upload", 400);
      }

      const { originalFilename, webpFilename, sizeBytes } = await optimizeUploadedFile(req.file);

      return res.status(200).json({
        success: true,
        message: "Upload thành công (Đã lưu bản gốc + tạo bản WebP tối ưu)",
        data: {
          imageUrl: `/uploads/${webpFilename}`,
          originalUrl: `/uploads/${originalFilename}`,
          filename: webpFilename,
          originalFilename: originalFilename,
          originalName: req.file.originalname,
          sizeBytes: sizeBytes,
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

      const uploadedFiles = await Promise.all(
        files.map(async (file, idx) => {
          const { originalFilename, webpFilename, sizeBytes } = await optimizeUploadedFile(file);
          return {
            imageUrl: `/uploads/${webpFilename}`,
            originalUrl: `/uploads/${originalFilename}`,
            filename: webpFilename,
            originalFilename: originalFilename,
            originalName: file.originalname,
            sizeBytes: sizeBytes,
            isPrimary: idx === 0,
            sortOrder: idx,
          };
        })
      );

      return res.status(200).json({
        success: true,
        message: `Upload thành công ${uploadedFiles.length} ảnh (Đã lưu bản gốc + tạo bản WebP tối ưu)`,
        data: uploadedFiles,
      });
    } catch (error) {
      next(error);
    }
  }
}
