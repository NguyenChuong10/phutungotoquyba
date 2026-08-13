import { Router } from "express";
import { CategoryController } from "../controllers/categoryController";

const router = Router();

// GET /api/v1/categories - Get 2-Level Category Tree
router.get("/", CategoryController.getCategories);

// GET /api/v1/categories/:id - Get Category detail
router.get("/:id", CategoryController.getCategoryById);

export default router;
