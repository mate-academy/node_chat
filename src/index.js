'use strict';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDb = require('./utils/db');
const Chat = require('./models/Chat');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/user');
const roomRoutes = require('./routes/room');
const errorHandler = require('./middlewares/error');

connectDb();

const app = express();

app.use(express.json());
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  socket.on('message', async({ sender, message, room }) => {
    try {
      const chat = new Chat({
        sender,
        message,
        room,
      });

      await chat.save();

      if (room) {
        socket.to(room).emit('message', chat);
      } else {
        // send the message to all connected clients
        socket.broadcast.emit('message', chat);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  });

  socket.on('join room', (room) => {
    socket.join(room);
  });
});

// Error handling middleware
app.use(errorHandler);

server.listen(
  process.env.PORT,
  // eslint-disable-next-line no-console
  () => console.log(`Server running on port ${process.env.PORT}`));
