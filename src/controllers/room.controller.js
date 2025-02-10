/* eslint-disable no-console */
const roomService = require('../services/room.service');

const create = async (req, res) => {
  const { title, description, userId } = req.body;

  if (!title || !userId) {
    res.sendStatus(404);

    return;
  }

  await roomService.createRoom(title, userId, description);

  res.sendStatus(201);
};

const getAllRooms = async (req, res) => {
  const rooms = await roomService.getAllRooms();

  res.statusCode = 200;
  res.send(rooms.map((room) => roomService.normalize(room)));
};

const update = async (req, res) => {
  const roomId = req.params.roomId;

  const { title, description } = req.body;

  if ((!title && !description) || !roomId) {
    res.sendStatus(404);

    return;
  }

  await roomService.updateRoom(roomId, title, description);

  res.sendStatus(204);
};

const remove = async (req, res) => {
  const roomId = req.params.roomId;

  if (!roomId) {
    res.sendStatus(404);

    return;
  }

  await roomService.removeRoom(roomId);

  res.sendStatus(204);
};

module.exports = {
  create,
  getAllRooms,
  update,
  remove,
};
