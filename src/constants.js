'use strict';

const MessageType = {
  SET_USERNAME: 'setUsername',
  USERNAME_SET: 'usernameSet',
  SEND_MESSAGE: 'sendMessage',
  MESSAGE: 'message',
  CREATE_ROOM: 'createRoom',
  RENAME_ROOM: 'renameRoom',
  JOIN_ROOM: 'joinRoom',
  DELETE_ROOM: 'deleteRoom',
  ROOMS_UPDATED: 'roomsUpdated',
  ROOM_HISTORY: 'roomHistory',
  ERROR: 'error',
};

const USERNAME_STORAGE_KEY = 'username';

module.exports = { MessageType, USERNAME_STORAGE_KEY };
