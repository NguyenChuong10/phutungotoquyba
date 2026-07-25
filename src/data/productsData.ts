export interface Product {
  id: string;
  name: string;             // Tên sản phẩm hiển thị công khai
  internalName: string;     // Tên sản phẩm nội bộ (Admin xem)
  internalCode: string;     // Mã nội bộ Q.BA
  partNumber: string;       // Mã phụ tùng nhà máy (Part No.)
  categorySlug: string;     // Slug danh mục
  categoryName: string;     // Tên hiển thị danh mục
  brand: string;            // Thương hiệu sản xuất
  compatibility: string[];  // Các dòng xe tương thích
  imageSrc: string;         // Ảnh đại diện sản phẩm
  gallery: string[];        // Bộ sưu tập ảnh
  description: string;      // Mô tả chi tiết sản phẩm
  specifications: Record<string, string>; // Thông số kỹ thuật
  qualityStandard: string;  // Tiêu chuẩn chất lượng (vd: "80% OEM", "Loại 1 Cao Cấp")
  inStock: boolean;         // Trạng thái sẵn kho
}

export const categoriesList = [
  { slug: "all", name: "Tất cả danh mục" },
  { slug: "dong-co", name: "Động Cơ & Máy Phát" },
  { slug: "hop-so", name: "Hộp Số & Bộ Đồng Tốc" },
  { slug: "gam-cau-phanh", name: "Gầm - Cầu - Phanh" },
  { slug: "ben-thuy-luc", name: "Ben Thủy Lực" },
  { slug: "ro-mooc", name: "Linh Kiện Rơ-Moóc" },
  { slug: "cabin-vo", name: "Cabin & Thân Vỏ" },
  { slug: "seal-phot", name: "Gioăng & Seal Phốt" },
  { slug: "vong-bi", name: "Vòng Bi - Bạc Đạn" }
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
    internalName: "WEICHAI-WP12-OIL-FILTER-LOAI1-NHAP2026",
    internalCode: "QB-DC-0012",
    partNumber: "VG1560080012",
    categorySlug: "dong-co",
    categoryName: "Động Cơ & Máy Phát",
    brand: "Weichai Power",
    compatibility: ["HOWO 371", "HOWO V7G", "Shacman X3000", "Auman C340"],
    imageSrc: "/images/vehicle-category/dong-co-may-phat.jpg",
    gallery: [
      "/images/vehicle-category/dong-co-may-phat.jpg",
      "/images/about/kho-hang-2.png",
      "/images/about/kho-hang-3.png"
    ],
    description: "Bộ lọc dầu nhớt động cơ Weichai WP10/WP12 chính hãng loại 1 cao cấp, sợi lọc màng giấy tổng hợp chịu áp lực cao, lọc sạch 99% cặn bẩn bóp nghẹt động cơ xe tải nặng.",
    specifications: {
      "Mã phụ tùng (Part No.)": "VG1560080012",
      "Mã quản lý nội bộ": "QB-DC-0012",
      "Thương hiệu": "Weichai Power Co., Ltd",
      "Chất liệu màng lọc": "Giấy tổng hợp Micro-glass chịu nhiệt 150°C",
      "Áp suất phá hủy": "1.2 MPa",
      "Xuất xứ": "Nhập khẩu chính hãng Trung Quốc (OEM)",
      "Bảo hành": "Đổi mới 1-1 nếu có lỗi sản xuất"
    },
    qualityStandard: "80% OEM",
    inStock: true
  },
  {
    id: "p2",
    name: "Bộ Đồng Tốc Hộp Số Fast Gear 12JS160T",
    internalName: "FAST-GEAR-12JS160T-SYNCHRONIZER-QB",
    internalCode: "QB-HS-0160",
    partNumber: "JS160T-1701170",
    categorySlug: "hop-so",
    categoryName: "Hộp Số & Bộ Đồng Tốc",
    brand: "Fast Gear",
    compatibility: ["HOWO A7", "Shacman F3000", "Chenglong H7", "Dongfeng 4 chân"],
    imageSrc: "/images/vehicle-category/hop-so-bo-dong-toc.jpg",
    gallery: [
      "/images/vehicle-category/hop-so-bo-dong-toc.jpg",
      "/images/about/kho-hang-1.png"
    ],
    description: "Bộ vành sang số đồng tốc hộp số Fast Gear 12 số chính hãng, hợp kim đồng mạ Molypden chống mài mòn gia tăng tuổi thọ sang số nhẹ nhàng mượt mà.",
    specifications: {
      "Mã phụ tùng": "JS160T-1701170",
      "Mã nội bộ Q.BA": "QB-HS-0160",
      "Thương hiệu": "Shaanxi Fast Gear",
      "Chất liệu": "Hợp kim đồng mạ Molypden cao cấp",
      "Số răng đồng tốc": "36 Răng",
      "Ứng dụng hộp số": "Fast Gear 12JS160T, 12JSD180T",
      "Trọng lượng": "3.8 kg"
    },
    qualityStandard: "Loại 1 Cao Cấp",
    inStock: true
  },
  {
    id: "p3",
    name: "Ty Ben Thủy Lực Hyva / Q.BA Chịu Tải 50 Tấn",
    internalName: "BEN-HYVA-50TON-TY-BEN-XE-BEN-HOWO",
    internalCode: "QB-BN-0050",
    partNumber: "FC-157-4-04880",
    categorySlug: "ben-thuy-luc",
    categoryName: "Ben Thủy Lực",
    brand: "Sinotruk HOWO",
    compatibility: ["HOWO Ben 380HP", "HOWO Ben 371HP", "Shacman Ben 4 chân"],
    imageSrc: "/images/vehicle-category/ben-thuy-luc.jpg",
    gallery: [
      "/images/vehicle-category/ben-thuy-luc.jpg",
      "/images/about/giao-hang-van-chuyen.jpg"
    ],
    description: "Xy lanh ty ben thủy lực nâng thùng xe ben chịu tải trọng siêu trường siêu trọng 45-50 tấn, vỏ thép mạ Crom 4 lớp chống trầy xước xì dầu.",
    specifications: {
      "Mã phụ tùng": "FC-157-4-04880",
      "Mã nội bộ": "QB-BN-0050",
      "Đường kính ty ben": "157 mm",
      "Số tầng nâng": "4 Tầng nâng",
      "Hành trình nâng": "4.880 mm",
      "Áp suất làm việc": "250 Bar",
      "Tải trọng nâng tối đa": "50 Tấn"
    },
    qualityStandard: "80% OEM",
    inStock: true
  },
  {
    id: "p4",
    name: "Tăm Bua Phanh Cầu Sau HOWO 16 Tấn (Bầu Phanh AC16)",
    internalName: "TAM-BUA-CAU-SAU-AC16-HOWO-371",
    internalCode: "QB-GM-0016",
    partNumber: "WG9231340006",
    categorySlug: "gam-cau-phanh",
    categoryName: "Gầm - Cầu - Phanh",
    brand: "Sinotruk HOWO",
    compatibility: ["HOWO 371", "HOWO 380", "HOWO A7", "Shacman H3000"],
    imageSrc: "/images/vehicle-category/gam-cau-phanh.jpg",
    gallery: [
      "/images/vehicle-category/gam-cau-phanh.jpg",
      "/images/about/kho-hang-4.png"
    ],
    description: "Tăm bua trống phanh cầu đúc AC16/HC16 Sinotruk HOWO chịu nhiệt độ ma sát phanh liên tục khi xuống đèo dốc trọng tải nặng.",
    specifications: {
      "Mã phụ tùng": "WG9231340006",
      "Mã nội bộ": "QB-GM-0016",
      "Đường kính ngoài": "420 mm",
      "Đường kính đường tâm lỗ bánh": "335 mm",
      "Số lỗ bu lông moay ơ": "10 Lỗ",
      "Chất liệu": "Gang cầu đúc xám đúc sỏi chịu nhiệt",
      "Trọng lượng": "56 kg"
    },
    qualityStandard: "80% OEM",
    inStock: true
  },
  {
    id: "p5",
    name: "Bộ Gioăng Seal Phốt Đại Tu Động Cơ Weichai WD615",
    internalName: "SET-GIOANG-PHOT-DAI-TU-WEICHAI-WD615",
    internalCode: "QB-SP-0615",
    partNumber: "61500010383",
    categorySlug: "seal-phot",
    categoryName: "Gioăng & Seal Phốt",
    brand: "Weichai Power",
    compatibility: ["HOWO 336", "HOWO 371", "Steyr WD615"],
    imageSrc: "/images/vehicle-category/seal-phot-lam-kin.jpg",
    gallery: [
      "/images/vehicle-category/seal-phot-lam-kin.jpg",
      "/images/about/kho-hang-4.png"
    ],
    description: "Bộ gioăng phớt mặt máy, gioăng quy lát thép chịu nhiệt, phớt gít xupap, phớt trục khuỷu đại tu toàn bộ động cơ Weichai WD615 kín khít tuyệt đối.",
    specifications: {
      "Mã phụ tùng": "61500010383",
      "Mã nội bộ": "QB-SP-0615",
      "Thành phần bộ gioăng": "Gioăng quy lát 3 lớp thép + Phớt gít Viton + Phớt đầu đuôi cốt máy",
      "Chịu nhiệt độ": "Lên tới 280°C",
      "Tiêu chuẩn": "OEM Weichai Factory Grade"
    },
    qualityStandard: "Chính Hãng",
    inStock: true
  },
  {
    id: "p6",
    name: "Chân Chống Rơ-Moóc Fuwa 28 Tấn Chịu Lực Tải Đôi",
    internalName: "CHAN-CHONG-RO-MOOC-FUWA-28TON-DOUBLE",
    internalCode: "QB-RM-0028",
    partNumber: "FW28T-LANDING-GEAR",
    categorySlug: "ro-mooc",
    categoryName: "Linh Kiện Rơ-Moóc",
    brand: "Sinotruk HOWO",
    compatibility: ["Sơ-mi Rơ-moóc Xương", "Rơ-moóc Lồng", "Rơ-moóc Sàn Cimc"],
    imageSrc: "/images/vehicle-category/linh-kien-ro-mooc.jpg",
    gallery: [
      "/images/vehicle-category/linh-kien-ro-mooc.jpg"
    ],
    description: "Chân chống đỡ moóc Fuwa 28 tấn hộp số hai tốc độ quay tay nâng hạ thùng rơ moóc an toàn chịu lực vượt tải 80 tấn.",
    specifications: {
      "Mã phụ tùng": "FW28T-LANDING-GEAR",
      "Mã nội bộ": "QB-RM-0028",
      "Tải nâng tĩnh": "80 Tấn",
      "Tải nâng động": "28 Tấn",
      "Hành trình nâng": "480 mm",
      "Tốc độ quay": "Hộp số 2 tốc độ (Nhanh/Chậm)"
    },
    qualityStandard: "Loại 1 Cao Cấp",
    inStock: true
  }
];
