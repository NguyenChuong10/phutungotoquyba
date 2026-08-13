import { Request, Response, NextFunction } from "express";
import { PartnerBrandService } from "../services/partnerBrandService";

export class PartnerBrandController {
  /**
   * GET /api/v1/partner-brands - Public Get All Partner Brands
   */
  static async getPartnerBrands(req: Request, res: Response, next: NextFunction) {
    try {
      const brands = await PartnerBrandService.getPartnerBrands();
      return res.json({
        success: true,
        data: brands,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/partner-brands - Admin Create Partner Brand
   */
  static async createPartnerBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, logoUrl } = req.body;
      const brand = await PartnerBrandService.createPartnerBrand({ name, logoUrl });
      return res.status(201).json({
        success: true,
        message: "Đã tạo thương hiệu đối tác mới vào CSDL.",
        data: brand,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/admin/partner-brands/:id - Admin Update Partner Brand
   */
  static async updatePartnerBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, logoUrl } = req.body;
      const brand = await PartnerBrandService.updatePartnerBrand(id, { name, logoUrl });
      return res.json({
        success: true,
        message: "Đã cập nhật thương hiệu đối tác trong CSDL.",
        data: brand,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/partner-brands/:id - Admin Delete Partner Brand
   */
  static async deletePartnerBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await PartnerBrandService.deletePartnerBrand(id);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
