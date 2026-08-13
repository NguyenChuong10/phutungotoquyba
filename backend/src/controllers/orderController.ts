import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/orderService";
import { createQuotationOrderSchema } from "../validators/orderValidator";

export class OrderController {
  /**
   * POST /api/v1/orders/quotation - Public Create Fast Quotation Order Request
   */
  static async createQuotationOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = createQuotationOrderSchema.parse(req.body);
      const order = await OrderService.createQuotationOrder(validatedInput);

      return res.status(201).json({
        success: true,
        message: "Yêu cầu báo giá phụ tùng của bạn đã được gửi thành công. Nhân viên Q.BA sẽ liên hệ lại ngay!",
        data: {
          orderCode: order.orderCode,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          createdAt: order.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/orders/admin - Admin Get Orders List
   */
  static async getAdminOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 50;

      const result = await OrderService.getAdminOrders({ status, page, limit });

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/orders/admin/customer-history/:phone - Admin Get Customer Order History
   */
  static async getCustomerOrderHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const phone = req.params.phone;
      const history = await OrderService.getCustomerOrderHistory(phone);

      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/orders/admin/:id/status - Admin Update Order Status
   */
  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const status = req.body.status as "pending" | "confirmed" | "completed" | "cancelled";

      const updatedOrder = await OrderService.updateOrderStatus(id, status);

      return res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái đơn báo giá thành công",
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/orders/admin/:id - Admin Update Full Order Details
   */
  static async updateOrderDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const updatedOrder = await OrderService.updateOrderDetails(id, req.body);

      return res.status(200).json({
        success: true,
        message: "Cập nhật thông tin đơn báo giá thành công",
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/orders/admin/:id - Admin Delete Single Order
   */
  static async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await OrderService.deleteOrder(id);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/orders/admin/customer/:phone - Admin Delete All Orders of a Customer Phone
   */
  static async deleteCustomerGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const phone = req.params.phone;
      const result = await OrderService.deleteCustomerGroup(phone);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/orders/admin/analytics - Admin Get Real-Time Dashboard Analytics
   */
  static async getDashboardAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await OrderService.getDashboardAnalytics();

      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
}
