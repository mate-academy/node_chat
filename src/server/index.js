/* eslint-disable no-console */
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import { getRooms, formatMessage, addMessageToRoom } from './socket.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.static('src/client'));
app.use(express.json());

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.emit('roomList', getRooms());

  socket.on('createRoom', (roomName) => {
    if (!getRooms().includes(roomName)) {
      fs.readFile('src/server/db.json', (_err, data) => {
        const rooms = JSON.parse(data);

        rooms[roomName] = [];

        fs.writeFile('src/server/db.json', JSON.stringify(rooms), (err) => {
          if (err) {
            console.error('Error writing to db.json:', err);
          } else {
            io.emit('roomList', getRooms());
          }
        });
      });
    }
  });

  socket.on('joinRoom', ({ username, roomName }) => {
    socket.join(roomName);

    fs.readFile('src/server/db.json', (_err, data) => {
      const messages = JSON.parse(data)[roomName] || [];

      messages.forEach((msg) => socket.emit('message', msg));
    });
  });

  socket.on('chatMessage', ({ username, roomName, message }) => {
    const formattedMessage = formatMessage(username, message);

    addMessageToRoom(roomName, formattedMessage);

    io.to(roomName).emit('message', formattedMessage);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
