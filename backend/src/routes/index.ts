import { Router } from "express";
import authRoutes from "./authRoutes";
import categoryRoutes from "./categoryRoutes";
import adminCategoryRoutes from "./adminCategoryRoutes";
import productRoutes from "./productRoutes";
import adminProductRoutes from "./adminProductRoutes";
import orderRoutes from "./orderRoutes";
import uploadRoutes from "./uploadRoutes";
import brandRoutes from "./brandRoutes";
import adminBrandRoutes from "./adminBrandRoutes";
import customerRoutes from "./customerRoutes";
import newsRoutes from "./newsRoutes";
import settingRoutes from "./settingRoutes";

const router = Router();

// Health Check API
router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "online",
    service: "Phu Tung Oto Q.BA Enterprise API",
    timestamp: new Date().toISOString(),
  });
});

// Public API Routes
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/customers", customerRoutes);
router.use("/news", newsRoutes);
router.use("/settings", settingRoutes);

// Protected Admin API Routes (JWT Auth Enforced)
router.use("/admin/categories", adminCategoryRoutes);
router.use("/admin/brands", adminBrandRoutes);
router.use("/admin/products", adminProductRoutes);
router.use("/admin/upload", uploadRoutes);

export default router;
