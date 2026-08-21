"use client";

import Script from "next/script";

export default function ErudaScript() {
  return (
    <Script
      id="eruda-cdn"
      src="https://cdn.jsdelivr.net/npm/eruda"
      strategy="lazyOnload"
      onLoad={() => {
        if (typeof window !== "undefined" && (window as any).eruda) {
          try {
            (window as any).eruda.init();
          } catch (e) {
            console.error("Eruda init error:", e);
          }
        }
      }}
    />
  );
}
