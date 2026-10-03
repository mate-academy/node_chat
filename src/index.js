/* eslint-disable no-console */
'use strict';

const http = require('http');
const path = require('path');
const express = require('express');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const GENERAL = 'general';
const MAX_HISTORY = 1000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '..', 'public')));

// roomId -> { id, name, messages: [{ id, author, time, text }] }
const rooms = new Map();
let nextRoomId = 1;
let nextMessageId = 1;

function clean(value, max) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, max);
}

function nameTaken(name, exceptId) {
  return [...rooms.values()].some((room) => {
    return (
      room.id !== exceptId && room.name.toLowerCase() === name.toLowerCase()
    );
  });
}

function roomList() {
  return [...rooms.values()].map((room) => ({ id: room.id, name: room.name }));
}

function broadcastRooms() {
  io.emit('rooms:list', roomList());
}

function fail(ack, error) {
  if (typeof ack === 'function') {
    ack({ ok: false, error });
  }
}

function succeed(ack, data) {
  if (typeof ack === 'function') {
    ack({ ok: true, ...data });
  }
}

rooms.set(GENERAL, { id: GENERAL, name: 'general', messages: [] });

io.on('connection', (socket) => {
  socket.emit('rooms:list', roomList());

  socket.on('username:set', (raw, ack) => {
    const username = clean(raw, 24);

    if (!username) {
      fail(ack, 'Enter a username.');

      return;
    }
    socket.data.username = username;
    succeed(ack, { username });
  });

  socket.on('room:join', (id, ack) => {
    if (!socket.data.username) {
      fail(ack, 'Set a username first.');

      return;
    }

    const room = rooms.get(id);

    if (!room) {
      fail(ack, 'Room not found.');

      return;
    }

    if (socket.data.roomId) {
      socket.leave(socket.data.roomId);
    }
    socket.join(room.id);
    socket.data.roomId = room.id;

    succeed(ack, {
      room: { id: room.id, name: room.name },
      messages: room.messages,
    });
  });

  socket.on('room:create', (raw, ack) => {
    const name = clean(raw, 32);

    if (!name) {
      fail(ack, 'Room name is required.');

      return;
    }

    if (nameTaken(name)) {
      fail(ack, 'That room name is taken.');

      return;
    }

    const id = `r${nextRoomId}`;

    nextRoomId += 1;
    rooms.set(id, { id, name, messages: [] });
    broadcastRooms();
    succeed(ack, { id });
  });

  socket.on('room:rename', (payload, ack) => {
    const data = payload || {};
    const room = rooms.get(data.id);
    const name = clean(data.name, 32);

    if (!room) {
      fail(ack, 'Room not found.');

      return;
    }

    if (!name) {
      fail(ack, 'Room name is required.');

      return;
    }

    if (nameTaken(name, room.id)) {
      fail(ack, 'That room name is taken.');

      return;
    }
    room.name = name;
    broadcastRooms();
    succeed(ack, {});
  });

  socket.on('room:delete', (id, ack) => {
    if (id === GENERAL) {
      fail(ack, 'The general room cannot be deleted.');

      return;
    }

    if (!rooms.delete(id)) {
      fail(ack, 'Room not found.');

      return;
    }
    io.to(id).emit('room:deleted', id); // clients in the room move to general
    io.in(id).socketsLeave(id);
    broadcastRooms();
    succeed(ack, {});
  });

  socket.on('message:send', (raw, ack) => {
    const { username, roomId } = socket.data;
    const text = String(raw || '')
      .trim()
      .slice(0, 2000);
    const room = rooms.get(roomId);

    if (!username || !room) {
      fail(ack, 'Join a room first.');

      return;
    }

    if (!text) {
      fail(ack, 'Message is empty.');

      return;
    }

    const message = {
      id: nextMessageId,
      author: username,
      time: new Date().toISOString(),
      text,
    };

    nextMessageId += 1;
    room.messages.push(message);

    if (room.messages.length > MAX_HISTORY) {
      room.messages.shift();
    }
    io.to(room.id).emit('message:new', { roomId: room.id, message });
    succeed(ack, {});
  });
});

server.listen(PORT, () => {
  console.log(`Chat running at http://localhost:${PORT}`);
});
