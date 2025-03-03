import { ApiError } from '../exeptions/api.error.js';
import { Room } from '../models/room.js';

async function findById(roomId) {
  const room = await Room.findByPk(roomId);

  if (!room) {
    throw ApiError.notFound({ message: `Room with id ${roomId} not found` });
  }

  return room;
}

async function create(title, description, userId) {
  await Room.create({ title, description, userId });
}

function getAllRooms() {
  return Room.findAll();
}

function normalize({ id, title, description, userId }) {
  return { id, title, description, userId };
}

async function update(roomId, title, description) {
  const room = await findById(roomId);

  if (title) {
    room.title = title;
  }

  if (description) {
    room.description = description;
  }

  await room.save();
}

async function remove(roomId) {
  await findById(roomId);

  await Room.destroy({ where: { id: roomId } });
}

export const roomService = {
  create,
  getAllRooms,
  normalize,
  update,
  remove,
  findById,
};
