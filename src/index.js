const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const connectDB = require('./server/db');
const cors = require('cors');

const app = express();
const server = createServer(app);
const PORT = 3000;

const userRouter = require('./server/routing/user.router');
const messageRouter = require('./server/routing/message.router');
const roomRouter = require('./server/routing/room.router');

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('join_room', async (roomId) => {
    socket.join(roomId);

    const { Room, Message } = require('./server/models');

    const room = await Room.findById(roomId).populate('users', 'name');

    if (room) {
      io.to(roomId).emit('participants_updated', room.users);
    }

    const messages = await Message.find({ roomId })
      .sort({ time: 1 })
      .populate('authorId', 'name');

    socket.emit('history', messages);
  });

  socket.on('send_message', async (data) => {
    try {
      const { Message } = require('./server/models');
      const newMessage = await Message.create(data);
      const populatedMessage = await Message.findById(newMessage._id).populate(
        'authorId',
        'name',
      );

      io.to(data.roomId).emit('new_message', populatedMessage);
    } catch (error) {
      socket.emit('error', 'Не вдалося надіслати повідомлення');
    }
  });

  socket.on('disconnect', () => {});
});

connectDB().then(() => {
  server.listen(PORT, () => {});
});

app.use('/user', userRouter);
app.use('/room', roomRouter);
app.use('/message', messageRouter);
