import { ApiError } from '../exceptions/ApiError.js';
import { Message, User } from '../models/index.model.js';
import { userService } from './user.service.js';
import { roomService } from './room.service.js';

const getAll = (id) => {
  return Message.findAll({
    where: { roomId: id },
    include: User,
  });
};

const getOne = (id) => {
  return Message.findByPk(id, {
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
      room: 'Room not found',
    });
  }

  if (!text.trim()) {
    throw ApiError.BadRequest('Validation error', {
      text: 'Text is empty',
    });
  }

  const newMessage = await Message.create({
    text,
    UserId,
    RoomId,
  });

  return getOne(newMessage.id);
}

export const messageService = {
  create,
  getAll,
  getOne,
};
