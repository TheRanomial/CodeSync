import express from "express";
import http from "http";
import ACTIONS from "./src/Actions.js";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static("build"));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

io.on("connection", (socket) => {
  console.log("Socket is connected", socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    const existingSocketId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === username
    );

    if (existingSocketId) {
      const existingSocket = io.sockets.sockets.get(existingSocketId);
      if (existingSocket) {
        existingSocket.disconnect();
      }
      delete userSocketMap[existingSocketId];
      console.log(
        `Username ${username} was connected with socket ${existingSocketId}. Replacing with ${socket.id}`
      );
    }

    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`LISTENING ON PORT ${PORT}`);
});
