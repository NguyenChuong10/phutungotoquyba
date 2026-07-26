import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/MainLayout";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Phụ Tùng Ô Tô Q.BA - Giá tốt nhất",
  description: "Cung cấp các mặt hàng phụ tùng, linh kiện, nội ngoại thất xe tải, xe ben, xe khách chuẩn OEM với giá tốt nhất thị trường.",
  icons: {
    icon: [
      { url: "/images/logo/icon-square.png", sizes: "192x192", type: "image/png" },
      { url: "/images/logo/icon-square.png", sizes: "512x512", type: "image/png" }
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
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning={true}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}

