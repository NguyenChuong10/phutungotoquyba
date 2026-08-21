import prisma from "../config/db";
import { AppError } from "../utils/AppError";

let isJobTableVerified = false;

export async function ensureJobPostingsTable() {
  if (isJobTableVerified) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS job_postings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        type VARCHAR(100) DEFAULT 'Toàn thời gian',
        salary VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        quantity VARCHAR(100) DEFAULT '01 Người',
        requirements JSONB DEFAULT '[]'::jsonb,
        responsibilities JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Auto-seed initial job postings into PostgreSQL CSDL if table is empty
    const db = (prisma as any).jobPosting;
    const count = await db.count();
    if (count === 0) {
      const initialJobs = [
        {
          title: "NHÂN VIÊN KINH DOANH PHỤ TÙNG XE TẢI",
          slug: "nhan-vien-kinh-doanh-phu-tung-xe-tai",
          salary: "12.000.000đ - 25.000.000đ + % Hoa hồng",
          location: "43-45 Nguyễn Văn Tạo, Q. Thanh Khê, Đà Nẵng",
          quantity: "03 Người",
          type: "Toàn thời gian",
          requirements: [
            "Am hiểu hoặc từng bán phụ tùng xe tải nặng Trung Quốc (HOWO, Shacman, FAW, Dongfeng...)",
            "Có khả năng giao tiếp tốt với chủ xe, tài xế, chủ garage và đơn vị vận tải",
            "Nhanh nhẹn, trung thực, có tinh thần trách nhiệm cao với công việc",
            "Có kỹ năng tra cứu mã sản phẩm cơ bản là một lợi thế"
          ],
          responsibilities: [
            "Báo giá và tư vấn bán lẻ/bán sỉ phụ tùng cho khách hàng trực tiếp và qua Zalo/Điện thoại",
            "Chăm sóc danh sách garage, hạm đội xe ben, xe đầu kéo khu vực Miền Trung, Tây Nguyên và toàn quốc",
            "Phối hợp với kho hàng chuẩn bị đơn hàng gửi xe toàn quốc"
          ],
          isActive: true,
          sortOrder: 1,
        },
        {
          title: "KỸ THUẬT VIÊN TRA CATALOG & MÃ PHỤ TÙNG",
          slug: "ky-thuat-vien-tra-catalog-ma-phu-tung",
          salary: "10.000.000đ - 18.000.000đ",
          location: "43-45 Nguyễn Văn Tạo, Q. Thanh Khê, Đà Nẵng",
          quantity: "02 Người",
          type: "Toàn thời gian",
          requirements: [
            "Tốt nghiệp Chuyên ngành Ô tô hoặc có 1 năm kinh nghiệm tra cứu catalog kỹ thuật",
            "Thành thạo phần mềm tra mã Sinotruk, Weichai, Yuchai, Fast Gear",
            "Cẩn thận, chính xác 100% trong việc soi mã phụ tùng cơ khí"
          ],
          responsibilities: [
            "Tiếp nhận số khung (VIN), mã động cơ từ khách hàng để xuất mã phụ tùng chính xác",
            "Đảm bảo tư vấn đúng thông số kỹ thuật (lá lót, phớt, chạt tay gạt, bộ rơ-moóc...)",
            "Cập nhật dữ liệu danh mục phụ tùng mới nhập kho"
          ],
          isActive: true,
          sortOrder: 2,
        },
        {
          title: "THỦ KHO & QUẢN LÝ KIỆN HÀNG PHỤ TÙNG",
          slug: "thu-kho-quan-ly-kien-hang-phu-tung",
          salary: "9.000.000đ - 14.000.000đ",
          location: "43-45 Nguyễn Văn Tạo, Q. Thanh Khê, Đà Nẵng",
          quantity: "02 Người",
          type: "Toàn thời gian",
          requirements: [
            "Sức khỏe tốt, chịu khó, cẩn thận trong việc sắp xếp hàng hóa phụ tùng nặng",
            "Trung thực, có kinh nghiệm quản lý kho hàng cơ khí/ô tô là một lợi thế",
            "Biết đóng gói thùng gỗ, cố định kiện hàng chịu lực"
          ],
          responsibilities: [
            "Quản lý nhập - xuất - tồn kho phụ tùng xe tải Q.BA",
            "Đóng gói hàng hóa chắc chắn và giao gửi chành xe toàn quốc đúng tiến độ",
            "Kiểm kê hàng định kỳ cùng bộ phận kế toán"
          ],
          isActive: true,
          sortOrder: 3,
        }
      ];

      for (const jobData of initialJobs) {
        try {
          await db.create({ data: jobData });
        } catch {
          // Ignore unique duplicate slug fallback
        }
      }
    }

    isJobTableVerified = true;
  } catch (err) {
    console.error("Auto table creation check failed for job_postings:", err);
  }
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-") + "-" + Date.now().toString(36);
}

export interface JobPostingInput {
  title: string;
  type?: string;
  salary: string;
  location: string;
  quantity?: string;
  requirements?: string[];
  responsibilities?: string[];
  isActive?: boolean;
}

export class JobPostingService {
  /**
   * Get all active job postings for Public Careers Page
   */
  static async getPublicJobPostings() {
    await ensureJobPostingsTable();
    const db = (prisma as any).jobPosting;
    try {
      return await db.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
      });
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isJobTableVerified = false;
        await ensureJobPostingsTable();
        return await db.findMany({
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
        });
      }
      throw err;
    }
  }

  /**
   * Get all job postings for Admin Management (active & inactive)
   */
  static async getAllJobPostings() {
    await ensureJobPostingsTable();
    const db = (prisma as any).jobPosting;
    try {
      return await db.findMany({
        orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
      });
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isJobTableVerified = false;
        await ensureJobPostingsTable();
        return await db.findMany({
          orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
        });
      }
      throw err;
    }
  }

  /**
   * Create new job posting in database
   */
  static async createJobPosting(data: JobPostingInput) {
    if (!data.title || !data.title.trim()) {
      throw new AppError("Tiêu đề vị trí tuyển dụng không được để trống", 400);
    }
    if (!data.salary || !data.salary.trim()) {
      throw new AppError("Mức lương dự kiến không được để trống", 400);
    }
    if (!data.location || !data.location.trim()) {
      throw new AppError("Địa điểm làm việc không được để trống", 400);
    }

    await ensureJobPostingsTable();
    const db = (prisma as any).jobPosting;
    const slug = generateSlug(data.title.trim());

    try {
      const count = await db.count();
      const newJob = await db.create({
        data: {
          title: data.title.trim(),
          slug,
          type: data.type ? data.type.trim() : "Toàn thời gian",
          salary: data.salary.trim(),
          location: data.location.trim(),
          quantity: data.quantity ? data.quantity.trim() : "01 Người",
          requirements: Array.isArray(data.requirements) ? data.requirements : [],
          responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
          isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
          sortOrder: count + 1,
        },
      });
      return newJob;
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isJobTableVerified = false;
        await ensureJobPostingsTable();
        const count = await db.count();
        return await db.create({
          data: {
            title: data.title.trim(),
            slug,
            type: data.type ? data.type.trim() : "Toàn thời gian",
            salary: data.salary.trim(),
            location: data.location.trim(),
            quantity: data.quantity ? data.quantity.trim() : "01 Người",
            requirements: Array.isArray(data.requirements) ? data.requirements : [],
            responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
            isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
            sortOrder: count + 1,
          },
        });
      }
      throw err;
    }
  }

  /**
   * Update existing job posting in database
   */
  static async updateJobPosting(id: number, data: Partial<JobPostingInput>): Promise<any> {
    await ensureJobPostingsTable();
    const db = (prisma as any).jobPosting;

    try {
      const existing = await db.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError("Không tìm thấy tin tuyển dụng này", 404);
      }

      const updateData: any = {};
      if (data.title && data.title.trim()) updateData.title = data.title.trim();
      if (data.type !== undefined) updateData.type = data.type.trim();
      if (data.salary !== undefined) updateData.salary = data.salary.trim();
      if (data.location !== undefined) updateData.location = data.location.trim();
      if (data.quantity !== undefined) updateData.quantity = data.quantity.trim();
      if (data.requirements !== undefined) updateData.requirements = data.requirements;
      if (data.responsibilities !== undefined) updateData.responsibilities = data.responsibilities;
      if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

      const updated = await db.update({
        where: { id },
        data: updateData,
      });

      return updated;
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isJobTableVerified = false;
        await ensureJobPostingsTable();
        return await this.updateJobPosting(id, data);
      }
      throw err;
    }
  }

  /**
   * Delete job posting permanently from database
   */
  static async deleteJobPosting(id: number) {
    await ensureJobPostingsTable();
    const db = (prisma as any).jobPosting;

    try {
      const existing = await db.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError("Không tìm thấy tin tuyển dụng này", 404);
      }

      await db.delete({ where: { id } });
      return { success: true, message: "Đã xóa tin tuyển dụng thành công khỏi hệ thống." };
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isJobTableVerified = false;
        await ensureJobPostingsTable();
        const existing = await db.findUnique({ where: { id } });
        if (!existing) throw new AppError("Không tìm thấy tin tuyển dụng này", 404);
        await db.delete({ where: { id } });
        return { success: true, message: "Đã xóa tin tuyển dụng thành công khỏi hệ thống." };
      }
      throw err;
    }
  }
}
