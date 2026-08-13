import { Router } from "express";
import { SettingController } from "../controllers/settingController";
import { verifyAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Public Get Settings
router.get("/", SettingController.getSettings);

// Admin Protected Update Settings
router.put("/admin", verifyAdmin, SettingController.updateSettings);

export default router;
