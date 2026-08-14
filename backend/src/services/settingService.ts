import prisma from "../config/db";

const DEFAULT_SETTINGS: Record<string, string> = {
  hotlineZalo: "0903.588.167",
  phoneSales: "0903.588.167",
  emailContact: "phutungotoqbadanang@gmail.com",
  warehouseAddress: "351 Điện Biên Phủ, Phường Hòa Khê, Quận Thanh Khê, TP. Đà Nẵng",
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
