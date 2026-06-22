'use strict';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { authRouter } from './routes/auth.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { roomRouter } from './routes/room.route.js';
import { messageService } from './services/message.service.js';

const PORT = process.env.PORT || 3005;

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_HOST,
    credentials: true,
  },
});

app.set('io', io);

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);
app.use(express.json());

app.use('/', authRouter);
app.use('/rooms', roomRouter);

app.use(errorMiddleware);

io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send_message', async (data) => {
    try {
      const { text, userId, roomId } = data;

      const savedMessage = await messageService.createMessage(
        text,
        userId,
        roomId,
      );

      io.to(roomId).emit('receive_message', savedMessage);
    } catch (error) {}
  });

  socket.on('disconnect', () => {});
});

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on localhost:${PORT}`);
});
