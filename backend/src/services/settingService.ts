import prisma from "../config/db";

const DEFAULT_SETTINGS: Record<string, string> = {
  hotlineZalo: "0903.588.167",
  phoneSales: "0903.588.167",
  emailContact: "phutungotoqbadanang@gmail.com",
  warehouseAddress: "43-45 Nguyễn Văn Tạo, An Khê, Thanh Khê, Đà Nẵng",
  googleMapEmbedUrl: "",
  workingHours: "Thứ 2 - Chủ Nhật: 07:30 - 18:00",
  homeHeroSlogan: "Nhập Khẩu & Phân Phối Phụ Tùng Xe Tải Nặng Trung Quốc Uy Tín 25 Năm Tại Đà Nẵng",
  noticeBarMessage: "Tổng kho Phụ Tùng Xe Tải Q.BA Đà Nẵng - Sẵn kho 10.000+ mã linh kiện HOWO, Weichai, Fast Gear. Hotline/Zalo: 0903.588.167",
  enableSoundAlert: "true",
  autoRefreshInterval: "15",
  partnerBrands: JSON.stringify([
    { id: "brand-1", name: "WEICHAI", bg: "/images/pioneer-section/hopsoxetai.png" },
    { id: "brand-2", name: "HOWO", bg: "/images/pioneer-section/bomcaoap.png" },
    { id: "brand-3", name: "YUCHAI", bg: "/images/vehicle-category/dongco.png" },
    { id: "brand-4", name: "CUMMINS", bg: "/images/vehicle-category/hopso.png" },
    { id: "brand-5", name: "BOSCH", bg: "/images/vehicle-category/sealphot.png" },
    { id: "brand-6", name: "FAW", bg: "/images/vehicle-category/cabin.png" },
  ]),
  aboutGalleryImages: JSON.stringify([
    {
      id: "img-1",
      src: "/images/about/kho-hang-1.png",
      alt: "Kệ hàng phụ tùng quy chuẩn Q.BA",
      title: "Kho linh kiện đa dạng",
      desc: "10.000+ chủng loại phụ tùng luôn sẵn kho đáp ứng ngay mọi tiến độ sửa chữa"
    },
    {
      id: "img-2",
      src: "/images/about/kho-hang-2.png",
      alt: "Cửa hàng Phụ Tùng Q.BA và nhân viên kỹ thuật",
      title: "Đội ngũ 25 năm kinh nghiệm",
      desc: "Tư vấn kỹ thuật chuẩn xác theo đúng mã phụ tùng của từng dòng xe"
    },
    {
      id: "img-3",
      src: "/images/about/kho-hang-3.png",
      alt: "Kiện thùng gỗ hàng nhập khẩu chính ngạch Q.BA",
      title: "Hàng nhập khẩu chính ngạch",
      desc: "Đóng gói nguyên đai nguyên kiện thùng gỗ từ nhà máy uy tín Trung Quốc"
    },
    {
      id: "img-4",
      src: "/images/about/kho-hang-4.png",
      alt: "Kệ hàng linh kiện lưu trữ quy mô lớn",
      title: "Lưu trữ quy chuẩn",
      desc: "Bảo quản phụ tùng trong môi trường khô ráo, chống gỉ sét tuyệt đối"
    },
    {
      id: "img-5",
      src: "/images/about/kho-hang-5.png",
      alt: "Kho chi tiết linh kiện ron phớt tay gạt Q.BA",
      title: "Linh kiện làm kín & phụ trợ",
      desc: "Đầy đủ các bộ phớt, lá lót, chạt tay gạt, gioăng máy chất lượng cao"
    },
    {
      id: "img-6",
      src: "/images/about/giao-hang-van-chuyen.jpg",
      alt: "Đội xe vận chuyển giao hàng hỏa tốc Q.BA",
      title: "Vận chuyển hỏa tốc",
      desc: "Giao hàng tận nơi tại Đà Nẵng và đóng gói gửi hàng toàn quốc"
    }
  ]),
};

let isSettingTableVerified = false;

export async function ensureSystemSettingsTable() {
  if (isSettingTableVerified) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    isSettingTableVerified = true;
  } catch (err) {
    console.error("Auto table creation failed for system_settings:", err);
  }
}

export class SettingService {
  /**
   * Get All System Settings (Merges DB settings with default fallbacks)
   */
  static async getSettings() {
    await ensureSystemSettingsTable();
    try {
      const dbSettings = await prisma.systemSetting.findMany();
      const result = { ...DEFAULT_SETTINGS };

      for (const item of dbSettings) {
        result[item.key] = item.value;
      }

      return result;
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isSettingTableVerified = false;
        await ensureSystemSettingsTable();
        return { ...DEFAULT_SETTINGS };
      }
      throw err;
    }
  }

  /**
   * Admin Bulk Update System Settings
   */
  static async updateSettings(settings: Record<string, string>): Promise<Record<string, string>> {
    await ensureSystemSettingsTable();
    try {
      const updates = Object.entries(settings).map(([key, value]) => {
        return prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      });

      await prisma.$transaction(updates);
      return await this.getSettings();
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isSettingTableVerified = false;
        await ensureSystemSettingsTable();
        return await this.updateSettings(settings);
      }
      throw err;
    }
  }
}
