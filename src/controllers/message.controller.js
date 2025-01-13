import { messageService } from '../services/message.service.js';
import { ApiError } from '../exeptions/api.error.js';
import {
  validateAuthor,
  validateId,
  validateText,
} from '../utils/validation.js';

const addMessage = async (req, res) => {
  const { author, text, roomId } = req.body;

  const errors = {
    author: validateAuthor(author),
    text: validateText(text),
    roomId: validateId(roomId),
  };

  if (errors.author || errors.text || errors.roomId) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const message = await messageService.addMessage(author, text, roomId);

  res.statusCode = 201;
  res.send(message);
};

const getMessages = async (req, res) => {
  const { roomId } = req.params;

  const errors = {
    roomId: validateId(roomId),
  };

  if (errors.roomId) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const messages = await messageService.getMessages(roomId);
  res.statusCode = 200;
  res.send(messages);
};

export const messageController = {
  addMessage,
  getMessages,
};
