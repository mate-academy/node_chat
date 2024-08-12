import { ApiError } from '../exceptions/ApiError.js';
import { Message, User } from '../models/index.js';
import { userService } from './userService.js';
import { roomService } from './roomService.js';

const getAll = async (id) => {
  return await Message.findAll({
    where: { RoomId: id },
    include: User,
  });
};

const getOne = async (id) => {
  return await Message.findByPk(id, {
    include: User,
  });
};

async function create(UserId, text, RoomId) {
  const user = await userService.getOne(UserId);

  if (!user) {
    throw ApiError.BadRequest('Validation error', {
      user: 'User not found',
    });
  }

  const room = await roomService.getOne(RoomId);

  if (!room) {
    throw ApiError.BadRequest('Validation error', {
      user: 'User not found',
    });
  }

  if (!text.trim()) {
    throw ApiError.BadRequest('Validation error', {
      text: 'Text is empty',
    });
  }

  const newMessega = await Message.create({
    text,
    UserId,
    RoomId,
  });

  return getOne(newMessega.id);
}

export const messageService = {
  create,
  getAll,
};

