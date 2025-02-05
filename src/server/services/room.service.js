const { Room } = require('../models/room.model.js');

const getRooms = async () => {
  const rooms = await Room.findAll();

  return rooms;
};

const getRoom = async (id) => {
  const room = await Room.findByPk(id);

  return room;
};

const addRoom = async (name) => {
  const newRoom = await Room.create({ name });

  return newRoom;
};

const updateRoom = async (id, name) => {
  await Room.update({ name }, { where: { id } });

  const updatedRoom = await getRoom(id);

  return updatedRoom;
};

const deleteRoom = async (id) => {
  await Room.destroy({
    where: {
      id,
    },
  });
};

module.exports = {
  getRooms,
  getRoom,
  addRoom,
  updateRoom,
  deleteRoom,
};
