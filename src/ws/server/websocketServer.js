import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import * as jose from "jose";
import { createClient } from "redis";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const redisClient = createClient();

app.use(express.json());

const port = process.env.SOCKET_IO_PORT || 8080;

const userSocketMap = new Map();

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

// TODO : Provide auth fort socket.io
io.use(async (socket, next) => {
  next();
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinRoom", async (room) => {
    console.log(`User joined room: ${room} and socket id: ${socket.id}`);
    socket.join(room);
    userSocketMap.set(socket.id, room);
    io.to(room).emit("userJoined", { socketId: socket.id, room });
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    userSocketMap.delete(socket.id);
    io.to(room).emit("userLeft", { socketId: socket.id, room });
  });

  socket.on("move", (data) => {
    const { room, x, y } = data;
    console.log(`User moved to x: ${x} y: ${y} in room: ${room}`);
    if (x < 0 || y < 0) {
      socket.emit("moveRejected", { reason: "Invalid coordinates" });
    } else {
      socket.broadcast
        .to(room)
        .emit("userMoved", { socketId: socket.id, x, y });
    }
  });

  socket.on("disconnect", () => {
    const room = userSocketMap.get(socket.id);
    if (room) {
      io.to(room).emit("userLeft", { socketId: socket.id, room });
      userSocketMap.delete(socket.id);
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(port, (err) => {
  if (err) throw err;
  console.log(`> Ready on port: ${port}`);
});
