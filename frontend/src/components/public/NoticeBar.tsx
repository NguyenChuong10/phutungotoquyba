"use client";

import React from "react";
import { Megaphone, Phone, Mail } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function NoticeBar() {
  const { settings } = useSiteSettings();

  if (!settings.noticeBarMessage) return null;

  return (
    <div className="bg-[#050810] text-gray-300 text-xs py-3 px-4 border-t border-slate-800/80">
      <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Notice Bar Announcement Ticker */}
        <div className="flex items-center gap-2.5 overflow-hidden w-full sm:w-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-500 text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs">
            <Megaphone className="w-3 h-3 animate-pulse text-red-500" />
            THÔNG BÁO TỪ Q.BA
          </span>
          <p className="truncate text-[11px] sm:text-xs text-gray-300 font-medium">
            {settings.noticeBarMessage}
          </p>
        </div>

        {/* Right Quick Contact Details & Copyright */}
        <div className="hidden md:flex items-center gap-4 shrink-0 text-[11px] text-gray-400">
          <a
            href={`tel:${settings.hotlineRaw}`}
            className="flex items-center gap-1.5 hover:text-brand transition-colors font-bold text-gray-200"
          >
            <Phone className="w-3.5 h-3.5 text-brand" />
            <span>Hotline: {settings.hotlineZalo}</span>
          </a>
          <span className="text-gray-700">|</span>
          <a
            href={`mailto:${settings.emailContact}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors text-gray-400"
          >
            <Mail className="w-3.5 h-3.5 text-brand" />
            <span>{settings.emailContact}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
