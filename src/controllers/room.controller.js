const {
  getAllRooms,
  createRoom,
  changeRoom,
  removeRoom,
} = require('../services/room.service');

const getRooms = async (req, res) => {
  const rooms = await getAllRooms();

  res.send(rooms);
};

const addRoom = async (req, res) => {
  const { name } = req.body;

  await createRoom(name);

  res.send('Room created');
};

const renameRoom = async (req, res) => {
  const { id, name } = req.body;

  await changeRoom(id, name);

  res.send('Name changed');
};

const deleteRoom = async (req, res) => {
  const { id } = req.body;

  await removeRoom(id);

  res.send('Room deleted');
};

module.exports = {
  getRooms,
  addRoom,
  renameRoom,
  deleteRoom,
};
