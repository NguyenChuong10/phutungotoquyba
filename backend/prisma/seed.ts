



import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Full Database Seeding for Phu Tung Oto Q.BA...");

  // 1. Seed Super Admin User
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

  // 2. Seed Initial 8 Main Categories & Sub-Categories
  const hierarchicalCategories = [
    {
      name: "Động Cơ & Máy Phát",
      slug: "dong-co-may-phat",
      description: "Bộ lọc dầu, pít-tông, gioăng quy lát động cơ Weichai, Yuchai...",
      children: [
        { name: "Bộ Piston & Xéc Măng", slug: "piston-xec-mang", description: "Piston, xéc măng Weichai WP10, WP12" },
        { name: "Bơm Cao Áp & Kim Phun Diesel", slug: "bom-cao-ap-kim-phun", description: "Kim phun Common Rail BOSCH" },
        { name: "Củ Đề & Máy Phát Điện", slug: "cu-de-may-phat", description: "Củ đề 24V 11KW Sinotruk, Weichai" },
        { name: "Phớt Git & Trục Khuỷu", slug: "phot-git-truc-khuayu", description: "Phớt đuôi trục khuỷu, phớt xupap" },
      ],
    },
    {
      name: "Hộp Số & Bộ Đồng Tốc",
      slug: "hop-so-bo-dong-toc",
      description: "Hộp số Fast Gear 12JS160T, vành đồng tốc...",
      children: [
        { name: "Bộ Đồng Tốc Hộp Số", slug: "bo-dong-toc", description: "Đồng tốc số 1-2, 3-4, 5-6 Fast Gear" },
        { name: "Bánh Răng & Trục Thứ Cấp", slug: "banh-rang-truc-thu-cap", description: "Bánh răng số 1 đến 12, trục sơ cấp" },
        { name: "Tay Số & Cụm Điền Số", slug: "tay-so-cum-dien-so", description: "Bộ điền số phanh hơi cabin" },
      ],
    },
    {
      name: "Gầm - Cầu - Phanh",
      slug: "gam-cau-phanh",
      description: "Tăm bua phanh AC16, bầu phanh, đĩa phanh...",
      children: [
        { name: "Tăm Bua & Phanh Hơi", slug: "tam-bua-phanh-hoi", description: "Tăm bua 10 lỗ phanh hơi HW19710" },
        { name: "Búp Sen Phanh & Lốc Kê", slug: "bup-sen-loc-ke", description: "Búp sen phanh 2 tầng 30/30" },
        { name: "May Ơ & Bộ Vi Sai Cầu", slug: "may-o-bo-vi-sai", description: "Cụm vi sai cầu QJ1506 HOWO" },
        { name: "Nhíp Cầu & Rơ Tuyn", slug: "nhip-cau-ro-tuyn", description: "Nhíp gầm 12 lá FAW, rơ tuyn" },
      ],
    },
    {
      name: "Ben Thủy Lực",
      slug: "ben-thuy-luc",
      description: "Ty ben thủy lực Hyva 50 tấn, bơm ben...",
      children: [
        { name: "Ty Ben Thủy Lực", slug: "ty-ben-thuy-luc", description: "Ty ben 4 đốt, 5 đốt Hyva FC157" },
        { name: "Van Chia Ben & Bơm Ben", slug: "van-chia-ben-bom-ben", description: "Bơm ben 80L, 100L bánh răng" },
      ],
    },
    {
      name: "Linh Kiện Rơ-Moóc",
      slug: "linh-kien-ro-mooc",
      description: "Chân chống moóc Fuwa, mâm moóc, đinh moóc...",
      children: [
        { name: "Chân Chống Rơ-Moóc Fuwa", slug: "chan-chong-ro-mooc", description: "Cụm chân chống Fuwa 28 tấn" },
        { name: "Đinh Kéo Mâm & Bát Nhíp Moóc", slug: "dinh-keo-mam-bat-nhip", description: "Đinh kéo phi 50, phi 90 Jost" },
      ],
    },
    {
      name: "Cabin & Thân Vỏ",
      slug: "cabin-than-vo",
      description: "Mặt ga lăng, cụm đèn pha, ghế hơi cabin...",
      children: [
        { name: "Mặt Ga Lăng & Cụm Đèn Pha", slug: "mat-ga-lang-cum-den", description: "Mặt ga lăng A7, V7G, X3000" },
        { name: "Ghế Hơi & Nội Thất Cabin", slug: "ghe-hoi-noi-that", description: "Ghế hơi Grammer cao cấp" },
        { name: "Gương Chiếu Hậu & Kính Chắn Gió", slug: "guong-phieu-hau-kinh", description: "Cụm gương chỉnh điện sấy kính" },
      ],
    },
    {
      name: "Gioăng & Seal Phốt",
      slug: "gioang-seal-phot",
      description: "Phớt mặt máy, phớt Viton, phớt gít...",
      children: [
        { name: "Phớt Git & Gioăng Mặt Máy", slug: "phot-git-gioang-mat-may", description: "Phớt NOK Nhật Bản, gioăng quy lát" },
        { name: "Phớt Đuôi Trục Khuỷu & Phớt Cầu", slug: "phot-duoi-truc-khuayu-phot-cau", description: "Phớt lò xo kép chặn dầu" },
      ],
    },
    {
      name: "Vòng Bi - Bạc Đạn",
      slug: "vong-bi-bac-dan",
      description: "Vòng bi moay ơ bánh xe, bi chữ thập cầu...",
      children: [
        { name: "Vòng Bi Moay Ơ Bánh Xe", slug: "vong-bi-moay-o", description: "Bi moay ơ 32218, 32222 SKF, Koyo" },
        { name: "Bi Chữ Thập & Bạc Đạn Khóa", slug: "bi-chu-thap-bac-dan-khoa", description: "Bi chữ thập các đăng cầu" },
      ],
    },
  ];

  const subCategoryMap = new Map<string, number>();

  for (const mainCat of hierarchicalCategories) {
    const parent = await prisma.category.upsert({
      where: { slug: mainCat.slug },
      update: { name: mainCat.name, description: mainCat.description },
      create: {
        name: mainCat.name,
        slug: mainCat.slug,
        description: mainCat.description,
      },
    });

    for (const subCat of mainCat.children) {
      const child = await prisma.category.upsert({
        where: { slug: subCat.slug },
        update: { name: subCat.name, parentId: parent.id, description: subCat.description },
        create: {
          name: subCat.name,
          slug: subCat.slug,
          parentId: parent.id,
          description: subCat.description,
        },
      });
      subCategoryMap.set(subCat.slug, child.id);
    }
  }
  console.log("✅ Seeded 2-Level Hierarchical Category Tree (Main & Sub Categories)");

  // 3. Seed Initial Brands
  const brandsData = [
    { name: "HOWO Sinotruk", slug: "howo-sinotruk" },
    { name: "Weichai Power", slug: "weichai-power" },
    { name: "Fast Gear", slug: "fast-gear" },
    { name: "Shacman", slug: "shacman" },
    { name: "FAW Group", slug: "faw-group" },
    { name: "Dongfeng Commercial", slug: "dongfeng-commercial" },
    { name: "Yuchai Machinery", slug: "yuchai-machinery" },
  ];

  const brandMap = new Map<string, number>();
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name },
      create: b,
    });
    brandMap.set(b.slug, brand.id);
  }
  console.log("✅ Seeded Brands");

  // 4. Seed Initial Products into PostgreSQL Database
  const productsSeedData = [
    {
      name: "Bộ Lọc Dầu Động Cơ Weichai WP12 / WP10",
      slug: "bo-loc-dau-dong-co-weichai-wp12-wp10",
      partNumber: "VG1560080012",
      internalCode: "QB-DC-0012",
      internalName: "WEICHAI-WP12-OIL-FILTER-LOAI1-NHAP2026",
      subCategorySlug: "piston-xec-mang",
      brandSlug: "weichai-power",
      price: 0.00,
      costPrice: 180000.00,
      stockQuantity: 45,
      inStock: true,
      qualityStandard: "Loại 1 Cao Cấp",
      description: "Bộ lọc dầu nhớt động cơ Weichai WP10/WP12 chính hãng loại 1 cao cấp.",
      compatibility: ["HOWO 371", "HOWO V7G", "Shacman X3000", "Auman C340"],
      specifications: {
        "Mã phụ tùng (Part No.)": "VG1560080012",
        "Chất liệu": "Giấy tổng hợp Micro-glass cao cấp & thép đúc",
      },
      imageUrl: "/images/vehicle-category/dongco.png",
    },
    {
      name: "Bộ Đồng Tốc Hộp Số Fast Gear 12JS160T",
      slug: "bo-dong-toc-hop-so-fast-gear-12js160t",
      partNumber: "JS160T-1701170",
      internalCode: "QB-HS-0160",
      internalName: "FAST-GEAR-12JS160T-SYNCHRONIZER-QB",
      subCategorySlug: "bo-dong-toc",
      brandSlug: "fast-gear",
      price: 3850000.00,
      costPrice: 2900000.00,
      stockQuantity: 12,
      inStock: true,
      qualityStandard: "Loại 1 Cao Cấp",
      description: "Bộ vành sang số đồng tốc hộp số Fast Gear 12 số chính hãng.",
      compatibility: ["HOWO A7", "Shacman F3000", "Chenglong H7"],
      specifications: {
        "Mã phụ tùng (Part No.)": "JS160T-1701170",
        "Chất liệu": "Đồng thau hợp kim gia cường đúc định hình",
      },
      imageUrl: "/images/vehicle-category/hopso.png",
    },
    {
      name: "Ty Ben Thủy Lực Hyva / Q.BA Chịu Tải 50 Tấn",
      slug: "ty-ben-thuy-luc-hyva-qba-chiu-tai-50-tan",
      partNumber: "FC-157-4-04880",
      internalCode: "QB-BN-0050",
      internalName: "BEN-HYVA-50TON-TY-BEN-XE-BEN-HOWO",
      subCategorySlug: "ty-ben-thuy-luc",
      brandSlug: "howo-sinotruk",
      price: 0.00,
      costPrice: 12500000.00,
      stockQuantity: 8,
      inStock: true,
      qualityStandard: "Chính Hãng",
      description: "Xy lanh ty ben thủy lực nâng thùng xe ben chịu tải trọng 50 tấn.",
      compatibility: ["HOWO Ben 380HP", "HOWO Ben 371HP"],
      specifications: {
        "Mã phụ tùng (Part No.)": "FC-157-4-04880",
        "Chất liệu": "Thép hợp kim mạ crom cứng chống xước",
      },
      imageUrl: "/images/vehicle-category/ben.png",
    },
    {
      name: "Tăm Bua Phanh Cầu Sau HOWO 16 Tấn (Bầu Phanh AC16)",
      slug: "tam-bua-phanh-cau-sau-howo-16-tan",
      partNumber: "WG9100440029",
      internalCode: "QB-TB-0016",
      internalName: "TAM-BUA-HOWO-AC16-LOAI1-QB",
      subCategorySlug: "tam-bua-phanh-hoi",
      brandSlug: "howo-sinotruk",
      price: 0.00,
      costPrice: 1200000.00,
      stockQuantity: 30,
      inStock: true,
      qualityStandard: "Chính Hãng",
      description: "Tăm bua lơ lửng phanh cầu sau HOWO 16 Tấn (cầu AC16/HC16).",
      compatibility: ["HOWO 371", "HOWO 380", "Xe Ben 4 Chân HOWO"],
      specifications: {
        "Mã phụ tùng (Part No.)": "WG9100440029",
        "Chất liệu": "Gang đúc xám chịu nhiệt mài mòn cao cấp",
      },
      imageUrl: "/images/vehicle-category/dongco.png",
    },
    {
      name: "Củ Đề Động Cơ Weichai 24V 11KW (Sinotruk HOWO)",
      slug: "cu-de-dong-co-weichai-24v-11kw",
      partNumber: "VG1560090001",
      internalCode: "QB-CD-0024",
      internalName: "STARTER-MOTOR-WEICHAI-24V-11KW",
      subCategorySlug: "cu-de-may-phat",
      brandSlug: "weichai-power",
      price: 0.00,
      costPrice: 2800000.00,
      stockQuantity: 15,
      inStock: true,
      qualityStandard: "Chính Hãng",
      description: "Máy khởi động củ đề 24V 11KW Weichai chính hãng.",
      compatibility: ["HOWO 371", "HOWO A7", "Weichai WP10"],
      specifications: {
        "Mã phụ tùng (Part No.)": "VG1560090001",
        "Chất liệu": "Cuộn đồng 100% & vỏ nhôm hợp kim đúc",
      },
      imageUrl: "/images/about/kho-hang-4.png",
    },
  ];

  for (const prodData of productsSeedData) {
    const categoryId = subCategoryMap.get(prodData.subCategorySlug);
    const brandId = brandMap.get(prodData.brandSlug);

    const product = await prisma.product.upsert({
      where: { internalCode: prodData.internalCode },
      update: {
        name: prodData.name,
        partNumber: prodData.partNumber,
        internalName: prodData.internalName,
        price: prodData.price,
        costPrice: prodData.costPrice,
        stockQuantity: prodData.stockQuantity,
        inStock: prodData.inStock,
        qualityStandard: prodData.qualityStandard,
        description: prodData.description,
        specifications: prodData.specifications,
        compatibility: prodData.compatibility,
        categoryId,
        brandId,
      },
      create: {
        name: prodData.name,
        slug: prodData.slug,
        partNumber: prodData.partNumber,
        internalCode: prodData.internalCode,
        internalName: prodData.internalName,
        price: prodData.price,
        costPrice: prodData.costPrice,
        stockQuantity: prodData.stockQuantity,
        inStock: prodData.inStock,
        qualityStandard: prodData.qualityStandard,
        description: prodData.description,
        specifications: prodData.specifications,
        compatibility: prodData.compatibility,
        categoryId,
        brandId,
        images: {
          create: [{ imageUrl: prodData.imageUrl, isPrimary: true, sortOrder: 0 }],
        },
      },
    });
  }

  console.log("✅ Seeded Initial Products & Images into PostgreSQL Database");
  console.log("🎉 Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
