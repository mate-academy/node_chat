import express from 'express';
import 'dotenv/config';
import cors from 'cors'
import { authRouter } from './routes/auth.router.js';
import { roomRouter } from './routes/room.route.js';
import { Server } from 'socket.io';
import http from 'http';

export function createServer() {
  const app = express();

  app.use(express.json());
  app.use(cors({
     origin: process.env.CLIENT_HOST,
      credentials: true,
  }));
  app.use(authRouter)
  app.use(roomRouter)
  app.get('/', (req, res) => {
    res.send('hello everyone')
  })
  const httpServer = http.createServer(app)
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }

  });
app.set('io', io);
  io.on("connection", (socket) => {
  console.log("🟢 User connected", socket.id);


  socket.on("joinRoom", (roomId) => {
    socket.join(String(roomId));
    console.log(`User ${socket.id} joined room ${roomId}`);
  });
socket.on("leaveRoom", (roomId) => {
  socket.leave(String(roomId));
  console.log(`User ${socket.id} left room ${roomId}`);
});
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected", socket.id);
  });
});




  return {app,httpServer,io}
}
