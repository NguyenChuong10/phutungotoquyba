import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-Catalogue Phụ Tùng Xe Tải Nặng HOWO, Weichai, Fast Gear | Q.BA Đà Nẵng",
  description:
    "Tra cứu và báo giá phụ tùng xe tải nặng chính hãng HOWO, Weichai, Fast Gear, Shacman, Chenglong. Sẵn kho Đà Nẵng, chất lượng loại 1.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/products",
    siteName: "Phụ Tùng Ô Tô Q.BA Đà Nẵng",
    title: "Tra Cứu & Báo Giá Phụ Tùng Xe Tải Nặng Q.BA Đà Nẵng",
    description:
      "Tổng kho phụ tùng xe tải ben, xe đầu kéo HOWO, Weichai, Fast Gear chính hãng tại Đà Nẵng và Miền Trung.",
    images: [
      {
        url: "/images/news-section/quyba.png",
        width: 1200,
        height: 630,
        alt: "E-Catalogue Phụ Tùng Ô Tô Q.BA Đà Nẵng",
      },
    ],
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

