"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { siteConfig } from "@/config/siteConfig";
import { fetchApi } from "@/config/api";

export interface SiteSettings {
  hotlineZalo: string;
  phoneSales: string;
  emailContact: string;
  warehouseAddress: string;
  workingHours: string;
  homeHeroSlogan: string;
  noticeBarMessage: string;
  hotlineRaw: string;
  zaloLink: string;
}

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  hotlineZalo: siteConfig.hotline,
  phoneSales: siteConfig.hotline,
  emailContact: siteConfig.email,
  warehouseAddress: siteConfig.address,
  workingHours: siteConfig.workingHours,
  homeHeroSlogan: "Nhập Khẩu & Phân Phối Phụ Tùng Xe Tải Nặng Trung Quốc Uy Tín 25 Năm Tại Đà Nẵng",
  noticeBarMessage: `Tổng kho Phụ Tùng Xe Tải Q.BA Đà Nẵng - Sẵn kho 10.000+ mã linh kiện HOWO, Weichai, Fast Gear. Hotline/Zalo: ${siteConfig.hotline}`,
  hotlineRaw: siteConfig.hotlineRaw,
  zaloLink: siteConfig.zaloLink,
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SITE_SETTINGS,
  loading: false,
  refreshSettings: async () => {},
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetchApi("/settings");
      if (res.ok && res.data) {
        const d = res.data;
        const rawPhone = (d.hotlineZalo || siteConfig.hotline).replace(/\D/g, "");
        setSettings({
          hotlineZalo: d.hotlineZalo || siteConfig.hotline,
          phoneSales: d.phoneSales || d.hotlineZalo || siteConfig.hotline,
          emailContact: d.emailContact || siteConfig.email,
          warehouseAddress: d.warehouseAddress || siteConfig.address,
          workingHours: d.workingHours || siteConfig.workingHours,
          homeHeroSlogan: d.homeHeroSlogan || "Nhập Khẩu & Phân Phối Phụ Tùng Xe Tải Nặng Trung Quốc Uy Tín 25 Năm Tại Đà Nẵng",
          noticeBarMessage: d.noticeBarMessage || `Tổng kho Phụ Tùng Xe Tải Q.BA Đà Nẵng. Hotline: ${d.hotlineZalo || siteConfig.hotline}`,
          hotlineRaw: rawPhone || siteConfig.hotlineRaw,
          zaloLink: `https://zalo.me/${rawPhone || siteConfig.hotlineRaw}`,
        });
      }
    } catch (err) {
      console.error("Failed to fetch site settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
