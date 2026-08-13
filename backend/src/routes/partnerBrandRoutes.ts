import { Router } from "express";
import { PartnerBrandController } from "../controllers/partnerBrandController";
import { verifyAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Public Get All Partner Brands
router.get("/", PartnerBrandController.getPartnerBrands);

// Admin Protected Partner Brand Operations
router.post("/admin", verifyAdmin, PartnerBrandController.createPartnerBrand);
router.put("/admin/:id", verifyAdmin, PartnerBrandController.updatePartnerBrand);
router.delete("/admin/:id", verifyAdmin, PartnerBrandController.deletePartnerBrand);

export default router;
