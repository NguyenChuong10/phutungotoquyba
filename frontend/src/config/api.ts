import { secureStorage } from "@/utils/secureStorage";

// Phân biệt URL API khi render phía Server (SSR trong Docker) và phía Client (Trình duyệt)
const defaultBaseUrl =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1")
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1");

export const API_BASE_URL = defaultBaseUrl.replace(/\/$/, ""); // Xóa dấu / ở cuối nếu có

export const WS_BASE_URL = 
  process.env.NEXT_PUBLIC_WS_URL || 
  "ws://localhost:5000/ws";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? secureStorage.getItem("quyba_admin_token") : null;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Tự động chuẩn hóa endpoint (loại bỏ /api/v1 nếu lỡ truyền thừa)
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith("/api/v1/")) {
    cleanEndpoint = cleanEndpoint.replace("/api/v1", "");
  }

  const fullUrl = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(fullUrl, {
      cache: "no-store",
      ...options,
      headers
    });

    let data: any = {};
    const contentType = response.headers.get("content-type");
    
    // Chỉ parse json nếu server trả về content-type json
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    const errorMessage = data.error?.message || data.message;
    return { status: response.status, ok: response.ok, message: errorMessage, ...data };
  } catch (error: any) {
    return {
      status: 500,
      ok: false,
      message: error?.message || "Lỗi kết nối tới máy chủ"
    };
  }
}