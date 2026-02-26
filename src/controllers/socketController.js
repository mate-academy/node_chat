'use strict';

const store = require('../store');

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    let username = null;
    let currentRoom = null;

    // Send the list of rooms to the newly connected client
    socket.emit('room:list', store.getRooms());

    // User sets their username
    socket.on('user:set', (name) => {
      username = name;
    });

    // User joins a room
    socket.on('room:join', (roomId) => {
      const room = store.getRoom(roomId);

      if (!room) {
        socket.emit('error:message', 'Room not found');

        return;
      }

      // Leave previous room if any
      if (currentRoom) {
        socket.leave(currentRoom);
      }

      currentRoom = roomId;
      socket.join(roomId);

      // Send message history to the user
      socket.emit('room:history', {
        roomId,
        messages: store.getRoomMessages(roomId),
      });

      // Notify room members
      io.to(roomId).emit('room:userJoined', {
        roomId,
        username,
      });
    });

    // User sends a message
    socket.on('message:send', (data) => {
      const { text } = data;

      if (!currentRoom || !username || !text) {
        return;
      }

      const message = store.addMessage(currentRoom, username, text);

      if (message) {
        io.to(currentRoom).emit('message:new', {
          roomId: currentRoom,
          message,
        });
      }
    });

    // Create a new room
    socket.on('room:create', (name) => {
      if (!name || !name.trim()) {
        socket.emit('error:message', 'Room name cannot be empty');

        return;
      }

      const room = store.createRoom(name.trim());

      // Broadcast updated room list to all clients
      io.emit('room:list', store.getRooms());
      io.emit('room:created', room);
    });

    // Rename a room
    socket.on('room:rename', (data) => {
      const { roomId, newName } = data;

      if (!newName || !newName.trim()) {
        socket.emit('error:message', 'Room name cannot be empty');

        return;
      }

      if (roomId === store.DEFAULT_ROOM_ID) {
        socket.emit('error:message', 'Cannot rename the default room');

        return;
      }

      const room = store.renameRoom(roomId, newName.trim());

      if (!room) {
        socket.emit('error:message', 'Room not found');

        return;
      }

      io.emit('room:list', store.getRooms());
      io.emit('room:renamed', room);
    });

    // Delete a room
    socket.on('room:delete', (roomId) => {
      if (roomId === store.DEFAULT_ROOM_ID) {
        socket.emit('error:message', 'Cannot delete the default room');

        return;
      }

      const deleted = store.deleteRoom(roomId);

      if (!deleted) {
        socket.emit('error:message', 'Room not found');

        return;
      }

      // Notify clients in the deleted room so they re-join General
      // This ensures each socket's currentRoom state is properly updated
      // via the room:join handler on both client and server
      io.to(roomId).emit('room:deleted', { roomId });

      io.emit('room:list', store.getRooms());
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (currentRoom && username) {
        io.to(currentRoom).emit('room:userLeft', {
          roomId: currentRoom,
          username,
        });
      }
    });
  });
}

module.exports = { registerSocketHandlers };
