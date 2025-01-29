import { EventEmitter } from 'events';
import { messageService } from '../services/message.service.js';

const getMessagesByRoomId = async (req, res) => {
  const { id } = req.params;
  const message = await messageService.findAllMessagesByRoomId(id);

  res.json(message);
};

const emitter = new EventEmitter();

const createNewMessage = async (req, res) => {
  const { text, roomId, userId } = req.body;

  const newMessage = await messageService.createMessage(text, roomId, userId);

  emitter.emit('message', newMessage);
  res.json(newMessage);
};

export const messageController = {
  getMessagesByRoomId,
  emitter,
  createNewMessage,
};
