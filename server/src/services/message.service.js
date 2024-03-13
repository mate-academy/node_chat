import { Message as Messages } from '../models/Message.model.js';

/** @param {Object} properties */
export function normalize({
  text,
  author,
  roomId,
  createdAt,
}) {
  return {
    text,
    author,
    roomId,
    createdAt,
  };
}

/** @param {string} roomId */
export function getAllByRoom(roomId) {
  return Messages.findAll({
    where: {
      roomId,
    },
    order: [['createdAt', 'DESC']],
  });
}

/** @param {Object} properties */
export async function create(properties) {
  return Messages.create(
    { ...properties },
    { fields: ['text', 'author', 'roomId'] });
}
