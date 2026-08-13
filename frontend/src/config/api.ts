import { secureStorage } from "@/utils/secureStorage";

// export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Phân biệt URL API khi render phía Server (SSR trong Docker) và phía Client (Trình duyệt)
const defaultBaseUrl =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://host.docker.internal:5000/api/v1")
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1");
export const API_BASE_URL = defaultBaseUrl;

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? secureStorage.getItem("quyba_admin_token") : null;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    cache: "no-store",
    ...options,
    headers
  });

  const data = await response.json();
  return { status: response.status, ok: response.ok, ...data };
}
