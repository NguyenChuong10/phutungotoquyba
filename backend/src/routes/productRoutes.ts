import { Router } from "express";
import { ProductController } from "../controllers/productController";

const router = Router();

// GET /api/v1/products - Public Product Query (Data Privacy Masked)
router.get("/", ProductController.getPublicProducts);

// GET /api/v1/products/:identifier - Public Get Single Product Detail by ID or Slug
router.get("/:identifier", ProductController.getPublicProductByIdOrSlug);

export default router;
