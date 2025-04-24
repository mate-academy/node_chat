import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3005;
const app = express();

app.use(cors());
app.use(express.json());


const messages = [];

const roomMeta = {};

app.post('/messages', (req, res) => {
  const { text, username, messageTime } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).send('Write something!');
  }

  const message = {
    id: Date.now(),
    author: username,
    text,
    messageTime
  };

  io.emit('message', message);

  res.status(200).json({ success: true });
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('getMessages', () => {
    socket.emit('messages', messages);
  });

  socket.on('joinToRoom', ({ name }) => {
    const roomId = name;

    try {
      socket.join(roomId);

      if (!roomMeta[roomId]) {
        roomMeta[roomId] = { roomId, name: name || 'Без названия' };
      }

      io.emit('roomList', Object.values(roomMeta));

      socket.emit('checkRoomResult', { roomId, isMember: true });

      socket.to(roomId).emit('message', `Пользователь ${socket.id} присоединился`);
    } catch (error) {
      console.log(error, 'error');
    }

    socket.to(roomId).emit('message', `Пользователь ${socket.id} присоединился`);
  });

  socket.on('renameRoom', (roomId, newName) => {
    if (roomMeta[roomId]) {
      roomMeta[roomId].name = newName;

      // Уведомляем комнату
      socket.to(roomId).emit('message', `Group was renamed to ${newName}`);

      // Обновляем список для всех
      io.emit('roomList', Object.values(roomMeta));
    }
  });

  socket.on('checkRoom', (roomId) => {
    const isMember = io.sockets.adapter.rooms.get(roomId)?.has(socket.id) || false;
    socket.emit('checkRoomResult', { roomId, isMember });
  });

  socket.on('deleteRoom', (roomName) => {
    if (roomMeta[roomName]) {
      delete roomMeta[roomName];

      io.emit('roomList', Object.values(roomMeta));
    }

    socket.leave(roomName);
  });

  socket.on('getRooms', () => {
    socket.emit('roomsList', roomMeta);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

