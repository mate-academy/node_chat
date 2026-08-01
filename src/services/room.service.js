'use strict';

const store = require('../store.js');

function list() {
  return [...store.all().values()].map(({ id, name }) => ({ id, name }));
}

function get(roomId) {
  return store.get(roomId);
}

function create(name) {
  if (!name || !name.trim()) {
    return null;
  }

  return store.add(name.trim());
}

function rename(roomId, name) {
  if (!name || !name.trim()) {
    return null;
  }

  const room = store.get(roomId);

  if (!room) {
    return null;
  }

  room.name = name.trim();

  return room;
}

function remove(roomId) {
  return store.remove(roomId);
}

module.exports = {
  list,
  get,
  create,
  rename,
  remove,
};
