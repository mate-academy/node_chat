import { Message } from '../models/Message.js';
import { User } from '../models/User.js';

const create = ({ message, roomId, userId }) => {
  return Message.create({
    text: message,
    roomId,
    chatuserId: userId,
  });
};

const getAll = (roomId) => {
  return Message.findAll({
    where: { roomId },
    include: [User],
    order: [['createdAt', 'ASC']],
  });
};

export default {
  create,
  getAll,
};
