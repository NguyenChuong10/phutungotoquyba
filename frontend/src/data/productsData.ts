import { Product } from "@/types/product";
export type { Product };

export interface SubCategoryData {
  slug: string;
  name: string;
}

export interface CategoryData {
  slug: string;
  name: string;
  icon?: string;
  subCategories?: SubCategoryData[];
}

export const categoriesList: CategoryData[] = [
  { slug: "all", name: "Tất cả danh mục" },
  {
    slug: "dong-co-may-phat",
    name: "Động Cơ & Máy Phát",
    subCategories: [
      { slug: "piston-xec-mang", name: "Bộ Piston & Xéc Măng" },
      { slug: "bom-cao-ap-kim-phun", name: "Bơm Cao Áp & Kim Phun Diesel" },
      { slug: "cu-de-may-phat", name: "Củ Đề & Máy Phát Điện" },
      { slug: "phot-git-truc-khuayu", name: "Phớt Git & Trục Khuỷu" },
    ],
  },
  {
    slug: "hop-so-bo-dong-toc",
    name: "Hộp Số & Bộ Đồng Tốc",
    subCategories: [
      { slug: "bo-dong-toc", name: "Bộ Đồng Tốc Hộp Số" },
      { slug: "banh-rang-truc-thu-cap", name: "Bánh Răng & Trục Thứ Cấp" },
      { slug: "tay-so-cum-dien-so", name: "Tay Số & Cụm Điền Số" },
    ],
  },
  {
    slug: "gam-cau-phanh",
    name: "Gầm - Cầu - Phanh",
    subCategories: [
      { slug: "tam-bua-phanh-hoi", name: "Tăm Bua & Phanh Hơi" },
      { slug: "bup-sen-loc-ke", name: "Búp Sen Phanh & Lốc Kê" },
      { slug: "may-o-bo-vi-sai", name: "May Ơ & Bộ Vi Sai Cầu" },
      { slug: "nhip-cau-ro-tuyn", name: "Nhíp Cầu & Rơ Tuyn" },
    ],
  },
  {
    slug: "ben-thuy-luc",
    name: "Ben Thủy Lực",
    subCategories: [
      { slug: "ty-ben-thuy-luc", name: "Ty Ben Thủy Lực" },
      { slug: "van-chia-ben-bom-ben", name: "Van Chia Ben & Bơm Ben" },
    ],
  },
  {
    slug: "linh-kien-ro-mooc",
    name: "Linh Kiện Rơ-Moóc",
    subCategories: [
      { slug: "chan-chong-ro-mooc", name: "Chân Chống Rơ-Moóc Fuwa" },
      { slug: "dinh-keo-mam-bat-nhip", name: "Đinh Kéo Mâm & Bát Nhíp Moóc" },
    ],
  },
  {
    slug: "cabin-than-vo",
    name: "Cabin & Thân Vỏ",
    subCategories: [
      { slug: "mat-ga-lang-cum-den", name: "Mặt Ga Lăng & Cụm Đèn Pha" },
      { slug: "ghe-hoi-noi-that", name: "Ghế Hơi & Nội Thất Cabin" },
      { slug: "guong-phieu-hau-kinh", name: "Gương Chiếu Hậu & Kính" },
    ],
  },
  {
    slug: "gioang-seal-phot",
    name: "Gioăng & Seal Phốt",
    subCategories: [
      { slug: "phot-git-gioang-mat-may", name: "Phớt Git & Gioăng Mặt Máy" },
      { slug: "phot-duoi-truc-khuayu-phot-cau", name: "Phớt Đuôi Trục Khuỷu & Phớt Cầu" },
    ],
  },
  {
    slug: "vong-bi-bac-dan",
    name: "Vòng Bi - Bạc Đạn",
    subCategories: [
      { slug: "vong-bi-moay-o", name: "Vòng Bi Moay Ơ Bánh Xe" },
      { slug: "bi-chu-thap-bac-dan-khoa", name: "Bi Chữ Thập & Bạc Đạn Khóa" },
    ],
  },
];

export const brandsList = [
  "Tất cả thương hiệu",
  "Sinotruk HOWO",
  "Weichai Power",
  "Fast Gear",
  "Shacman",
  "FAW",
  "Yuchai",
  "Bosch"
];

export const productsData: Product[] = [
  {
    id: "p1",
    name: "Bộ Lọc Dầu Động Cơ Weichai WP12 / WP10",
    partNumber: "VG1560080012",
    categorySlug: "dong-co-may-phat",
    categoryName: "Động Cơ & Máy Phát",
    subCategorySlug: "piston-xec-mang",
    brand: "Weichai Power",
    compatibility: ["HOWO 371", "HOWO V7G", "Shacman X3000", "Auman C340"],
    imageSrc: "/images/vehicle-category/dongco.png",
    gallery: [
      "/images/vehicle-category/dongco.png",
      "/images/about/kho-hang-2.png",
      "/images/about/kho-hang-3.png"
    ],
    description: "Bộ lọc dầu nhớt động cơ Weichai WP10/WP12 chính hãng loại 1 cao cấp, sợi lọc màng giấy tổng hợp chịu áp lực cao, lọc sạch 99% cặn bẩn bóp nghẹt động cơ xe tải nặng.",
    specifications: {
      "Mã phụ tùng (Part No.)": "VG1560080012",
      "Chất liệu": "Giấy tổng hợp Micro-glass chịu nhiệt 150°C"
    },
    qualityStandard: "Loại 1 Cao Cấp",
    inStock: true
  },
  {
    id: "p2",
    name: "Bộ Đồng Tốc Hộp Số Fast Gear 12JS160T",
    partNumber: "JS160T-1701170",
    categorySlug: "hop-so-bo-dong-toc",
    categoryName: "Hộp Số & Bộ Đồng Tốc",
    subCategorySlug: "bo-dong-toc",
    brand: "Fast Gear",
    compatibility: ["HOWO A7", "Shacman F3000", "Chenglong H7", "Dongfeng 4 chân"],
    imageSrc: "/images/vehicle-category/hopso.png",
    gallery: [
      "/images/vehicle-category/hopso.png",
      "/images/about/kho-hang-1.png"
    ],
    description: "Bộ vành sang số đồng tốc hộp số Fast Gear 12 số chính hãng, hợp kim đồng mạ Molypden chống mài mòn gia tăng tuổi thọ sang số nhẹ nhàng mượt mà.",
    specifications: {
      "Mã phụ tùng (Part No.)": "JS160T-1701170",
      "Chất liệu": "Hợp kim đồng mạ Molypden cao cấp"
    },
    qualityStandard: "Loại 1 Cao Cấp",
    inStock: true
  },
  {
    id: "p3",
    name: "Ty Ben Thủy Lực Hyva / Q.BA Chịu Tải 50 Tấn",
    partNumber: "FC-157-4-04880",
    categorySlug: "ben-thuy-luc",
    categoryName: "Ben Thủy Lực",
    subCategorySlug: "ty-ben-thuy-luc",
    brand: "Sinotruk HOWO",
    compatibility: ["HOWO Ben 380HP", "HOWO Ben 371HP", "Shacman Ben 4 chân"],
    imageSrc: "/images/vehicle-category/ben.png",
    gallery: [
      "/images/vehicle-category/ben.png",
      "/images/about/giao-hang-van-chuyen.jpg"
    ],
    description: "Xy lanh ty ben thủy lực nâng thùng xe ben chịu tải trọng siêu trường siêu trọng 45-50 tấn, vỏ thép mạ Crom 4 lớp chống trầy xước xì dầu.",
    specifications: {
      "Mã phụ tùng (Part No.)": "FC-157-4-04880",
      "Chất liệu": "Thép hợp kim mạ Crom 4 lớp chống trầy xước"
    },
    qualityStandard: "Chính Hãng",
    inStock: true
  },
  {
    id: "p4",
    name: "Tăm Bua Phanh Cầu Sau HOWO 16 Tấn (Bầu Phanh AC16)",
    partNumber: "WG9100440029",
    categorySlug: "gam-cau-phanh",
    categoryName: "Gầm - Cầu - Phanh",
    subCategorySlug: "tam-bua-phanh-hoi",
    brand: "Sinotruk HOWO",
    compatibility: ["HOWO 371", "HOWO 380", "Xe Ben 4 Chân HOWO", "Cầu AC16"],
    imageSrc: "/images/vehicle-category/dongco.png",
    gallery: [
      "/images/vehicle-category/dongco.png",
      "/images/about/kho-hang-5.png"
    ],
    description: "Tăm bua lơ lửng phanh cầu sau HOWO 16 Tấn (cầu AC16/HC16), gang cầu chịu nhiệt lực mòn nứt cao, đục 10 lỗ chuẩn kích thước nhà máy Sinotruk.",
    specifications: {
      "Mã phụ tùng (Part No.)": "WG9100440029",
      "Chất liệu": "Gang cầu chất lượng cao chịu nhiệt 450°C"
    },
    qualityStandard: "Chính Hãng",
    inStock: true
  },
  {
    id: "p5",
    name: "Củ Đề Động Cơ Weichai 24V 11KW (Sinotruk HOWO)",
    partNumber: "VG1560090001",
    categorySlug: "dong-co-may-phat",
    categoryName: "Động Cơ & Máy Phát",
    subCategorySlug: "cu-de-may-phat",
    brand: "Weichai Power",
    compatibility: ["HOWO 371", "HOWO A7", "Shacman F3000", "Weichai WP10"],
    imageSrc: "/images/about/kho-hang-4.png",
    gallery: [
      "/images/about/kho-hang-4.png"
    ],
    description: "Máy khởi động củ đề 24V 11KW Weichai chính hãng lực kéo mạnh mẽ đề nổ ngay lập tức thời tiết lạnh.",
    specifications: {
      "Mã phụ tùng (Part No.)": "VG1560090001",
      "Chất liệu": "Cuộn dây đồng nguyên chất 100%"
    },
    qualityStandard: "Chính Hãng",
    inStock: true
  },
  {
    id: "p6",
    name: "Phớt Đuôi Trục Khuỷu Động Cơ Yuchai YC6MK",
    partNumber: "YC-PT-6MK",
    categorySlug: "gioang-seal-phot",
    categoryName: "Gioăng & Seal Phốt",
    subCategorySlug: "phot-duoi-truc-khuayu-phot-cau",
    brand: "Yuchai",
    compatibility: ["Yuchai 420HP", "Dongfeng Hoàng Huy"],
    imageSrc: "/images/about/kho-hang-3.png",
    gallery: [
      "/images/about/kho-hang-3.png"
    ],
    description: "Phớt lò xo đôi chặn dầu đuôi trục khuỷu cao su NOK chịu nhiệt cao.",
    specifications: {
      "Mã phụ tùng (Part No.)": "YC-PT-6MK",
      "Chất liệu": "Cao su NOK Nhật Bản"
    },
    qualityStandard: "Loại 1 Cao Cấp",
    inStock: true
  }
];
const _unusedTypes: Record<string, unknown> = {};
