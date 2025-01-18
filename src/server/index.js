/* eslint-disable no-console */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

const users = {};
const rooms = {};

app.use(cors());

app.get('/', (req, res) => {
  res.send('Чат-сервер працює');
});

io.on('connection', (socket) => {
  console.log('User connection', socket.id);
  socket.emit('roomList', rooms);
  socket.emit('userList', rooms);
  socket.emit('messageList', rooms);

  socket.on('getRoomList', () => {
    socket.emit('roomList', rooms);
  });

  socket.on('getUserList', () => {
    socket.emit('userList', rooms);
  });

  socket.on('getMessageList', () => {
    socket.emit('messageList', rooms);
  });

  socket.on('newUser', ({ userName }) => {
    const user = {
      userId: socket.id,
      userName,
      roomId: null,
    };

    users[socket.id] = user;
  });

  socket.on('createRoom', ({ roomName }) => {
    const roomId = uuidv4();

    const room = {
      roomId,
      roomName,
      users: [],
      messages: [],
    };

    rooms[roomId] = room;
    io.emit('roomList', rooms);
    console.log('Rooms', rooms);
  });

  socket.on('deleteRoom', ({ roomId }) => {
    const room = rooms[roomId];

    if (room) {
      delete rooms[roomId];
    }

    io.emit('roomList', rooms);
    console.log(rooms);
  });

  socket.on('editRoomName', ({ roomId, newRoomName }) => {
    const room = rooms[roomId];

    if (room) {
      room.roomName = newRoomName;
    }

    io.emit('roomList', rooms);
  });

  socket.on('joinRoom', ({ roomId }) => {
    if (rooms[roomId] && users[socket.id]) {
      const room = rooms[roomId];
      const user = users[socket.id];

      if (!room.users.some((u) => u.userId === user.userId)) {
        room.users.push(user);
      }

      user.roomId = roomId;

      io.emit('roomList', rooms);
      io.emit('userList', rooms);
      console.log(rooms);
    }
  });

  socket.on('message', ({ message, roomId }) => {
    const room = rooms[roomId];
    const user = users[socket.id];

    if (room && user) {
      const newMessage = {
        mesId: uuidv4(),
        text: message,
        author: user.userName,
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      };

      room.messages.push(newMessage);
      io.emit('roomList', rooms);
      io.emit('messageList', rooms);
      console.log(rooms);
    }
  });

  socket.on('leaveRoom', ({ roomId }) => {
    const room = rooms[roomId];
    const user = users[socket.id];

    if (room && user) {
      room.users = room.users.filter((u) => u.userId !== user.userId);
      user.roomId = null;
      io.emit('userList', rooms);
    }
  });

  socket.on('disconnect', () => {
    delete users[socket.id];

    for (let roomId in rooms) {
      if (rooms[roomId].users[socket.id]) {
        delete rooms[roomId].users[socket.id];

        io.to(roomId).emit('userList', rooms[roomId].users);
      }
    }

    console.log(`Користувач відключився: ${socket.id}`);
  });

});

server.listen(5000, () => {
  console.log('Сервер працює на порту 5000');
});
