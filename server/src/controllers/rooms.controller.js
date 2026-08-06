const {
  createRoom,
  getRooms,
  getRoomById,
  renameRoom,
  deleteRoom,
} = require('../services/rooms.service');
const { getMessages } = require('../services/messages.service');

const registerRoomsController = (io, socket) => {
  socket.on('create room', (name) => {
    if (typeof name !== 'string' || name.trim() === '') {
      return;
    }

    createRoom(name.trim());

    io.emit('room list', getRooms());
  });

  socket.on('get rooms', () => {
    const rooms = getRooms();

    socket.emit('room list', rooms);
  });

  socket.on('join room', (roomId) => {
    const room = getRoomById(roomId);

    if (!room) {
      return;
    }

    const previousRoomId = socket.data.roomId;

    if (previousRoomId) {
      socket.leave(previousRoomId);
    }

    socket.join(roomId);
    socket.data.roomId = roomId;

    socket.emit('messages list', getMessages(roomId));
  });

  socket.on('leave room', () => {
    const roomId = socket.data.roomId;

    if (roomId) {
      socket.leave(roomId);

      socket.data.roomId = null;
    }
  });

  socket.on('rename room', ({ roomId, newName }) => {
    if (typeof newName !== 'string' || newName.trim() === '') {
      return;
    }

    const room = renameRoom(roomId, newName);

    if (!room) {
      return;
    }

    io.emit('room list', getRooms());
  });

  socket.on('delete room', ({ roomId }) => {
    const deleted = deleteRoom(roomId);

    if (!deleted) {
      return;
    }

    io.emit('room list', getRooms());
  });
};

module.exports = { registerRoomsController };
