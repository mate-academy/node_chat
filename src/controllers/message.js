import { EventEmitter } from 'events';
import { Message } from '../models/message.js';

async function findAllMessagesByRoomId(roomId) {
  const res = await Message.findAll({ where: { roomId: roomId } });

  return res;
}

const getAllMessagesByRoomId = async (req, res) => {
  const { id } = req.params;
  const messages = await findAllMessagesByRoomId(Number(id));

  res.json(messages);
};

export async function createMessage(author, text, roomId) {
  const newMessage = await Message.create({
    author,
    time: new Date().toISOString(),
    text,
    roomId,
  });

  return newMessage;
}

const emitter = new EventEmitter();

const createNewMessage = async (req, res) => {
  const { author, text, roomId } = req.body;
  const newMessage = await createMessage(author, text, roomId);

  emitter.emit('message', newMessage);
  res.json(newMessage);
};

export const message = {
  emitter,
  getAllMessagesByRoomId,
  createNewMessage,
  createMessage,
};
