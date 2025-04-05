import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
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
const roomUsersMap = new Map();

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinRoom", async (room) => {
    console.log(`User joined room: ${room} and socket id: ${socket.id}`);
    socket.join(room);
    userSocketMap.set(socket.id, room);

    if (!roomUsersMap.has(room)) {
      roomUsersMap.set(room, []);
    }
    roomUsersMap.get(room).push(socket.id);

    const otherUsers = roomUsersMap.get(room).filter(id => id !== socket.id);
    io.to(socket.id).emit("otherUsers", otherUsers);

    io.to(room).emit("userJoined", { socketId: socket.id, room });
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    userSocketMap.delete(socket.id);

    if (roomUsersMap.has(room)) {
      const users = roomUsersMap.get(room).filter(id => id !== socket.id);
      roomUsersMap.set(room, users);
    }

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

      if (roomUsersMap.has(room)) {
        const users = roomUsersMap.get(room).filter(id => id !== socket.id);
        roomUsersMap.set(room, users);
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(port, (err) => {
  if (err) throw err;
  console.log(`> Ready on port: ${port}`);
});