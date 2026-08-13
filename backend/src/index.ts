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

// HTTP & WebSocket Server Setup
const server = http.createServer(app);
initWebSocketServer(server);

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`🚀 [Q.BA Enterprise API] Server running on http://localhost:${PORT}`);
    console.log(`⚡ [WebSocket Real-Time Server]: ws://localhost:${PORT}/ws`);
  });
}

export default app;
