'use strict';

const { randomUUID } = require('crypto');

const rooms = [
  {
    id: 'general',
    name: 'general',
  },
];

function getAll() {
  return rooms;
}

function getById(id) {
  return rooms.find((room) => room.id === id);
}

function create(name) {
  const newRoom = { id: randomUUID(), name };

  rooms.push(newRoom);

  return newRoom;
}

function rename(id, name) {
  const room = getById(id);

  if (!room) {
    return null;
  }

  room.name = name;

  return room;
}

function remove(id) {
  const index = rooms.findIndex((room) => room.id === id);

  if (index === -1) {
    return false;
  }

  rooms.splice(index, 1);

  return true;
}

module.exports = {
  getAll,
  getById,
  create,
  rename,
  remove,
};
