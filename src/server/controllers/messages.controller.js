import { usersRepository } from '../entity/users.repository.js';
import { ApiError } from '../exeptions/api.error.js';
import { roomsRepository } from '../entity/rooms.repository.js';
import { messagesRepository } from '../entity/messages.repository.js';
import { messageEmitter } from '../app.js';

const createMessage = async (req, res) => {
  let { roomId } = req.params;

  roomId = Array.isArray(roomId) ? roomId[0] : roomId;

  const room = await roomsRepository.getById(roomId);

  if (!room) {
    throw ApiError.notFound();
  }

  const { userId, text } = req.body;

  const user = await usersRepository.getById(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  if (text.length < 1) {
    throw ApiError.badRequest('There is no message text');
  }

  const message = await messagesRepository.create(userId, text, roomId);

  messageEmitter.emit('message', message);

  res.sendStatus(204);
};

export const messagesController = {
  createMessage,
};
