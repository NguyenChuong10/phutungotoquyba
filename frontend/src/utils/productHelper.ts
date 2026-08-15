/**
 * Safely parse product ID to integer.
 * Handles numbers, numeric strings ("2"), and mock string IDs ("p2" -> 2).
 * Returns fallback (default 2) if invalid.
 */
export function parseNumericProductId(id: string | number | undefined | null, fallback = 2): number {
  if (id === undefined || id === null) return fallback;
  if (typeof id === "number") return isNaN(id) ? fallback : id;

  const str = String(id).trim();
  const digitsOnly = str.replace(/\D/g, "");
  if (!digitsOnly) return fallback;

  const parsed = parseInt(digitsOnly, 10);
  return isNaN(parsed) || parsed <= 0 ? fallback : parsed;
}
