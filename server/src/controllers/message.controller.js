import { EventEmitter } from 'node:events';

import * as roomService from '../services/room.service.js';
import * as messageService from '../services/message.service.js';
import { ApiError } from '../exceptions/api.error.js';

export const emitter = new EventEmitter();

/** @typedef {import('../types/func.type.js').TyFuncController} TyMessageController*/
/** @typedef {import('../types/message.type.js').Message} Message*/

/** @type {TyMessageController} */
export async function getAllByRoom(req, res) {
  const { roomId } = req.params;

  if (!roomId) {
    throw ApiError.BadRequest();
  }

  const messages = await messageService.getAllByRoom(roomId);

  if (!messages.length) {
    throw ApiError.NotFound();
  }

  res.status(200)
    .send(messages.map(messageService.normalize));
}

/** @type {TyMessageController} */
export async function post(req, res) {
  const { author, text, roomId } = req.body;

  if (!author || !text || !roomId) {
    throw ApiError.BadRequest();
  }

  console.info(`
  mark-1
  ${author}
  ${text}
  ${roomId}
  `);

  const room = await roomService.getById(roomId);

  if (!room) {
    throw ApiError.NotFound();
  }

  const newMessage = await messageService.create({
    text,
    author,
    roomId: room.id,
  });

  emitter.emit('create', newMessage.dataValues);

  res.status(201)
    .send(messageService.normalize(newMessage));
}
