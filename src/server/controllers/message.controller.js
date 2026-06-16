import { EventEmitter } from 'events';
import { messageService } from '../services/message.service.js';

const messageEmitter = new EventEmitter();

const createMessage = async (req, res) => {
  const { roomId } = req.params;
  const { text, userName } = req.body;

  if (!text || !userName || !roomId) {
    return res.status(400);
  }

  const newMessage = await messageService.createMessage({
    roomId,
    text,
    userName,
  });

  messageEmitter.emit('message', newMessage);

  return res.status(201).json(newMessage);
};

const getMessages = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(400).json({ error: 'roomId is required' });
  }

  const messages = await messageService.getMessages(roomId);

  return res.status(200).json(messages);
};

export const messageController = {
  createMessage,
  getMessages,
};

export { messageEmitter };
