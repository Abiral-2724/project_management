"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getToken } from "@/lib/api";

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children, userId }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef({});

  useEffect(() => {
    if (!userId) return;
    const token = getToken();
    if (!token) return;

    // Dynamic import to avoid SSR issues
    import("socket.io-client").then(({ io }) => {
      const socket = io("https://planzo-project-management.onrender.com", {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));

      // Forward all registered events
      const proxyEvent = (event) => {
        socket.on(event, (data) => {
          const handlers = listenersRef.current[event] || [];
          handlers.forEach((fn) => fn(data));
        });
      };

      [
        "receive_message", "user_typing", "user_stopped_typing",
        "user_joined_project", "user_left_project", "online_users",
        "new_notification", "task_updated", "task_created", "task_deleted",
      ].forEach(proxyEvent);

      socketRef.current = socket;
    }).catch(console.error);

    return () => { socketRef.current?.disconnect(); };
  }, [userId]);

  const emit = (event, data) => socketRef.current?.emit(event, data);

  const on = (event, handler) => {
    listenersRef.current[event] = [...(listenersRef.current[event] || []), handler];
    return () => {
      listenersRef.current[event] = (listenersRef.current[event] || []).filter((h) => h !== handler);
    };
  };

  const joinProject = (projectId) => emit("join_project", projectId);
  const leaveProject = (projectId) => emit("leave_project", projectId);
  const sendMessage = (projectId, message, replyToId) => emit("send_message", { projectId, message, replyToId });
  const typingStart = (projectId) => emit("typing_start", { projectId });
  const typingStop = (projectId) => emit("typing_stop", { projectId });

  return (
    <SocketContext.Provider value={{ connected, emit, on, joinProject, leaveProject, sendMessage, typingStart, typingStop }}>
      {children}
    </SocketContext.Provider>
  );
}