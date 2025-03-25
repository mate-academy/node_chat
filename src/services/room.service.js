const Room = require('../models/room');

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

async function removeRoom(id) {
  const room = await findById(id);

  if (!room) {
    throw new Error('Room not found');
  }

  await room.destroy();
}

module.exports = {
  findByName,
  findById,
  removeRoom,
};
