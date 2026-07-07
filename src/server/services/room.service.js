const { Room } = require('../models');

const roomService = {
  createRoom: async (nameRoom) => {
    const room = await Room.create({ name: nameRoom });

    if (!room) {
      throw new Error('Mistake during create room!');
    }

    return room;
  },
  renameRoom: async (idRoom, newName) => {
    const updatedRoom = await Room.findByIdAndUpdate(
      idRoom,
      { name: newName },
      { new: true },
    );

    if (!updatedRoom) {
      throw new Error('Room is not found!');
    }

    return updatedRoom;
  },

  deleteRoom: async (idRoom) => {
    const deletedRoom = await Room.findByIdAndDelete(idRoom);

    if (!deletedRoom) {
      throw new Error('Room not found');
    }

    return deletedRoom;
  },

  getRooms: async () => {
    const rooms = await Room.find().populate('users', 'name');

    return rooms;
  },

  addUser: async (idRoom, userId) => {
    const room = await Room.findByIdAndUpdate(
      idRoom,
      { $addToSet: { users: userId } },
      { new: true },
    );

    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  },
};

module.exports = {
  roomService,
};
