import { ApiError } from '../exeptions/api.error.js';
import { messageService } from '../services/message.service.js';

const getByRoom = async (req, res, next) => {
  const { roomId } = req.params;

  const messages = await messageService.getRoomMessages(roomId);

  res.status(200).json(messages);
};

const create = async (req, res, next) => {
  const { roomId } = req.params;
  const { text, userId } = req.body;

  if (!text || text.trim() === '') {
    return next(ApiError.badRequest('The message text cannot be empty'));
  }

  if (!userId) {
    return next(ApiError.badRequest('User id is required'));
  }

  const newMessage = await messageService.createMessage(
    text.trim(),
    userId,
    roomId,
  );

  res.status(201).json(newMessage);
};

export const messageController = {
  getByRoom,
  create,
};
