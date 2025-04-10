import { EventEmitter } from 'events';
import * as messageService from '../services/message.service.js';

export const messageEmitter = new EventEmitter();

export const create = async (req, res) => {
  const { roomId } = req.params;
  const { text, userId } = req.body;

  if (!roomId || !userId || !text) {
    res.sendStatus(404);

    return;
  }

  const newMessage = await messageService.createMessage(text, userId, roomId);

  messageEmitter.emit('message', newMessage);

  res.status(201).json(newMessage);
};

export const getMessages = async (req, res) => {
  const { roomId } = req.params;
  const messages = await messageService.getMessagesInRoom(roomId);

  res.status(200).json(messages);
};
