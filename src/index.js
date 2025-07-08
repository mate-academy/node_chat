/* eslint-disable no-console */
'use strict';

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const authRouter = require('./routes/authRouter');
const chatRouter = require('./routes/chatRouter');
const { globalErrorHandler } = require('./middleware/error.middleware.js');
const chatRepository = require('./entity/chats.repository.js');
const usersRouter = require('./routes/usersRouter.js');

dotenv.config();

const PORT = process.env.SERVER_PORT || 3007;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

app.use('/auth', authRouter);
app.use('/chat', chatRouter);
app.use('/users', usersRouter);

app.use(globalErrorHandler);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);
  });

  socket.on('send_message', async (data) => {
    const { chatId, senderId, content } = data;

    try {
      const message = await chatRepository.createMessage(
        chatId,
        senderId,
        content,
      );

      io.to(chatId).emit('receive_message', message);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('message_error', { error: 'Could not send message.' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
