import express from "express";
import { createServer } from "http";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config({});

import userAuthRoute from "./routes/user.auth.routes.js";
import userRoute from "./routes/user.routes.js";
import projectRoute from "./routes/project.routes.js";
import tasksRoute from "./routes/project.tasks.route.js";
import filesRoute from "./routes/project.files.routes.js";
import commentsRoute from "./routes/comment.routes.js";
import notificationsRoute from "./routes/notification.routes.js";
import activityRoute from "./routes/activity.routes.js";
import chatRoute from "./routes/chat.routes.js";
import searchRoute from "./routes/search.routes.js";

import { initializeSocket } from "./utils/socket.js";
import { startScheduler }   from "./scheduler.js";

const client = new PrismaClient();
const app = express();
const httpServer = createServer(app); // Needed for Socket.IO
const PORT = process.env.PORT || 4000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ─── REST ROUTES ──────────────────────────────────────────────────────────────
app.use("/api/v1/auth/user", userAuthRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1", projectRoute);
app.use("/api/v1/task", tasksRoute);
app.use("/api/v1/files", filesRoute);
app.use("/api/v1/comments", commentsRoute);
app.use("/api/v1/notifications", notificationsRoute);
app.use("/api/v1/activity", activityRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/search", searchRoute);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── WEBSOCKET ────────────────────────────────────────────────────────────────
export const io = initializeSocket(httpServer);

// ─── START ────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
  console.log(`WebSocket ready on port ${PORT}`);
  startScheduler();
});