import { Message } from '../data/message.js';
import { User } from '../data/user.js';

const findRoomsMessages = async (roomId) => {
  const rawMessages = await Message.findAll({
    where: { roomId },
    include: [{ model: User, attributes: ['name'] }],
    order: [['createdAt', 'ASC']],
  });

  if (!rawMessages || rawMessages.length === 0) {
    return [];
  }

  return rawMessages.map((message) => ({
    author: message.User.name,
    text: message.text,
    time: message.createdAt,
  }));
};

const mergeMessages = async (roomId, targetRoomId) => {
  const messages = await findRoomsMessages(roomId);

  if (!messages || !messages.length) {
    return { moved: 0 };
  }

  for (const msg of messages) {
    msg.roomId = targetRoomId;
    await msg.save();
  }

  return { moved: messages.length, into: targetRoomId };
};

const createMessage = async (roomId, userId, text) => {
  const message = await Message.create({
    text: text.trim(),
    userId,
    roomId,
  });

  const savedMessage = await Message.findByPk(message.id, {
    include: [{ model: User, attributes: ['name'] }],
  });

  return {
    author: savedMessage.User.name,
    text: savedMessage.text,
    time: savedMessage.createdAt,
  };
};

export const messageService = {
  findRoomsMessages,
  mergeMessages,
  createMessage,
};
