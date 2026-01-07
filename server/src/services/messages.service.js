import { Room } from '../models/room.model.js';
import { Message } from '../models/messages.model.js';

const getAllByRoom = async (roomId) => {
  const room = await Room.findByPk(roomId);

  if (!room) return null;

  const messages = await Message.findAll({
    where: { roomId },
    order: [['time', 'ASC']],
  });

  console.log("ALL MESSAGES:", messages);


  return messages;
};

const create = async (roomId, { author, text }) => {
  const room = await Room.findByPk(roomId);
  if (!room) return null;

  const message = await Message.create({
    roomId,
    author,
    text,
  });

  return message;
};

const removeAllByRoom = async (roomId) => {
  const room = await Room.findByPk(roomId);
  if (!room) return null;

  await Message.destroy({ where: { roomId } });
  return room;
};

export const messageService = {
  getAllByRoom,
  create,
  removeAllByRoom,
};
