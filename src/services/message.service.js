import { Message } from '../models/message.js';
import { emmiter } from '../utils/emmiter.js';

async function createMessage(user, text, roomId) {
  const message = await Message.create({
    text,
    author: user.username,
    time: new Date(),
    userId: user.id,
    roomId,
  });

  emmiter.emit('message', message);
}

export const messageService = {
  createMessage,
};
