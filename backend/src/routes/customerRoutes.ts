import { Router } from "express";
import { CustomerController } from "../controllers/customerController";
import { verifyAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Protected Admin Customer Routes
router.get("/admin", verifyAdmin, CustomerController.getAdminCustomers);
router.put("/admin/:phone/notes", verifyAdmin, CustomerController.updateCustomerNotes);
router.get("/admin/:phone/history", verifyAdmin, CustomerController.getCustomerDetail);

export default router;
