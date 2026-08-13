// Utility Mã Hóa Bảo Vệ Dữ Liệu Lưu Trữ Trong Trình Duyệt (Secure Storage)
// Đảm bảo TUYỆT ĐỐI KHÔNG lưu plain-text thông tin nhạy cảm ở LocalStorage

const SECRET_SALT = "Q.BA_SECURE_SALT_2026_ENTERPRISE_KEY_888";

function encodeString(str: string): string {
  try {
    let result = "";
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(unescape(encodeURIComponent(result)));
  } catch (e) {
    return btoa(encodeURIComponent(str));
  }
}

function decodeString(encodedStr: string): string {
  try {
    const raw = decodeURIComponent(escape(atob(encodedStr)));
    let result = "";
    for (let i = 0; i < raw.length; i++) {
      const charCode = raw.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    try {
      return decodeURIComponent(atob(encodedStr));
    } catch {
      return "";
    }
  }
}

export const secureStorage = {
  setItem: (key: string, value: any) => {
    if (typeof window === "undefined") return;
    try {
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
      const encryptedKey = encodeString(`key_${key}`);
      const encryptedValue = encodeString(stringValue);
      localStorage.setItem(encryptedKey, encryptedValue);
    } catch (err) {
      console.error("Lỗi mã hóa dữ liệu lưu trữ:", err);
    }
  },

  getItem: (key: string): any => {
    if (typeof window === "undefined") return null;
    try {
      const encryptedKey = encodeString(`key_${key}`);
      const encryptedValue = localStorage.getItem(encryptedKey);
      if (!encryptedValue) return null;

      const decryptedString = decodeString(encryptedValue);
      try {
        return JSON.parse(decryptedString);
      } catch {
        return decryptedString;
      }
    } catch (err) {
      return null;
    }
  },

  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    try {
      const encryptedKey = encodeString(`key_${key}`);
      localStorage.removeItem(encryptedKey);
    } catch (err) {
      console.error(err);
    }
  },

  clearAll: () => {
    if (typeof window === "undefined") return;
    localStorage.clear();
  }
};
