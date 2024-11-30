import { ApiError } from '../exceptions/ApiError.js';
import { Room } from '../models/room.js';

function create(name) {
  if (!name) {
    throw new ApiError.badRequest('Name is required');
  }

  return Room.create({ name });
}

function join(id) {
  return Room.findByPk(id);
}

async function remove(id) {
  if (!id) {
    throw new ApiError.badRequest('Id is required');
  }

  const room = await join(id);

  if (!room) {
    throw new ApiError.notFound();
  }

  return Room.destroy({ where: { id } });
}

async function rename(id, newName) {
  if (!id) {
    throw new ApiError.badRequest('Id is required');
  }

  if (!newName) {
    throw new ApiError.badRequest('Name is required');
  }

  const room = await join(id);

  if (!room) {
    throw new ApiError.notFound();
  }

  room.name = newName;
  room.save();

  return room;
}

export const roomService = {
  create,
  join,
  remove,
  rename,
}
