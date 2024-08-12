import { User, sequelize } from '../models/index.js';
import { ApiError } from '../exceptions/ApiError.js';
import { Room } from '../models/index.js';
import { userService } from './userService.js';

async function getAll(id) {
  return Room.findAll({ include: User });
}

async function getOne(id) {
  return Room.findByPk(id, { include: User });
}

async function create(name, UserId) {
  if (!name.trim()) {
    throw ApiError.BadRequest('Validation error', {
      name: 'Name is empty',
    });
  }

  console.log(UserId);
  const user = await userService.getOne(UserId);

  console.log(user);
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
  return Room.update({ name }, { where: { id }});
}

async function join(id, userId) {
  try {
    const result = await sequelize.transaction(async (t) => {
      const room = await getOne(id);
      const user = await userService.getOne(userId);
      await room.addUser(user);

      return room.id;
    });
    return result;
  } catch (error) {
    console.log(error);
    throw ApiError.UnprocessableEntity({
      error: 'Room or User does not exist'
    });
  }
}

export const remove = (id) => {
  Room.destroy({
    where: {
      id
    }
  });
}

export const roomService = {
  getOne,
  create,
  updateName,
  getAll,
  join,
  remove,
};
