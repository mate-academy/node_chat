const MessageService = require('../services/Message.service.js');
const { tryCatch } = require('../utils.js');
const getAllByRoomId = tryCatch(async (req, res) => {
  const roomId = req.params.id;
  const filteredMessages = await MessageService.getAllByRoomId(roomId);

  res.status(200).send(filteredMessages);
});

module.exports = { getAllByRoomId };
