import { randomUUID } from 'node:crypto';
import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

app.use(cors());

const httpServer = app.listen(3005);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const chatData = {
  rooms: ['General'],
  messages: [],
};

io.on('connection', (socket) => {
  socket.emit('init_data', chatData);

  socket.on('set_username', (username) => {
    socket.username = username;
  });

  socket.on('join_room', (roomName) => {
    const joinedRooms = Array.from(socket.rooms);

    joinedRooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });

    socket.join(roomName);
  });

  socket.on('send_message', (message) => {
    const messageWithId = { ...message, id: randomUUID() };

    chatData.messages.push(messageWithId);
    io.to(message.room).emit('receive_message', messageWithId);
  });

  socket.on('create_room', (roomName) => {
    if (!chatData.rooms.includes(roomName)) {
      chatData.rooms.push(roomName);
      io.emit('update_rooms', chatData.rooms);
    }
  });

  socket.on('rename_room', ({ oldName, newName }) => {
    chatData.rooms = chatData.rooms.map((room) =>
      room === oldName ? newName : room,
    );

    chatData.messages = chatData.messages.map((message) =>
      message.room === oldName ? { ...message, room: newName } : message,
    );

    const socketsInOldRoom = io.sockets.adapter.rooms.get(oldName);

    if (socketsInOldRoom) {
      for (const socketId of [...socketsInOldRoom]) {
        const targetSocket = io.sockets.sockets.get(socketId);

        if (targetSocket) {
          targetSocket.leave(oldName);
          targetSocket.join(newName);
        }
      }
    }

    io.emit('room_renamed', { oldName, newName });
    io.emit('update_rooms', chatData.rooms);
  });

  socket.on('delete_room', (roomName) => {
    chatData.rooms = chatData.rooms.filter((room) => room !== roomName);

    chatData.messages = chatData.messages.filter(
      (message) => message.room !== roomName,
    );

    const socketsInRoom = io.sockets.adapter.rooms.get(roomName);

    if (socketsInRoom) {
      for (const socketId of [...socketsInRoom]) {
        const targetSocket = io.sockets.sockets.get(socketId);

        if (targetSocket) {
          targetSocket.leave(roomName);
          targetSocket.join('General');
        }
      }
    }

    io.emit('room_deleted', roomName);
    io.emit('update_rooms', chatData.rooms);
  });

  socket.on('disconnect', () => {});
});
