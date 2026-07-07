const mongoose = require('mongoose');
const { Message } = require('../models');

const messageService = {
  create: async (roomId, authorId, text) => {
    const message = await Message.create({
      roomId: roomId,
      authorId: authorId,
      text: text,
    });

    if (!message) {
      throw new Error('Mistake during message');
    }

    return message;
  },

  getAllMessage: async (roomId) => {
    // Базовий пошук за рядком
    const query = {
      $or: [{ roomId: roomId }],
    };

    if (mongoose.Types.ObjectId.isValid(roomId)) {
      query.$or.push({ roomId: new mongoose.Types.ObjectId(roomId) });
    }

    const messages = await Message.find(query).populate('authorId', 'name');

    return messages;
  },
};

module.exports = messageService;
