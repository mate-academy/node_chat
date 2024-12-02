const RoomService = require('../services/Room.service.js');
const { tryCatch } = require('../utils.js');

const getAll = tryCatch(async (req, res) => {
  const rooms = await RoomService.getAll();

  res.status(200).send(rooms);
});

module.exports = { getAll };
