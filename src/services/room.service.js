const { Room } = require('../models/room');

async function findByName(name) {
  return Room.findOne({
    where: { name },
  });
}

async function findById(id) {
  return Room.findOne({
    where: { id },
  });
}

async function getAllRooms() {
  return Room.findAll();
}

async function createRoom(name) {
  const room = await findByName(name);

  if (room) {
    throw Error('Room already exist');
  }

  await Room.create({
    name,
  });
}

async function removeRoom(id) {
  const room = findById(id);

  if (!room) {
    throw Error('Room not found');
  }

  await Room.destroy({
    where: { id },
  });
}

async function changeRoom(id, newName) {
  const room = await findById(id);

  if (!room) {
    throw Error('Room not found');
  }

  room.name = newName;
  await room.save();
}

module.exports = {
  createRoom,
  findByName,
  getAllRooms,
  changeRoom,
  removeRoom,
};
