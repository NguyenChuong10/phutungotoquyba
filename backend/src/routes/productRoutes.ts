import { Router } from "express";
import { ProductController } from "../controllers/productController";
import { verifyOdooOrAdmin } from "../middlewares/odooAuthMiddleware";

const router = Router();

// GET /api/v1/products - Public Product Query (Data Privacy Masked)
router.get("/", ProductController.getPublicProducts);

// GET /api/v1/products/verify-auth - Test API Connection & HMAC-SHA256 Auth
router.get("/verify-auth", verifyOdooOrAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Xác thực chữ ký điện tử HMAC thành công!",
  });
});

// GET /api/v1/products/:identifier - Public Get Single Product Detail by ID or Slug
router.get("/:identifier", ProductController.getPublicProductByIdOrSlug);

// POST /api/v1/products/sync-by-sku - Batch sync products by SKU with Odoo ERP (Protected by HMAC / Admin JWT)
router.post("/sync-by-sku", verifyOdooOrAdmin, ProductController.syncOdooBySku);

// POST /api/v1/products/batch-unlink-odoo - Batch unlink products from Odoo ERP (Protected by HMAC / Admin JWT)
router.post("/batch-unlink-odoo", verifyOdooOrAdmin, ProductController.batchUnlinkOdooProducts);

// POST /api/v1/products/:id/link-odoo - Link or Unlink Product with Odoo ERP (Protected by HMAC / Admin JWT)
router.post("/:id/link-odoo", verifyOdooOrAdmin, ProductController.linkOdooProduct);

// DELETE /api/v1/products/:id/link-odoo - Unlink Product from Odoo ERP (Protected by HMAC / Admin JWT)
router.delete("/:id/link-odoo", verifyOdooOrAdmin, ProductController.unlinkOdooProduct);

export default router;
