import { EventEmitter } from 'events';
import { messageService } from '../services/message.service.js';

export const messageEmitter = new EventEmitter();

const create = async (req, res) => {
  const { roomId } = req.params;
  const { text, userId } = req.body;

  if (!roomId || !userId || !text) {
    return res.sendStatus(404);
  }

  const newMessage = await messageService.createMessageInRoom(
    text,
    userId,
    roomId,
  );

  messageEmitter.emit('message', newMessage);

  res.status(201).json(newMessage);
};

export const getMessages = async (req, res) => {
  const { roomId } = req.params;
  const messages = await messageService.getAllMessagesInRoom(roomId);

  res.status(200).json(messages);
};

export const messageController = {
  create,
  getMessages,
};
