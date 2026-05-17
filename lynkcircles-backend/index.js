import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import compression from "compression";

dotenv.config();

import initializeSocket from "./lib/socket.js";
import { connectDB } from "./lib/db.js";
import {
  authLimiter,
  searchLimiter,
  writeLimiter,
} from "./lib/rateLimiters.js";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import feedRoutes from "./routes/feed.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectionRoutes from "./routes/connection.route.js";
import workRoutes from "./routes/work.route.js";
import workDetailRoutes from "./routes/workDetails.route.js";
import newsRoutes from "./routes/news.route.js";
import messageRoutes from "./routes/message.route.js";
import servicesRoutes from "./routes/services.route.js";
import searchRoutes from "./routes/search.route.js";

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

const PORT = process.env.PORT || 5100;
const __dirname = path.resolve();
const isProd = process.env.NODE_ENV === "production";

// When deployed behind a reverse proxy (Render, Cloudflare, an ALB),
// trust one hop so req.ip resolves to the real client IP and the
// rate limiter actually keys on the right address. Disabled in dev
// because tools like curl on localhost don't need it.
if (isProd) app.set("trust proxy", 1);

/**
 * Hardening middleware. Order matters:
 *   1. compression — applies to responses, must come before route
 *      handlers so they go through it on the way out.
 *   2. helmet — sets security headers (CSP, X-Frame-Options, HSTS,
 *      X-Content-Type-Options, Referrer-Policy, etc.). Default config
 *      is sensible for an SPA + JSON API; cross-origin policies left
 *      permissive because we serve Cloudinary images and the FE may
 *      live on a different origin.
 *   3. cors — needs to run before any route returns a response so
 *      preflight requests get the right Allow headers.
 */
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: false, // SPA + Cloudinary — opt-in CSP later
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: isProd ? process.env.CLIENT_URL : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.get("/health", (req, res) =>
  res.json({ status: "ok", uptime: process.uptime(), env: process.env.NODE_ENV ?? "development" })
);

// Route-scoped rate limiters. Mount BEFORE the route so the limiter
// gates incoming requests. Auth gets the tightest bucket (brute-force
// target); writes and search get their own pools. Read endpoints
// stay unlimited at this layer — they're either cacheable or
// individually cheap.
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/search", searchLimiter, searchRoutes);

app.use("/api/v1/users", writeLimiter, userRoutes);
app.use("/api/v1/feed", writeLimiter, feedRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", writeLimiter, connectionRoutes);
app.use("/api/v1/works", writeLimiter, workRoutes);
app.use("/api/v1/workdetails", writeLimiter, workDetailRoutes);
app.use("/api/v1/messages", writeLimiter, messageRoutes);
app.use("/api/v1/news", newsRoutes);
app.use("/api/v1/services", servicesRoutes);

if (isProd) {
  app.use(express.static(path.join(__dirname, "/lynkcircles-react-app/build")));
  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "lynkcircles-react-app", "build", "index.html")
    );
  });
}

// 404 for unknown API routes — must come after all route mounts but
// before the SPA catch-all so it only fires for /api/* misses.
app.use("/api", (req, res) => {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handler. Any route that calls next(err) lands here,
// as do synchronous throws from express. Stack traces are kept out of
// the production response body but always logged server-side with
// request context so the on-call has something to triage from.
app.use((err, req, res, next) => {
  console.error(
    `[error] ${req.method} ${req.originalUrl} — ${err.message}`,
    isProd ? "" : `\n${err.stack}`
  );
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    message: isProd ? "Internal server error" : err.message,
  });
});

server.listen(PORT, () => {
  console.log(`Server running on :${PORT} (${process.env.NODE_ENV ?? "development"})`);
  connectDB();
});
