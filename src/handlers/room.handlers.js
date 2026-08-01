'use strict';

const roomService = require('../services/room.service.js');
const messageService = require('../services/message.service.js');

function register(io, socket) {
  const broadcastRooms = () => io.emit('rooms:list', roomService.list());

  socket.on('room:create', (name) => {
    if (roomService.create(name)) {
      broadcastRooms();
    }
  });

  socket.on('room:rename', ({ roomId, name }) => {
    if (roomService.rename(roomId, name)) {
      broadcastRooms();
    }
  });

  socket.on('room:delete', (roomId) => {
    if (roomService.remove(roomId)) {
      broadcastRooms();
    }
  });

  socket.on('room:join', (roomId) => {
    const room = roomService.get(roomId);

    if (!room) {
      return;
    }

    for (const joined of socket.rooms) {
      if (joined !== socket.id) {
        socket.leave(joined);
      }
    }

    socket.join(String(roomId));

    socket.emit('room:history', {
      roomId,
      messages: messageService.history(roomId),
    });
  });
}

module.exports = { register };
