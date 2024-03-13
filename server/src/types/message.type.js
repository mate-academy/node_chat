import { } from './func.type.js';

/**
 * @typedef {Object} Message
 * @property {String} roomId
 * @property {String} text
 * @property {String} author
 * @property {Date} createdAt
*/

/**
 * @typedef {Object} MessageClient
 * @property {MessageAction} action
 * @property {any} payload
*/

/** @enum {String} */
export const MessageAction = {
  CREATE_MESSAGE: 'CREATE_MESSAGE',
  CREATE_ROOM: 'CREATE_ROOM',
  DELETE_ROOM: 'DELETE_ROOM',
  RENAME_ROOM: 'RENAME_ROOM',
  UPDATE_ROOMS: 'UPDATE_ROOMS',
  ENTER_THE_ROOM: 'ENTER_THE_ROOM',
  LEAVE_THE_ROOM: 'LEAVE_THE_ROOM',
};
