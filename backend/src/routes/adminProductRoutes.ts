import { Router } from "express";
import { ProductController } from "../controllers/productController";
import { verifyAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Protect all admin product routes with JWT verifyAdmin middleware
router.use(verifyAdmin);

// GET /api/v1/admin/products - Admin Full Product Inventory Catalog
router.get("/", ProductController.getAdminProducts);

// POST /api/v1/admin/products - Admin Create Product
router.post("/", ProductController.createProduct);

// PUT /api/v1/admin/products/:id - Admin Update Product
router.put("/:id", ProductController.updateProduct);

// DELETE /api/v1/admin/products/:id - Admin Delete Product
router.delete("/:id", ProductController.deleteProduct);

// PATCH /api/v1/admin/products/:id/stock - Admin Adjust Stock & Prices
router.patch("/:id/stock", ProductController.adjustProductStockAndPrice);

export default router;
