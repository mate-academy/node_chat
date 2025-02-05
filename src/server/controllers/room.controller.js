const roomService = require('../services/room.service.js');

const get = async (req, res) => {
  const rooms = await roomService.getRooms();

  res.send(rooms);
};

const create = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.sendStatus(400);

    return;
  }

  const newRoom = await roomService.addRoom(name);

  return res.status(201).json(newRoom);
};

const getOne = async (req, res) => {
  const { id } = req.params;

  const room = await roomService.getRoom(id);

  if (!room) {
    res.sendStatus(404);

    return;
  }

  res.send(room);
};

const remove = async (req, res) => {
  const { id } = req.params;

  const room = await roomService.getRoom(id);

  if (!room) {
    res.sendStatus(404);

    return;
  }

  await roomService.deleteRoom(id);

  res.sendStatus(204);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const room = await roomService.getRoom(id);

  if (!room) {
    res.sendStatus(404);

    return;
  }

  if (!name) {
    res.sendStatus(400);

    return;
  }

  const updatedRoom = await roomService.updateRoom(id, name);

  res.send(updatedRoom);
};

module.exports = {
  roomController: {
    get,
    create,
    getOne,
    update,
    remove,
  },
};
