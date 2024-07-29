const { v4: uuidv4 } = require('uuid');
const { Room } = require('../models/room.model');

const create = async (name, userId) => {
  const existRoom = await findByName(name);

  if (existRoom) {
    return;
  }

  const newRoom = await Room.create({ id: uuidv4(), name, userId });

  return newRoom;
};

const findByName = async (name) => {
  const room = await Room.findOne({ where: { name } });

  return room;
};

const getAll = async () => {
  const rooms = await Room.findAll();

  return rooms;
};

const deleteRoom = async (id) => {
  await Room.destroy({ where: { id } });
};

const renameRoom = async (id, newName) => {
  const room = await Room.findByPk(id);

  if (!room) {
    throw new Error('Room not found');
  }

  room.name = newName;
  await room.save();

  return room;
};

const roomService = {
  create,
  getAll,
  findByName,
  deleteRoom,
  renameRoom,
};

module.exports = {
  roomService,
};
