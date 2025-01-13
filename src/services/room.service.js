import { User, sequelize, Room } from '../models/index.model.js';
import { ApiError } from '../exceptions/ApiError.js';
import { userService } from './user.service.js';

async function getAll() {
  return Room.findAll({ include: User });
}

async function getOne(id) {
  const room = await Room.findByPk(id, { include: User });

  if (!room) {
    throw ApiError.NotFound();
  }

  return room;
}

async function create(name, UserId) {
  if (!name.trim()) {
    throw ApiError.BadRequest('Validation error', {
      name: 'Name is empty',
    });
  }

  const user = await userService.getOne(UserId);

  if (!user) {
    throw ApiError.BadRequest('Validation error', {
      user: 'User not found',
    });
  }

  const newRoom = await Room.create({
    name,
    UserId,
  });

  return getOne(newRoom.id);
}

async function updateName(id, name) {
  const [updated] = await Room.update({ name }, { where: { id } });

  if (!updated) {
    throw ApiError.NotFound();
  }

  return getOne(id);
}

async function join(id, userId) {
  const room = await getOne(id);
  const user = await userService.getOne(userId);

  if (!room || !user) {
    throw ApiError.UnprocessableEntity({
      error: !room ? 'Room does not exist' : 'User does not exist',
    });
  }

  await sequelize.transaction(async (t) => {
    await room.addUser(user, { transaction: t });
  });

  return room.id;
}

export const remove = async (id) => {
  const room = await getOne(id);

  if (!room) {
    throw ApiError.NotFound();
  }

  await Room.destroy({ where: { id } });

  return { message: 'Room removed successfully' };
};

export const roomService = {
  getOne,
  create,
  updateName,
  getAll,
  join,
  remove,
};
