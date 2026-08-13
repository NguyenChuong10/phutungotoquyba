import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { apiRateLimiter } from "./middlewares/rateLimiter";

import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

// Security Hardening: Disable Express Fingerprinting Header
app.disable("x-powered-by");

// Security & Parsing Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Serve Uploaded Files with security headers
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Base Route V1 (Rate Limited)
app.use("/api/v1", apiRateLimiter, routes);

// Global Error Handler Middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 [Q.BA Enterprise API] Server running on http://localhost:${PORT}`);
    console.log(`🔐 [Admin Auth API Endpoint]: http://localhost:${PORT}/api/v1/auth/login`);
  });
}

export default app;
