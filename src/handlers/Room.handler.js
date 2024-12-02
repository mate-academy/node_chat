const RoomService = require('../services/Room.service.js');
const UserService = require('../services/User.service.js');
const { errorHandler } = require('../utils.js');

module.exports = (io, socket) => {
  const createRoom = (data) => {
    const room = RoomService.buildRoom(data);

    RoomService.addOne(room);

    const updatedRooms = RoomService.getAll();

    io.emit('rooms', updatedRooms);
  };

  const deleteRoom = (data) => {
    const usersInRoom = UserService.getAllByRoomId(data);

    if (usersInRoom.length > 0) {
      socket.emit('error', 'Room cannot be deleted as it is not empty');

      return;
    }

    RoomService.removeOne(data);

    const updatedRooms = RoomService.getAll();

    io.emit('rooms', updatedRooms);
  };

  const editRoom = (data) => {
    const usersInRoom = UserService.getAllByRoomId(data.id);

    if (usersInRoom.length > 0) {
      socket.emit('error', 'Room cannot be edited as it is not empty');

      return;
    }

    RoomService.updateOne(data.id, data.name);

    const updatedRooms = RoomService.getAll();

    io.emit('rooms', updatedRooms);
  };

  socket.on('createRoom', errorHandler(createRoom));
  socket.on('deleteRoom', errorHandler(deleteRoom));
  socket.on('editRoom', errorHandler(editRoom));
};
