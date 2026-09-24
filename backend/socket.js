import { Server } from 'socket.io';

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });
  return io;
}

// Controllers call this to emit events without importing server.js
// directly (which would create a circular import: server.js starts the
// app, which mounts routes, which import controllers).
export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized - initSocket() must run before getIO() is called');
  }
  return io;
}
