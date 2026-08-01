'use strict';

const rooms = new Map();
let nextRoomId = 1;
let nextMessageId = 1;

function all() {
  return rooms;
}

function get(roomId) {
  return rooms.get(roomId);
}

function add(name) {
  const id = nextRoomId++;
  const room = { id, name, messages: [] };

  rooms.set(id, room);

  return room;
}

function remove(roomId) {
  return rooms.delete(roomId);
}

function nextMsgId() {
  return nextMessageId++;
}

module.exports = {
  all,
  get,
  add,
  remove,
  nextMsgId,
};
