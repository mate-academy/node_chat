'use strict';

function normalizeRoomName(value) {
  return String(value || '')
    .trim()
    .replace(/^#+/, '')
    .trim();
}

function getRoomKey(name) {
  return name.toLowerCase();
}

function getUsernameKey(username) {
  return username.toLowerCase();
}

module.exports = {
  normalizeRoomName,
  getRoomKey,
  getUsernameKey,
};
