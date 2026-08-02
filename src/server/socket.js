'use strict';

const {
  getRoomList,
  getRoom,
  roomExists,
  createRoom,
  renameRoom,
  deleteRoom,
  addMessage,
} = require('./roomsStore');

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    let username = null;
    let currentRoomId = null;

    socket.on('user:join', (name) => {
      username = String(name || '').trim();

      if (!username) {
        return;
      }

      socket.emit('room:list', getRoomList());
    });

    socket.on('room:create', (name) => {
      const roomName = String(name || '').trim();

      if (!roomName) {
        return;
      }

      createRoom(roomName);
      io.emit('room:list', getRoomList());
    });

    socket.on('room:rename', ({ roomId, name } = {}) => {
      const roomName = String(name || '').trim();

      if (!roomId || !roomName) {
        return;
      }

      const room = renameRoom(roomId, roomName);

      if (room) {
        io.emit('room:list', getRoomList());
      }
    });

    socket.on('room:delete', (roomId) => {
      const deleted = deleteRoom(roomId);

      if (!deleted) {
        return;
      }

      io.to(roomId).emit('room:closed', { roomId });
      io.socketsLeave(roomId);
      io.emit('room:list', getRoomList());
    });

    socket.on('room:join', (roomId) => {
      if (!username || !roomExists(roomId)) {
        return;
      }

      if (currentRoomId) {
        socket.leave(currentRoomId);
      }

      currentRoomId = roomId;
      socket.join(roomId);

      const room = getRoom(roomId);

      socket.emit('room:history', {
        roomId,
        name: room.name,
        messages: room.messages,
      });
    });

    socket.on('message:send', (text) => {
      const messageText = String(text || '').trim();

      if (!username || !currentRoomId || !messageText) {
        return;
      }

      const message = addMessage(currentRoomId, username, messageText);

      if (message) {
        io.to(currentRoomId).emit('message:new', {
          roomId: currentRoomId,
          message,
        });
      }
    });
  });
}

module.exports = { registerSocketHandlers };
