import { Room } from '../models/Room.model.js';
import { ApiError } from '../exeptions/api.error.js';

async function getByName(name) {
  return await Room.findOne({
    where: {
      name,
    },
  });
}

export async function getById(id) {
  return await Room.findByPk(id);
}

export async function getAllRooms() {
  return await Room.findAll({
    order: [['createdAt', 'ASC']],
  });
}

export async function create(name) {
  const existedRoom = await getByName(name);

  if (existedRoom) {
    throw ApiError.badRequest('Room with this name already exists');
  }

  return await Room.create({ name });
}

export async function rename({ id, newName }) {
  const room = await getById(id);
  if (!room) {
    throw ApiError.notFound();
  }

  if (room.name === newName) {
    throw ApiError.badRequest(
      'newName must be different from the current name',
    );
  }

  const isNameTaken = await getByName(newName);
  if (isNameTaken) {
    throw ApiError.badRequest('Room with this name already exists');
  }

  await room.update({ name: newName });
  return room;
}

export async function remove(id) {
  const deletedCount = await Room.destroy({
    where: { id },
  });

  if (deletedCount === 0) {
    throw ApiError.notFound();
  }
}

export const roomService = {
  getById,
  getAllRooms,
  create,
  rename,
  remove,
};
