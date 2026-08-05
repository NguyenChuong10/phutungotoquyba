export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return phoneRegex.test(phone.trim());
}

export function isValidEmail(email: string): boolean {
  if (!email) return true; // Email không bắt buộc
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}
