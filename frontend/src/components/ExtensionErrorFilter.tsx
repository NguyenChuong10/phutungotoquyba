"use client";

import { useEffect } from "react";

export default function ExtensionErrorFilter() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reasonMsg = event?.reason?.message || String(event?.reason || "");
      // Catch and silence third-party browser extension script rejections (e.g. M_ID property errors)
      if (reasonMsg.includes("M_ID") || reasonMsg.includes("bis_skin_checked")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
