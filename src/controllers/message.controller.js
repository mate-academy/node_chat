const messageService = require('../services/message.service');

const create = async (req, res) => {
  const { author, text, roomId } = req.body;
  const message = await messageService.create(author, text, roomId);

  res.status(201).send(message);
};

const getByRoomId = async (req, res) => {
  const { id } = req.params;
  const roomMessages = await messageService.getByRoomId(id);

  res.send(roomMessages);
};

module.exports = { create, getByRoomId };
