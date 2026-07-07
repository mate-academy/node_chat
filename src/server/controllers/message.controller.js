const messageService = require('../services/message.service');

const messageController = {
  create: async (req, res) => {
    try {
      const { roomId, authorId, text } = req.body;

      const message = await messageService.create(roomId, authorId, text);

      return res.status(201).json(message);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  },

  getMessages: async (req, res) => {
    const { roomId } = req.params;
    const messages = await messageService.getAllMessage(roomId);

    return res.status(200).json(messages);
  },
};

module.exports = messageController;
