import { Router } from "express";
import { OrderController } from "../controllers/orderController";
import { verifyAdmin } from "../middlewares/authMiddleware";
import { quotationRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

// POST /api/v1/orders/quotation - Public Create Fast Quotation Request (Rate Limited)
router.post("/quotation", quotationRateLimiter, OrderController.createQuotationOrder);

// Admin Order Management Routes (Protected with JWT verifyAdmin)
router.get("/admin", verifyAdmin, OrderController.getAdminOrders);
router.get("/admin/analytics", verifyAdmin, OrderController.getDashboardAnalytics);
router.post("/admin", verifyAdmin, OrderController.createQuotationOrder);
router.get("/admin/customer-history/:phone", verifyAdmin, OrderController.getCustomerOrderHistory);
router.put("/admin/:id/status", verifyAdmin, OrderController.updateOrderStatus);
router.put("/admin/:id", verifyAdmin, OrderController.updateOrderDetails);
router.delete("/admin/:id", verifyAdmin, OrderController.deleteOrder);
router.delete("/admin/customer/:phone", verifyAdmin, OrderController.deleteCustomerGroup);

export default router;
