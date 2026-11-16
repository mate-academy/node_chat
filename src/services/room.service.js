import { randomUUID } from 'node:crypto';

const rooms = [{ id: randomUUID(), name: 'General' }];

function getAll() {
  return rooms;
}

function getById(id) {
  return rooms.find((room) => room.id === id);
}

function create(name) {
  const room = { id: randomUUID(), name: name };

  rooms.push(room);

  return room;
}

function rename(id, name) {
  const room = getById(id);

  if (room) {
    room.name = name;
  }

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

export const roomService = {
  getAll,
  getById,
  create,
  rename,
  remove,
};
