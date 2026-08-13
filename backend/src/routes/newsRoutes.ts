import { Router } from "express";
import { NewsController } from "../controllers/newsController";
import { NewsCategoryController } from "../controllers/newsCategoryController";
import { verifyAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Public News Category & Articles Routes
router.get("/categories", NewsCategoryController.getAllCategories);
router.get("/", NewsController.getNewsList);
router.get("/:slug", NewsController.getNewsBySlug);

// Admin Protected News Category Routes
router.post("/admin/categories", verifyAdmin, NewsCategoryController.createCategory);
router.put("/admin/categories/:id", verifyAdmin, NewsCategoryController.updateCategory);
router.delete("/admin/categories/:id", verifyAdmin, NewsCategoryController.deleteCategory);

// Admin Protected News Article Routes
router.get("/admin/list", verifyAdmin, NewsController.getNewsList);
router.post("/admin", verifyAdmin, NewsController.createNews);
router.put("/admin/:id", verifyAdmin, NewsController.updateNews);
router.delete("/admin/:id", verifyAdmin, NewsController.deleteNews);

export default router;
