import type { NextConfig } from "next";
import path from "path";

const backendProtocol = (process.env.NEXT_PUBLIC_API_PROTOCOL || "http") as "http" | "https";
const backendHostname = process.env.NEXT_PUBLIC_API_HOSTNAME || "phutungotoquyba-be";
const backendPort = process.env.NEXT_PUBLIC_API_PORT || "5000";

// Tự động quyết định URL đích cho Proxy/Uploads tùy theo môi trường
const backendUploadDestination =
  process.env.NEXT_PUBLIC_UPLOADS_DESTINATION ||
  `${backendProtocol}://${backendHostname}:${backendPort}/uploads/:path*`;

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, "../"),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Cho phép load ảnh từ Docker Container Backend
      {
        protocol: backendProtocol,
        hostname: backendHostname,
        ...(backendPort ? { port: backendPort } : {}),
      },
      // Cho phép load ảnh từ Localhost
      {
        protocol: backendProtocol,
        hostname: "localhost",
        ...(backendPort ? { port: backendPort } : {}),
      },
      {
        protocol: backendProtocol,
        hostname: "127.0.0.1",
        ...(backendPort ? { port: backendPort } : {}),
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: backendUploadDestination,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;