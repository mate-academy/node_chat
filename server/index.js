import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = app.listen(3005, () => {
  console.log('You server is running!');
});

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  }
});

let chatData = {
  rooms: ['General'],
  messages: [],
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.emit('init_data', chatData);

  socket.on('set_username', (name) => {
    socket.username = name;
    console.log(`Socket ${socket.id} is now known as ${name}.`)
  })

  socket.on('join_room', (roomName) => {
    const currentRooms = Array.from(socket.rooms);

    currentRooms.forEach(room => {
      if (room !== socket.id) socket.leave(room);
    });

    socket.join(roomName);
    console.log(`User ${socket.id} joined room: ${roomName}.`);
  })

  socket.on('send_message', (msg) => {
    chatData.messages.push(msg);
    io.to(msg.room).emit('receive_message', msg);
  });

  socket.on('create_room', (roomName) => {
    if (!chatData.rooms.includes(roomName)) {
      chatData.rooms.push(roomName);
      io.emit('update_rooms', chatData.rooms);
    }
  });

  socket.on('rename_room', ({ oldName, newName }) => {
    chatData.rooms = chatData.rooms.map(room => room === oldName ? newName : room);
    chatData.messages = chatData.messages.map(msg => msg.room === oldName ? { ...msg, room: newName } : msg);

    io.emit('init_data', chatData);
  });

  socket.on('delete_room', (roomName) => {
    chatData.rooms = chatData.rooms.filter(room => room !== roomName);
    chatData.messages = chatData.messages.filter(msg => msg.room !== roomName);

    io.emit('init_data', chatData);
  })

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
