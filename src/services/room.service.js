const Room = require('../models/room');

// Find room by name
async function findByName(name) {
  return Room.findOne({
    where: { name },
  });
}

// Find room by id
async function findById(id) {
  return Room.findOne({
    where: { id },
  });
}

// Create a new room
async function createRoom({ name, description }) {
  // Create a new room record in the database
  const room = await Room.create({
    name,
    description,
  });

  return room;
}

// Change an existing room's details (e.g., change its name or description)
async function changeRoom(id, { name, description }) {
  const room = await findById(id);

  if (!room) {
    throw new Error('Room not found');
  }

  // Update room properties
  room.name = name || room.name;
  room.description = description || room.description;

  await room.save(); // Save updated room

  return room;
}

// Remove a room
async function removeRoom(id) {
  const room = await findById(id);

  if (!room) {
    throw new Error('Room not found');
  }

  await room.destroy(); // Delete the room from the database

  return { message: 'Room removed successfully' };
}

module.exports = {
  createRoom,
  changeRoom,
  findByName,
  findById,
  removeRoom,
};
