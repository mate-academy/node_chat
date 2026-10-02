'use strict';

const rooms = [
  { roomId: '1', name: 'General', owner: 'Vasyl' },
  { roomId: '2', name: 'Random', owner: 'Anna' },
  { roomId: '3', name: 'Node.js', owner: 'Oleh' },
];

const getRooms = () => {
  return [...rooms];
};

const getById = (id) => {
  const roomFound = rooms.find((room) => room.roomId === id) || null;

  return roomFound;
};

const createRoom = (name, owner) => {
  const newRoom = {
    roomId: crypto.randomUUID(),
    name,
    owner,
  };

  rooms.push(newRoom);

  return newRoom;
};

const renameRoom = (id, newName) => {
  const roomRename = rooms.find((room) => room.roomId === id) || null;

  if (roomRename === null) {
    return null;
  }

  roomRename.name = newName;

  return roomRename;
};

const removeRoom = (id) => {
  const index = rooms.findIndex((room) => room.roomId === id);

  if (index === -1) {
    return false;
  }

  rooms.splice(index, 1);

  return true;
};

module.exports = {
  getRooms,
  getById,
  createRoom,
  renameRoom,
  removeRoom,
};
