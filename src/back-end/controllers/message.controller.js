import { messagesService } from '../services/messages.service.js';
import { EventEmitter } from 'events';

export const messageEmitter = new EventEmitter();

const findAllMessages = async (req, res) => {
  const { roomId } = req.params;
  const messages = await messagesService.findMessages(roomId);

  res.status(201).send(messages);
};

const createMessage = async (req, res) => {
  const { roomId } = req.params;
  const { userId, text } = req.body;

  if (!roomId || !userId || !text) {
    return res.sendStatus(401);
  }

  const newMessage = await messagesService.createNewMessage(
    roomId,
    userId,
    text,
  );

  messageEmitter.emit('message', newMessage);

  res.status(200).send(newMessage);
};

export const messagesController = {
  findAllMessages,
  createMessage,
};
