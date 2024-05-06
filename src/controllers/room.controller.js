/* eslint-disable no-console */
const roomService = require('../services/room.service.js');
// const jwtService = require('../services/jwt.service.js');
// const { ApiError } = require('../exceptions/api.error.js');
// const validator = require('../utils/validation.js');
// const bcrypt = require('bcrypt');
// const emailService = require('../services/email.service.js');

const getRooms = async (req, res) => {
  const rooms = await roomService.getAllRooms();

  res.send(rooms);
};

const getRoomById = async (req, res) => {
  const { id } = req.params;

  const room = await roomService.getRoomById(id);

  res.send(room);
};

const create = async (req, res) => {
  const { userId, name } = req.body;

  const newRoom = await roomService.createRoom({ userId, name });

  res.send(newRoom);
};

const deleteRoom = async (req, res) => {
  const { id } = req.body;

  await roomService.deleteRoom(id);

  res.sendStatus(204);
};

const edit = async (req, res) => {
  const { id, newName } = req.body;

  const room = await roomService.updateRoom({ id, name: newName });

  res.send(room);
};

module.exports = {
  getRooms,
  getRoomById,
  create,
  deleteRoom,
  edit,
};
