import React from "react";
import { fetchApi } from "@/config/api";
import { siteConfig } from "@/config/siteConfig";

export default async function LocalBusinessJsonLd() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  let settings: any = {};
  try {
    const res = await fetchApi("/settings");
    if (res.ok && res.data) {
      settings = res.data;
    }
  } catch (err) {
    console.error("LocalBusinessJsonLd SSR fetch settings error:", err);
  }

  const hotlineZalo = settings.hotlineZalo || siteConfig.hotline;
  const warehouseAddress = settings.warehouseAddress || siteConfig.address;
  const emailContact = settings.emailContact || siteConfig.email;
  const workingHours = settings.workingHours || siteConfig.workingHours;
  const rawPhone = (hotlineZalo || siteConfig.hotline).replace(/\D/g, "");
  const zaloLink = settings.zaloLink || `https://zalo.me/${rawPhone || siteConfig.hotlineRaw}`;

  const hoursMatch = workingHours.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
  const opensTime = hoursMatch ? hoursMatch[1] : "07:30";
  const closesTime = hoursMatch ? hoursMatch[2] : "18:00";

  const logoPath = settings.siteLogo || siteConfig.logo || "/images/logo/logonen.png";
  const logoUrl = logoPath.startsWith("http") ? logoPath : `${baseUrl}${logoPath.startsWith("/") ? "" : "/"}${logoPath}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "name": "Phụ Tùng Ô Tô Q.BA Đà Nẵng",
    "image": logoUrl,
    "@id": `${baseUrl}/#store`,
    "url": baseUrl,
    "telephone": hotlineZalo,
    "email": emailContact,
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": warehouseAddress,
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
      "opens": opensTime,
      "closes": closesTime,
    },
    "sameAs": [zaloLink],
  };

  return (
    <script
      id="root-localbusiness-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
