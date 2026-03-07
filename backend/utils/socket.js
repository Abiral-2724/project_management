import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const client = new PrismaClient();

// Map: userId -> Set of socket IDs
const onlineUsers = new Map();

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "https://project-management-gold-phi.vercel.app",
      credentials: true,
    },
  });

  // Middleware: authenticate socket connection via JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.SECERET_KEY);
      const user = await client.user.findFirst({ where: { id: decoded.id } });
      if (!user) return next(new Error("User not found"));

      socket.userId = user.id;
      socket.userEmail = user.email;
      socket.userFullname = user.fullname;
      socket.userProfile = user.profile;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${userId} (${socket.id})`);

    // Track online users
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    // ─── PROJECT ROOMS ──────────────────────────────────────────────────────
    socket.on("join_project", (projectId) => {
      socket.join(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit("user_joined_project", {
        userId,
        fullname: socket.userFullname,
        profile: socket.userProfile,
        projectId,
      });
    });

    socket.on("leave_project", (projectId) => {
      socket.leave(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit("user_left_project", { userId, projectId });
    });

    // ─── TASK UPDATES (live) ─────────────────────────────────────────────────
    // Emit from REST controllers after DB updates using io.to(room).emit(...)
    // Client listens on: "task_updated", "task_created", "task_deleted"
    // Client listens on: "subtask_updated", "subtask_created"

    // ─── TEAM CHAT ───────────────────────────────────────────────────────────
    socket.on("send_message", async (data) => {
      try {
        const { projectId, message, replyToId } = data;
        if (!message || !message.trim()) return;

        // Persist message
        const saved = await client.chatMessage.create({
          data: {
            project_id: projectId,
            sender_id:  userId,
            content:    message.trim(),
            reply_to_id: replyToId || null,
          },
        });

        const payload = {
          id:            saved.id,
          projectId,
          message:       message.trim(),
          senderId:      userId,
          senderName:    socket.userFullname,
          senderProfile: socket.userProfile,
          replyToId:     replyToId || null,
          createdAt:     saved.createdAt,
        };

        // Broadcast to everyone in the project room (including sender)
        io.to(`project:${projectId}`).emit("receive_message", payload);

        // ── @mention detection ──────────────────────────────────────────────
        // Extract every @word from the message
        const mentionHandles = [...message.matchAll(/@([\w.]+)/g)].map((m) => m[1].toLowerCase());
        if (mentionHandles.length) {
          // Fetch all project members once
          const members = await client.project_Members.findMany({ where: { projectId } });

          for (const handle of mentionHandles) {
            // Match handle against member fullname or email prefix (case-insensitive)
            const matched = members.find((m) => {
              const emailPrefix = m.emailuser.split("@")[0].toLowerCase();
              return emailPrefix.includes(handle) || handle.includes(emailPrefix);
            });
            if (!matched) continue;

            // Find the user record for the matched member
            const mentionedUser = await client.user.findFirst({
              where: { email: matched.emailuser },
            });
            if (!mentionedUser || mentionedUser.id === userId) continue; // skip self-mentions

            // Persist in-app notification
            try {
              const notif = await client.notification.create({
                data: {
                  user_id:    mentionedUser.id,
                  type:       "MENTION",
                  message:    `${socket.userFullname} mentioned you in project chat: "${message.trim().slice(0, 80)}${message.length > 80 ? "…" : ""}"`,
                  project_id: projectId,
                  task_id:    null,
                },
              });
              // Push real-time notification to mentioned user's personal room
              io.to(`user:${mentionedUser.id}`).emit("new_notification", notif);
            } catch (notifErr) {
              console.warn("mention notification error:", notifErr.message);
            }
          }
        }
      } catch (err) {
        console.error("send_message error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicators
    socket.on("typing_start", ({ projectId }) => {
      socket.to(`project:${projectId}`).emit("user_typing", {
        userId,
        fullname: socket.userFullname,
        projectId,
      });
    });

    socket.on("typing_stop", ({ projectId }) => {
      socket.to(`project:${projectId}`).emit("user_stopped_typing", { userId, projectId });
    });

    // ─── NOTIFICATIONS ────────────────────────────────────────────────────────
    // Join personal notification room
    socket.join(`user:${userId}`);

    // ─── ONLINE PRESENCE ─────────────────────────────────────────────────────
    socket.on("get_online_users", ({ projectId }) => {
      const roomSockets = io.sockets.adapter.rooms.get(`project:${projectId}`);
      if (!roomSockets) return socket.emit("online_users", []);

      const onlineInProject = [];
      roomSockets.forEach((socketId) => {
        const s = io.sockets.sockets.get(socketId);
        if (s) onlineInProject.push({ userId: s.userId, fullname: s.userFullname });
      });
      socket.emit("online_users", onlineInProject);
    });

    // ─── DISCONNECT ───────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) onlineUsers.delete(userId);
      }
    });
  });

  return io;
};

// Helper: push a real-time notification to a specific user
export const emitNotificationToUser = (io, userId, notification) => {
  io.to(`user:${userId}`).emit("new_notification", notification);
};

// Helper: broadcast task update to a project room
export const emitTaskUpdate = (io, projectId, event, data) => {
  io.to(`project:${projectId}`).emit(event, data);
};