import { ApiError } from '../exeptions/api.error.js';
import { Message } from '../models/message.js';
import { messageService } from '../services/message.service.js';
import { userService } from '../services/user.service.js';

const getAllMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const allMessages = await Message.findAll({ where: { roomId } });

    res.send(allMessages);
  } catch (error) {
    next(error);
  }
};

const createMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    const { roomId } = req.params;

    if (!text) {
      throw ApiError.badRequest('Enter the message');
    }

    const user = await userService.getUser(req);

    await messageService.createMessage(user, text, roomId);

    res.status(201).send(text);
  } catch (error) {
    next(error);
  }
};

export const messageController = {
  getAllMessages,
  createMessage,
};
