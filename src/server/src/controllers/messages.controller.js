import { emitter } from '../index.js';
import { messagesService } from '../services/messages.service.js';
import { v4 as uuidV4 } from 'uuid';

const create = async (req, res) => {
  const { text, userName, type, room } = req.body;

  const message = {
    text,
    userName,
    type,
    room,
    id: uuidV4(),
  };

  messagesService.updateMessage(message);

  emitter.emit('message', message);
};

export const messagesController = {
  create,
};
