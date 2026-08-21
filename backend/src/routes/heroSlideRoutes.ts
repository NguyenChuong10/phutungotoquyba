import { Router } from "express";
import { HeroSlideController } from "../controllers/heroSlideController";
import { verifyAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Public route for home page hero slides
router.get("/hero-slides", HeroSlideController.getSlidesPublic);

// Protected admin routes
router.get("/admin/hero-slides", verifyAdmin, HeroSlideController.getAllSlidesAdmin);
router.post("/admin/hero-slides", verifyAdmin, HeroSlideController.createSlide);
router.put("/admin/hero-slides/:id", verifyAdmin, HeroSlideController.updateSlide);
router.delete("/admin/hero-slides/:id", verifyAdmin, HeroSlideController.deleteSlide);

export default router;
