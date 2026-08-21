import { Router } from "express";
import { CategoryBannerController } from "../controllers/categoryBannerController";
import { verifyAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Public route to get home category banners
router.get("/category-banners", CategoryBannerController.getBanners);

// Admin routes
router.get("/admin/category-banners", verifyAdmin, CategoryBannerController.getAllBannersAdmin);
router.post("/admin/category-banners", verifyAdmin, CategoryBannerController.createBanner);
router.put("/admin/category-banners/:id", verifyAdmin, CategoryBannerController.updateBanner);
router.delete("/admin/category-banners/:id", verifyAdmin, CategoryBannerController.deleteBanner);

export default router;
