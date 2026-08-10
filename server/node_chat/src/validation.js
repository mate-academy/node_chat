'use strict';

const MAX_USERNAME_LENGTH = 20;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_ROOM_NAME_LENGTH = 40;

function validateUsername(username, existingUsernames) {
  if (typeof username !== 'string' || username.trim().length === 0) {
    return 'Username cannot be empty';
  }

  if (username.length > MAX_USERNAME_LENGTH) {
    return `Username must be under ${MAX_USERNAME_LENGTH} characters`;
  }

  if (existingUsernames.includes(username)) {
    return 'This username is already taken';
  }

  return null;
}

function validateMessageText(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return 'Message cannot be empty';
  }

  if (text.length > MAX_MESSAGE_LENGTH) {
    return `Message must be under ${MAX_MESSAGE_LENGTH} characters`;
  }

  return null;
}

function validateRoomName(name) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    return 'Room name cannot be empty';
  }

  if (name.length > MAX_ROOM_NAME_LENGTH) {
    return `Room name must be under ${MAX_ROOM_NAME_LENGTH} characters`;
  }

  return null;
}

module.exports = { validateUsername, validateMessageText, validateRoomName };
