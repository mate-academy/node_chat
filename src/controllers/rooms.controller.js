'use strict';

const roomService = require('../services/room.service');
const messageService = require('../services/message.service');
const userService = require('../services/user.service');
const { ApiError } = require('../exceptions/ApiError');

const create = async (req, res) => {
  const { name, userId } = req.body;

  if (typeof name !== 'string' || typeof userId !== 'string') {
    throw ApiError.BadRequest('Invalid request');
  }

  const newRoom = await roomService.add({ name, userId });

  res.status(201).send(roomService.normalize(newRoom));
};

const rename = async (req, res) => {
  const { name } = req.body;
  const { roomId } = req.params;

  if (!roomId || typeof name !== 'string') {
    throw ApiError.BadRequest('Invalid request');
  }

  await roomService.rename({ roomId, name });

  const updatedRoom = await roomService.getById(roomId);

  res.send(roomService.normalize(updatedRoom));
};

const remove = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    throw ApiError.BadRequest('Invalid request');
  }

  await messageService.deleteAllByRoom(roomId);
  await roomService.remove(roomId);

  res.sendStatus(204);
};

const getRoomUsers = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    throw ApiError.BadRequest('Invalid request');
  }

  const roomUsers = await roomService.getRoomUsers(roomId);

  res.send(roomUsers.map((user) => userService.normalize(user)));
};

const join = async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;

  if (!roomId || typeof userId !== 'string') {
    throw ApiError.BadRequest('Invalid request');
  }

  await roomService.addUserToRoom({ userId, roomId });

  res.sendStatus(204);
};

const leave = async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;

  if (!roomId || typeof userId !== 'string') {
    throw ApiError.BadRequest('Invalid request');
  }

  await roomService.leaveRoom({ userId, roomId });

  res.sendStatus(204);
};

const getUserRooms = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw ApiError.BadRequest('Invalid request');
  }

  const userRooms = await roomService.getAllByUser(userId);

  res.send(userRooms.map((room) => roomService.normalize(room)));
};

const getAvailableRooms = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw ApiError.BadRequest('Invalid request');
  }

  const availableRooms = await roomService.getAllNotByUser(userId);

  res.send(availableRooms.map((room) => roomService.normalize(room)));
};

module.exports = {
  create,
  rename,
  remove,
  getRoomUsers,
  join,
  leave,
  getUserRooms,
  getAvailableRooms,
};
