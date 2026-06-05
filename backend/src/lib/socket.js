import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

// userId -> Set of socketIds
const userSocketMap = new Map();

// helper: get all sockets for a user
export function getReceiverSocketId(userId) {
  return userSocketMap.get(userId) || new Set();
}

io.on("connection", (socket) => {
  const userId = socket.userId;

  console.log("A user connected", socket.user.fullName);

  // initialize set if needed
  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set());
  }

  userSocketMap.get(userId).add(socket.id);

  // emit only active users
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);

    const sockets = userSocketMap.get(userId);

    if (sockets) {
      sockets.delete(socket.id);

      if (sockets.size === 0) {
        userSocketMap.delete(userId);
      }
    }

    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

// helper for message fan-out (use in newMessage logic)
export function emitToUser(userId, event, payload) {
  const sockets = userSocketMap.get(userId);

  if (!sockets) return;

  for (const socketId of sockets) {
    io.to(socketId).emit(event, payload);
  }
}

export { io, app, server };