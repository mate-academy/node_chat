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
  const { name, description } = req.body;

  await createRoom({ name, description });
  res.send('Room created');
};

const renameRoom = async (req, res) => {
  const { id } = req.params; // Extract id from req.params
  const { name, description } = req.body;

  await changeRoom(id, { name, description });
  res.send('Room updated');
};

const deleteRoom = async (req, res) => {
  const { id } = req.params; // Extract id from req.params

  await removeRoom(id); // Pass the id from params
  res.send('Room deleted');
};

module.exports = {
  getRooms,
  addRoom,
  renameRoom,
  deleteRoom,
};
