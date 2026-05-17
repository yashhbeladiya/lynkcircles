import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import cors from "cors";
import path from "path";

dotenv.config();

import initializeSocket from "./lib/socket.js";
import { connectDB } from "./lib/db.js";

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

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/feed", feedRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/works", workRoutes);
app.use("/api/v1/workdetails", workDetailRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/news", newsRoutes);
app.use("/api/v1/services", servicesRoutes);
app.use("/api/v1/search", searchRoutes);

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
// as do synchronous throws from express. Without this, unhandled errors
// either crash the process or leak stack traces to the client.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    message: isProd ? "Internal server error" : err.message,
  });
});

server.listen(PORT, () => {
  console.log(`Server running on :${PORT} (${process.env.NODE_ENV ?? "development"})`);
  connectDB();
});
