import { Request, Response, NextFunction } from "express";
import { JobPostingService } from "../services/jobPostingService";

export class JobPostingController {
  static async getPublicJobPostings(_req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await JobPostingService.getPublicJobPostings();
      res.status(200).json({ success: true, data: jobs });
    } catch (err) {
      next(err);
    }
  }

  static async getAllJobPostings(_req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await JobPostingService.getAllJobPostings();
      res.status(200).json({ success: true, data: jobs });
    } catch (err) {
      next(err);
    }
  }

  static async createJobPosting(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await JobPostingService.createJobPosting(req.body);
      res.status(201).json({
        success: true,
        message: "Tạo tin tuyển dụng mới thành công!",
        data: job,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateJobPosting(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const updated = await JobPostingService.updateJobPosting(id, req.body);
      res.status(200).json({
        success: true,
        message: "Cập nhật tin tuyển dụng thành công!",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteJobPosting(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await JobPostingService.deleteJobPosting(id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
