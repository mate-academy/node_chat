const { services: messageService } = require('../models/messages.model');
const { sendToRoom } = require('../websocket');

const controller = {
  getAll: async (req, res) => {
    const messages = await messageService.getAll();

    res.send(messages);
  },
  getById: async (req, res) => {
    const message = await messageService.getById(req.params.id);

    res.send(message);
  },
  create: async (req, res) => {
    const message = await messageService.create(req.body);

    sendToRoom(message.roomId, {
      type: 'addMessage',
      payload: message,
    });

    res.send(message);
  },
  delete: async (req, res) => {
    const message = await messageService.delete(req.params.id);

    sendToRoom(message.roomId, {
      type: 'deleteMessage',
      payload: message,
    });

    res.send(message);
  },
  update: async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

    await messageService.update(id, message);

    const updatedMessage = await messageService.getById(id);

    sendToRoom(updatedMessage.roomId, {
      type: 'updateMessage',
      payload: updatedMessage,
    });

    res.send(updatedMessage);
  },
  getAllByRoomId: async (req, res) => {
    const messages = await messageService.getAllByRoomId(req.params.roomId);

    res.send(messages);
  },
};

module.exports = { controller };
