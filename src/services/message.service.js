'use strict';

const store = require('../store.js');

function add(roomId, { author, text }) {
  const room = store.get(roomId);

  if (!room || !author || !text || !text.trim()) {
    return null;
  }

  const message = {
    id: store.nextMsgId(),
    author,
    text: text.trim(),
    time: new Date().toISOString(),
  };

  room.messages.push(message);

  return message;
}

function history(roomId) {
  const room = store.get(roomId);

  return room ? room.messages : [];
}

module.exports = {
  add,
  history,
};
