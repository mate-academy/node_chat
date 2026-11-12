import 'dotenv/config';

import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

import sequelize from './config/database.js';

import roomRoutes from './routes/roomRoutes.js';
import chatSocket from './sockets/chatSocket.js';
import { Room } from './models/index.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);

app.use(express.json());

// Routes
app.use('/api/rooms', roomRoutes);

// Socket.IO
chatSocket(io);

// Start server
const start = async () => {
  try {
    await sequelize.authenticate();

    console.log('Database connected');

    await sequelize.sync();

    console.log('Models synchronized');

    const roomsCount = await Room.count();

    if (roomsCount === 0) {
      await Room.create({ name: 'General' });
    }

    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
  }
};

start();
