const { roomServices } = require('../services/rooms.service');
const { UsersServices } = require('../services/users.service');

const getAllRooms = async (req, res) => {
  return res.send(await roomServices.getAllRooms());
};

const createRoom = async (req, res) => {
  try {
    const { name, createByUserId } = req.body;

    if (!name || !createByUserId) {
      return res.sendStatus(421);
    }

    const existingUser = await UsersServices.getById(createByUserId);

    if (!existingUser) {
      return res.sendStatus(404);
    }

    const newRoom = await roomServices.create(name, createByUserId);

    res.send(newRoom);
  } catch (error) {
    throw new Error('user not registered');
  }
};

const updateRoom = async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  if (!name) {
    return res.sendStatus(421);
  }

  const existingRoom = await roomServices.getById(id);

  if (!existingRoom) {
    return res.sendStatus(404);
  }

  await roomServices.update(id, name);

  res.send(await roomServices.getById(id));
};

const removeRoom = async (req, res) => {
  const { id } = req.params;

  await roomServices.remove(id);

  res.sendStatus(200);
};

const roomController = {
  getAllRooms,
  updateRoom,
  createRoom,
  removeRoom,
};

module.exports = {
  roomController,
};
