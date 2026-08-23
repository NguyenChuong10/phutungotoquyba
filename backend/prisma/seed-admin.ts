import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Admin Account & Initial System Settings Seed...");

  // 1. Seed Super Admin User Account
  const adminEmail = "phutungotoqbadanang@gmail.com";
  const hashedPassword = await bcrypt.hash("@Foradminkho9999", 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hashedPassword,
      role: "super_admin",
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      fullName: "Quản Trị Viên Q.BA",
      phone: "0903588167",
      role: "super_admin",
      isActive: true,
    },
  });
  console.log("✅ Configured Super Admin Account:", admin.email);

  // 2. Seed Default System Settings (If not already configured)
  const defaultSettings = [
    { key: "hotline_zalo", value: "0903.588.167" },
    { key: "hotline_raw", value: "0903588167" },
    { key: "phone_sales", value: "0903.588.167" },
    { key: "email_contact", value: "phutungotoqbadanang@gmail.com" },
    { key: "warehouse_address", value: "Q.BA Đà Nẵng, Việt Nam" },
    { key: "working_hours", value: "Thứ 2 - Chủ Nhật: 07:30 - 18:00" },
    { key: "zalo_link", value: "https://zalo.me/0903588167" },
    {
      key: "notice_bar_message",
      value: "Tổng kho Phụ Tùng Xe Tải Q.BA Đà Nẵng - Sẵn kho 10.000+ mã linh kiện HOWO, Weichai, Fast Gear. Hotline/Zalo: 0903.588.167",
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ Configured Default System Settings");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("🚀 Admin & Settings Seed Completed Successfully!");
  })
  .catch(async (e) => {
    console.error("❌ Admin Seed Error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
