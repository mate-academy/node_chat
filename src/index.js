const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
});

const DB_PATH = path.join(__dirname, 'db.json');

function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({ rooms: {} }, null, 2));

      return { rooms: {} };
    }

    const data = fs.readFileSync(DB_PATH, 'utf8').trim();

    if (!data) {
      const defaultData = { rooms: {} };

      fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));

      return defaultData;
    }

    return JSON.parse(data);
  } catch (err) {
    return { rooms: {} };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {}
}

let db = readDB();

if (Object.keys(db.rooms).length === 0) {
  db.rooms['retro-room'] = {
    id: 'retro-room',
    name: 'Retro Dungeon',
    cover: '/covers/cover1.jpg',
    creator: 'System',
    messages: [],
  };
  writeDB(db);
}

const users = {};

io.on('connection', (socket) => {
  db = readDB();
  socket.emit('update:rooms', Object.values(db.rooms));

  socket.on('join:room', ({ roomId, username, avatar }) => {
    const oldRoomId = users[socket.id]?.currentRoom;

    if (oldRoomId) {
      socket.leave(oldRoomId);
      setTimeout(() => updateRoomUsersCount(oldRoomId), 50);
    }

    users[socket.id] = { username, avatar, currentRoom: roomId };

    if (roomId) {
      socket.join(roomId);
      db = readDB();

      if (db.rooms[roomId]) {
        socket.emit('room:history', db.rooms[roomId].messages);
        setTimeout(() => updateRoomUsersCount(roomId), 50);
      }
    }
  });

  socket.on('create:room', ({ name, cover, creator }) => {
    const id = `room-${Date.now()}`;

    db = readDB();

    db.rooms[id] = {
      id,
      name,
      cover,
      creator,
      messages: [],
    };
    writeDB(db);
    io.emit('update:rooms', Object.values(db.rooms));
  });

  socket.on('send:message', ({ text }) => {
    const user = users[socket.id];

    if (!user || !user.currentRoom) {
      return;
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      author: user.username,
      avatar: user.avatar,
      text: text,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    db = readDB();

    if (db.rooms[user.currentRoom]) {
      db.rooms[user.currentRoom].messages.push(newMessage);
      writeDB(db);
      io.to(user.currentRoom).emit('receive:message', newMessage);
    }
  });

  socket.on('edit:room', ({ roomId, newName, newCover, username }) => {
    db = readDB();

    const room = db.rooms[roomId];

    if (room && room.creator === username) {
      room.name = newName;
      room.cover = newCover;

      writeDB(db);
      io.emit('update:rooms', Object.values(db.rooms));

      io.to(roomId).emit('room:updated', {
        name: room.name,
        cover: room.cover,
      });
    }
  });

  socket.on('delete:room', ({ roomId, username }) => {
    db = readDB();

    const room = db.rooms[roomId];

    if (room && room.creator === username) {
      delete db.rooms[roomId];
      writeDB(db);
      io.emit('update:rooms', Object.values(db.rooms));
      io.to(roomId).emit('room:deleted');
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];

    if (user && user.currentRoom) {
      const roomId = user.currentRoom;

      delete users[socket.id];

      setTimeout(() => {
        updateRoomUsersCount(roomId);
      }, 100);
    }
  });
});

function updateRoomUsersCount(roomId) {
  if (!roomId) {
    return;
  }

  const uniqueUsers = new Set(
    Object.values(users)
      .filter((u) => u.currentRoom === roomId)
      .map((u) => u.username),
  );

  io.to(roomId).emit('room:users_count', uniqueUsers.size);
}

const PORT = 3000;

server.listen(PORT);
