import { EventEmitter } from 'node:events';

import * as roomService from '../services/room.service.js';
import { ApiError } from '../exceptions/api.error.js';

export const emitter = new EventEmitter();

/** @typedef {import('../types/func.type.js').TyFuncController} TyRoomController*/

/** @type {TyRoomController} */
export async function getAll(req, res) {
  const { name } = req.query;

  const rooms = name
    ? await roomService.getByName(name)
    : await roomService.getAll();

  return res
    .status(200)
    .send(rooms.map(roomService.normalize));
}

/** @type {TyRoomController} */
export async function post(req, res) {
  const { name } = req.body;

  if (!name) {
    throw ApiError.BadRequest();
  }

  const rooms = await roomService.getByName(name);

  if (rooms.length) {
    throw ApiError.StatusConflict('Room already exists');
  }

  const newRoom = await roomService.create({ name });

  await emitUpdate();

  return res
    .status(201)
    .send(roomService.normalize(newRoom));
}

/** @type {TyRoomController} */
export async function patch(req, res) {
  const { id } = req.params;
  const { name } = req.body;

  if (!id || !name) {
    throw ApiError.BadRequest();
  }

  const room = await roomService.getById(id);

  if (!room) {
    throw ApiError.NotFound('Room doesn\'t exists');
  }

  room.name = name;
  room.save();

  await emitUpdate();

  res.send(roomService.normalize(room));
}

/** @type {TyRoomController} */
export async function remove(req, res) {
  const { id } = req.params;

  if (!id) {
    throw ApiError.BadRequest();
  }

  const room = await roomService.getById(id);

  if (!room) {
    throw ApiError.NotFound();
  }

  const result = await roomService.remove(room);

  await emitUpdate();

  res.status(200)
    .send(result);
}

async function emitUpdate() {
  emitter.emit(
    'update',
    (await roomService.getAll()).map(roomService.normalize),
  );
}
