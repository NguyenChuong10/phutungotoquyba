/**
 * Utility helper to sanitize and format product image URLs safely across Frontend and Backend.
 */
export function formatImageUrl(url?: string | null): string {
  const DEFAULT_FALLBACK = "/images/logo/logonen.png";

  if (
    !url ||
    typeof url !== "string" ||
    url.trim() === "" ||
    url === "null" ||
    url === "undefined"
  ) {
    return DEFAULT_FALLBACK;
  }

  // Filter out temporary expired browser blob URLs
  if (url.startsWith("blob:")) {
    return DEFAULT_FALLBACK;
  }

  // Serve backend uploads cleanly as relative path (proxied by Next.js rewrites)
  if (url.startsWith("/uploads/")) {
    return url;
  }

  return url;
}
