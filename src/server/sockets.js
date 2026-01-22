'use strict';

const { Server } = require('socket.io');
const { EVENTS } = require('../../shared/constants');
const roomService = require('./services/roomService');

const setupSockets = (server) => {
  const io = new Server(server, {
    cors: { origin: '*' },
  });

  io.on(EVENTS.CONNECTION, (socket) => {
    socket.on(EVENTS.ROOM_CREATE, ({ name, owner }) => {
      try {
        roomService.createRoom({ name, owner });
        io.emit(EVENTS.ROOM_LIST, roomService.getRooms());
      } catch (error) {
        socket.emit(EVENTS.ERROR, error.message);
      }
    });

    socket.on(EVENTS.ROOM_JOIN, ({ roomId, username }) => {
      try {
        const room = roomService.joinRoom({ roomId, username });

        socket.username = username;
        socket.roomId = roomId;

        socket.join(roomId);

        socket.emit(EVENTS.MSG_HISTORY, room.messages);
      } catch (error) {
        socket.emit(EVENTS.ERROR, error.message);
      }
    });

    socket.on(EVENTS.ROOM_RENAME, ({ roomId, newName }) => {
      try {
        roomService.renameRoom({ roomId, newName });

        io.emit(EVENTS.ROOM_LIST, roomService.getRooms() || []);
      } catch (error) {
        socket.emit(EVENTS.ERROR, error.message);
      }
    });

    socket.on(EVENTS.ROOM_DELETE, ({ roomId }) => {
      try {
        roomService.deleteRoom({ roomId });

        io.emit(EVENTS.ROOM_LIST, roomService.getRooms() || []);
      } catch (error) {
        socket.emit(EVENTS.ERROR, error.message);
      }
    });

    socket.on(EVENTS.MSG_SEND, ({ text }) => {
      try {
        if (!socket.username || !socket.roomId) {
          throw new Error('Користувач не в кімнаті');
        }

        const message = roomService.addMessage({
          roomId: socket.roomId,
          author: socket.username,
          text,
        });

        io.to(socket.roomId).emit(EVENTS.MSG_NEW, message);
      } catch (error) {
        socket.emit(EVENTS.ERROR, error.message);
      }
    });

    socket.on(EVENTS.DISCONNECT, () => {
      // eslint-disable-next-line no-console
      console.log(`Відключено: ${socket.id}`);
    });
  });

  return io;
};

module.exports = setupSockets;
