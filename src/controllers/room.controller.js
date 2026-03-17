const { roomService } = require('../services/room.service.js');

const getById = async (req, res) => {
  const { id } = req.params;

  const room = await roomService.getOne(id);

  if (!room) {
    return res.status(404).send({ message: 'Room not found' });
  }

  res.send(room);
};

const renameRoom = async (req, res) => {
  const { roomId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(404).send({ message: 'No name was provided' });
  }

  const room = await roomService.update(roomId, name);

  res.send(room);
};

const createRoom = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(404).send({ message: 'No name was provided' });
  }

  await roomService.create(name);

  res.sendStatus(201);
};

const deleteRoom = async (req, res) => {
  const { id } = req.params;

  const room = await roomService.getOne(id);

  if (!room) {
    return res.status(404).send({ message: 'Room not found' });
  }

  await roomService.remove(id);

  res.sendStatus(204);
};

const roomController = {
  getById,
  renameRoom,
  createRoom,
  deleteRoom,
};

module.exports = {
  roomController,
};
