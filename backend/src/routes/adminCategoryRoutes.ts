import { Router } from "express";
import { CategoryController } from "../controllers/categoryController";
import { verifyAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Protect all admin category routes with JWT verifyAdmin middleware
router.use(verifyAdmin);

// POST /api/v1/admin/categories - Create Category (Main or Sub-Category via parentId)
router.post("/", CategoryController.createCategory);

// PUT /api/v1/admin/categories/:id - Update Category
router.put("/:id", CategoryController.updateCategory);

// DELETE /api/v1/admin/categories/:id - Delete Category
router.delete("/:id", CategoryController.deleteCategory);

export default router;
