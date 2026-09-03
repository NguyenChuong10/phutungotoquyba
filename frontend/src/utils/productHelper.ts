/**
 * Convert Vietnamese string to clean SEO slug
 */
export function slugify(text: string | undefined | null): string {
  if (!text) return "";

  let str = text.trim().toLowerCase();

  // Replace Vietnamese diacritics
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");

  // Remove special characters, keep alphanumeric and spaces
  str = str.replace(/[^a-z0-9\s-]/g, "");

  // Replace multiple spaces or hyphens with a single hyphen
  str = str.replace(/[\s_]+/g, "-").replace(/-+/g, "-");

  // Trim leading/trailing hyphens
  return str.replace(/^-+|-+$/g, "");
}

/**
 * Generate SEO-friendly product URL (/products/[slug]-[id])
 */
export function getProductUrl(product: { id: number | string; name?: string }): string {
  const numericId = parseNumericProductId(product.id);
  const slug = slugify(product.name);
  if (!slug) {
    return `/products/${numericId}`;
  }
  return `/products/${slug}-${numericId}`;
}

/**
 * Safely parse product ID to integer.
 * Handles numbers, numeric strings ("2"), mock string IDs ("p2" -> 2),
 * and slug-id strings ("loc-gio-santafe-2021-123" -> 123).
 * Returns fallback if invalid.
 */
export function parseNumericProductId(id: string | number | undefined | null, fallback = 2): number {
  if (id === undefined || id === null) return fallback;
  if (typeof id === "number") return isNaN(id) ? fallback : id;

  const str = String(id).trim();

  // Extract trailing digits after last hyphen or digits at the end
  const match = str.match(/(?:^|-)(\d+)$/);
  if (match && match[1]) {
    const parsed = parseInt(match[1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  const digitsOnly = str.replace(/\D/g, "");
  if (!digitsOnly) return fallback;

  const parsed = parseInt(digitsOnly, 10);
  return isNaN(parsed) || parsed <= 0 ? fallback : parsed;
}

