export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(amount);
}

export function formatPartNumber(partNo: string): string {
  if (!partNo) return "";
  return partNo.toUpperCase().trim();
}
