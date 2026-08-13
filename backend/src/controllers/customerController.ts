import { Request, Response, NextFunction } from "express";
import { CustomerService } from "../services/customerService";

export class CustomerController {
  /**
   * GET /api/v1/admin/customers - Fetch All Admin Customers List with VIP Tiers
   */
  static async getAdminCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const customers = await CustomerService.getAdminCustomers(search);

      return res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/admin/customers/:phone/notes - Update Gara Consultation Notes
   */
  static async updateCustomerNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const phone = req.params.phone;
      const { notes } = req.body;

      const updated = await CustomerService.updateCustomerNotes(phone, notes || "");

      return res.status(200).json({
        success: true,
        message: "Cập nhật ghi chú Gara/Khách hàng thành công",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/customers/:phone/history - Fetch Full Customer Order History
   */
  static async getCustomerDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const phone = req.params.phone;
      const detail = await CustomerService.getCustomerDetail(phone);

      return res.status(200).json({
        success: true,
        data: detail,
      });
    } catch (error) {
      next(error);
    }
  }
}
