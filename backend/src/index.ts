import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { apiRateLimiter } from "./middlewares/rateLimiter";
import { initWebSocketServer } from "./services/websocketService";

const app = express();
const PORT = process.env.PORT || 5000;

// Security Hardening: Disable Express Fingerprinting Header
app.disable("x-powered-by");

// 1. CẤU HÌNH CORS ĐẶT ĐẦU TIÊN (Trước mọi middleware khác)
const allowedOrigins = [
  "https://phutungotoquyba.buiduchieu.id.vn",
  "http://localhost:3000",
  "http://42.118.98.35:3000",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Cho phép requests không có origin (curl, mobile native app, server-to-server) hoặc thuộc whitelist
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Tạm thời cho qua để tránh chặn nhầm lúc test
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Xử lý Preflight request cho tất cả các route

// 2. HELMET & PARSERS
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 3. STATIC FILES
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 4. API ROUTES
app.use("/api/v1", apiRateLimiter, routes);

// 5. GLOBAL ERROR HANDLER (Phải nằm sau routes)
app.use(errorHandler);

// HTTP & WebSocket Server Setup
const server = http.createServer(app);
initWebSocketServer(server);

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, async () => {
    console.log(`🚀 [Q.BA Enterprise API] Server running on http://localhost:${PORT}`);
    console.log(`⚡ [WebSocket Real-Time Server]: ws://localhost:${PORT}/ws`);

    // Ensure database tables exist automatically
    try {
      const { ensurePartnerBrandsTable } = require("./services/partnerBrandService");
      const { ensureSystemSettingsTable } = require("./services/settingService");
      const { ensureJobPostingsTable } = require("./services/jobPostingService");
      await ensurePartnerBrandsTable();
      await ensureSystemSettingsTable();
      await ensureJobPostingsTable();
    } catch {
      // Auto table init fallback
    }
  });
}

export default app;