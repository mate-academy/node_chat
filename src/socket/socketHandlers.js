/* eslint-disable no-console */

const roomManager = require('../models/roomManager');
const userManager = require('../models/userManager');

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('set username', (username) => {
      userManager.createUser(socket.id, username);
      console.log(`User ${socket.id} set username to: ${username}`);
      socket.emit('rooms list', roomManager.getRoomsList());
    });

    socket.on('join room', (roomId, callback) => {
      const user = userManager.getUser(socket.id);

      if (!user) {
        if (callback) {
          callback({ status: 'error', message: 'User not found' });
        }

        return;
      }

      const previousRoomId = user.currentRoom;

      if (previousRoomId) {
        socket.leave(previousRoomId);
        socket.to(previousRoomId).emit('user left', user.username);
      }

      if (!roomManager.roomExists(roomId)) {
        console.error(`Attempt to join non-existent room: ${roomId}`);

        if (callback) {
          callback({ status: 'error', message: 'Room not found' });
        }

        return;
      }

      socket.join(roomId);
      userManager.setUserRoom(socket.id, roomId);

      const room = roomManager.getRoom(roomId);

      console.log(
        `User ${user.username} (${socket.id}) joined room: ${room.name}`,
      );

      socket.to(roomId).emit('user joined', user.username);

      if (callback) {
        callback({
          status: 'ok',
          messages: room.messages,
        });
      }
    });

    socket.on('send message', (messageText) => {
      const user = userManager.getUser(socket.id);

      if (!user || !user.currentRoom) {
        return;
      }

      const roomId = user.currentRoom;
      const message = {
        author: user.username,
        text: messageText,
        time: new Date().toISOString(),
      };

      roomManager.addMessage(roomId, message);
      io.to(roomId).emit('new message', message);
    });

    socket.on('create room', (roomName, callback) => {
      const roomId = roomManager.createRoom(roomName);

      console.log(`Room created: ${roomName} (${roomId})`);

      io.emit('rooms list', roomManager.getRoomsList());

      if (callback) {
        callback(roomId);
      }
    });

    socket.on('rename room', ({ roomId, newName }) => {
      if (roomManager.renameRoom(roomId, newName)) {
        console.log(`Room ${roomId} renamed to: ${newName}`);
        io.emit('rooms list', roomManager.getRoomsList());
      }
    });

    socket.on('delete room', (roomId) => {
      if (roomManager.deleteRoom(roomId)) {
        console.log(`Room deleted: ${roomId}`);
        io.emit('rooms list', roomManager.getRoomsList());
      }
    });

    socket.on('disconnect', () => {
      const user = userManager.removeUser(socket.id);

      if (user) {
        if (user.currentRoom) {
          socket.to(user.currentRoom).emit('user left', user.username);
        }

        console.log(`User disconnected: ${user.username} (${socket.id})`);
      } else {
        console.log(`User disconnected: ${socket.id}`);
      }
    });
  });
}

module.exports = { setupSocketHandlers };
