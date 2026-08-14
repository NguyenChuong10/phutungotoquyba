import { Router } from "express";
import { JobPostingController } from "../controllers/jobPostingController";
import { verifyAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Public route to get active jobs
router.get("/", JobPostingController.getPublicJobPostings);

// Admin protected routes
router.get("/admin", verifyAdmin, JobPostingController.getAllJobPostings);
router.post("/admin", verifyAdmin, JobPostingController.createJobPosting);
router.put("/admin/:id", verifyAdmin, JobPostingController.updateJobPosting);
router.delete("/admin/:id", verifyAdmin, JobPostingController.deleteJobPosting);

export default router;
