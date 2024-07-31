const { Message } = require('../models/message.model.js');
const { ApiError } = require('../exceptions/api.error.js');
const { roomService } = require('./room.service.js');
const { userService } = require('./user.service.js');

class MessageService {
  getMessagesByRoomId = async (roomId) => {
    const messages = await Message.findAll({ where: { roomId } });

    return messages;
  };
  createMessage = async ({ roomId, userId, text }) => {
    const room = await roomService.getRoomById(roomId);
    const userName = await userService.getUserNameById(userId);

    if (!room) {
      throw ApiError.notFound({
        message: 'Room not found',
      });
    }

    if (!userName) {
      throw ApiError.notFound({
        message: 'User not found',
      });
    }

    if (!text) {
      throw ApiError.badRequest({
        message: 'All data are required',
      });
    }

    const message = await Message.create({
      userId,
      text,
      time: new Date(),
      roomId,
      userName,
    });

    return message;
  };
}

const messageService = new MessageService();

module.exports = { messageService };
