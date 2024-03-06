import { EventEmitter } from 'node:events';
import { Room as Rooms } from '../models/Room.model.js';

export const emitter = new EventEmitter();

/** @typedef {import('../types/room.type.js').Room} Room*/

/** @param {Object} properties */
export function normalize({
  id,
  name,
}) {
  return {
    id,
    name,
  };
}

export function getAll() {
  return Rooms.findAll({
    order: [['createdAt', 'DESC']],
  });
}

/** @param {string} id */
export function getById(id) {
  return Rooms.findOne({
    where: { id },
  });
}

/** @param {string} name */
export function getByName(name) {
  return Rooms.findAll({
    where: { name },
    order: [['createdAt', 'DESC']],
  });
}

/** @param {Object} properties */
export async function create(properties) {
  return Rooms.create(
    { ...properties },
    { fields: ['name'] }).catch(err => console.info(err));
}

/** @param {import('sequelize').Model} room */
export function remove(room) {
  return room.destroy({ cascade: true });
}
