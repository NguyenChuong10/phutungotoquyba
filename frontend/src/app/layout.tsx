import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/public/MainLayout";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: {
    default: "Phụ Tùng Ô Tô Q.BA Đà Nẵng - Tổng Kho Linh Kiện Xe Tải Nặng Trung Quốc",
    template: "%s | Phụ Tùng Ô Tô Q.BA Đà Nẵng",
  },
  description:
    "Công ty Phụ Tùng Ô Tô Q.BA Đà Nẵng chuyên phân phối chính hãng phụ tùng xe tải ben, xe đầu kéo HOWO, Weichai, Fast Gear, Shacman, Chenglong 25 năm uy tín Miền Trung.",
  keywords: [
    "Phụ tùng ô tô Q.BA",
    "Phụ tùng xe tải Đà Nẵng",
    "Phụ tùng HOWO chính hãng",
    "Động cơ Weichai WP10 WP12",
    "Hộp số Fast Gear",
    "Tra mã VIN xe tải Trung Quốc",
    "Kho phụ tùng 351 Điện Biên Phủ Đà Nẵng",
  ],
  authors: [{ name: "Phụ Tùng Ô Tô Q.BA", url: "https://phutungotoquyba.com" }],
  creator: "Công ty TNHH Cơ Khí Ô Tô Q.BA",
  publisher: "Phụ Tùng Ô Tô Q.BA Đà Nẵng",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "Phụ Tùng Ô Tô Q.BA Đà Nẵng",
    title: "Phụ Tùng Ô Tô Q.BA - Tổng Kho Linh Kiện Xe Tải Nặng Trung Quốc",
    description:
      "Chuyên cung cấp phụ tùng xe tải ben, xe đầu kéo HOWO, Weichai, Fast Gear, Shacman, Chenglong chính hãng tại Đà Nẵng và Miền Trung.",
    images: [
      {
        url: "/images/news-section/quyba.png",
        width: 1200,
        height: 630,
        alt: "Tổng Kho Phụ Tùng Ô Tô Q.BA Đà Nẵng",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Phụ Tùng Ô Tô Q.BA - Giá tốt nhất Đà Nẵng",
    description: "Phân phối phụ tùng xe tải nặng Trung Quốc chính hãng HOWO, Weichai, Fast Gear.",
    images: ["/images/news-section/quyba.png"],
  },
  icons: {
    icon: [
      { url: "/images/logo/icon-square.png", sizes: "192x192", type: "image/png" },
      { url: "/images/logo/icon-square.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/images/logo/icon-square.png",
    apple: "/images/logo/icon-square.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema.org Structured Data (JSON-LD) for LocalBusiness & AutoPartsStore
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "name": "Phụ Tùng Ô Tô Q.BA Đà Nẵng",
    "image": "http://localhost:3000/images/news-section/quyba.png",
    "@id": "http://localhost:3000/#store",
    "url": "http://localhost:3000",
    "telephone": "0903.588.167",
    "email": "phutungotoqbadanang@gmail.com",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "351 Điện Biên Phủ, Phường Hòa Khê, Quận Thanh Khê",
      "addressLocality": "Đà Nẵng",
      "postalCode": "550000",
      "addressCountry": "VN",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 16.0645,
      "longitude": 108.1965,
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "07:30",
      "closes": "18:00",
    },
  };

  return (
    <html
      lang="vi"
      className={`${inter.variable} ${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning={true}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning={true}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
