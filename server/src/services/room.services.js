const { Room } = require('../models/room');

const getRooms = async () => {
  const rooms = await Room.findAll();

  return rooms;
};

const getRoomByName = async (name) => {
  const room = await Room.findOne({ where: { name } });

  return room;
};

const getRoomById = async (id) => {
  const room = await Room.findByPk(id);

  return room;
};

const createRoom = async (name) => {
  await Room.create({ name });

  const room = await getRoomByName(name);

  return room;
};

const removeRoom = async (id) => {
  await Room.destroy({ where: { id } });
};

module.exports = {
  roomServices: {
    getRooms,
    getRoomByName,
    getRoomById,
    createRoom,
    removeRoom,
  },
};
