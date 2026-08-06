const { v4: uuidv4 } = require('uuid');

const rooms = [];

const createRoom = (name) => {
  const id = uuidv4();
  const newRoom = { name, id, messages: [] };

  rooms.push(newRoom);

  return newRoom;
};

const getRooms = () => {
  return rooms.map(({ id, name }) => ({ id, name }));
};

const getRoomById = (roomId) => {
  return rooms.find((room) => room.id === roomId);
};

const renameRoom = (roomId, newName) => {
  const room = getRoomById(roomId);

  if (!room) {
    return;
  }

  room.name = newName;

  return room;
};

const deleteRoom = (roomId) => {
  const index = rooms.findIndex((room) => room.id === roomId);

  if (index === -1) {
    return;
  }

  rooms.splice(index, 1);

  return true;
};

module.exports = { createRoom, getRooms, getRoomById, renameRoom, deleteRoom };
