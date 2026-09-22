import { Router } from "express";
import { NewsController } from "../controllers/newsController";
import { NewsCategoryController } from "../controllers/newsCategoryController";
import { verifyAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Admin Protected News Category Routes (Must be declared before /:slug and /:id)
router.put("/admin/categories/reorder", verifyAdmin, NewsCategoryController.reorderCategories);
router.post("/admin/categories", verifyAdmin, NewsCategoryController.createCategory);
router.put("/admin/categories/:id", verifyAdmin, NewsCategoryController.updateCategory);
router.delete("/admin/categories/:id", verifyAdmin, NewsCategoryController.deleteCategory);

// Admin Protected News Article Routes (Must be declared before /:slug)
router.get("/admin/list", verifyAdmin, NewsController.getNewsList);
router.get("/admin/detail/:slug", verifyAdmin, NewsController.getNewsBySlug);
router.post("/admin", verifyAdmin, NewsController.createNews);
router.put("/admin/:id", verifyAdmin, NewsController.updateNews);
router.delete("/admin/:id", verifyAdmin, NewsController.deleteNews);

// Public News Category & Articles Routes
router.get("/categories", NewsCategoryController.getAllCategories);
router.get("/", NewsController.getNewsList);
router.get("/:slug", NewsController.getNewsBySlug);

export default router;
