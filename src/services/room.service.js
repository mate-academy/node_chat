'use strict';

const { Op } = require('sequelize');
const { Room } = require('../models/Room');
const userService = require('./user.service');
const { ApiError } = require('../exceptions/ApiError');

const normalize = ({ id, name, adminId }) => {
  return { id, name, adminId };
};

const getByName = (name) => {
  return Room.findOne({ where: { name } });
};

const getById = (roomId) => {
  return Room.findByPk(roomId);
};

const getAll = () => {
  return Room.findAll();
};

const getAllByUser = async (userId) => {
  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.NotFound('User does not exist');
  }

  const userRooms = await user.getRooms({
    order: [['updatedAt', 'DESC']],
  });

  return userRooms;
};

const getAllNotByUser = async (userId) => {
  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.NotFound('User does not exist');
  }

  const userRooms = await user.getRooms({
    attributes: ['id'],
  });

  const notUserRooms = await Room.findAll({
    where: {
      id: {
        [Op.notIn]: userRooms.map((room) => room.id),
      },
    },
    order: [['updatedAt', 'DESC']],
  });

  return notUserRooms;
};

const addUserToRoom = async ({ userId, roomId }) => {
  const user = await userService.getById(userId);
  const room = await getById(roomId);

  if (!user || !room) {
    throw ApiError.NotFound('User or room not found');
  }

  await room.addUser(user, { through: { role: 'user' } });
};

const getRoomUsers = async (roomId) => {
  const room = await getById(roomId);

  if (!room) {
    throw ApiError.NotFound('Room not found');
  }

  return room.getUsers();
};

const add = async ({ name, userId }) => {
  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const isExistingRoom = await getByName(name);

  if (isExistingRoom) {
    throw ApiError.BadRequest('Room with such name already exists');
  }

  const room = await Room.create({ name, adminId: userId });

  await room.addUser(user, { through: { role: 'admin' } });

  return room;
};

const rename = async ({ roomId, name }) => {
  const room = await getById(roomId);

  if (!room) {
    throw ApiError.NotFound('Room is not found');
  }

  const isExistingRoom = await getByName(name);

  if (isExistingRoom) {
    throw ApiError.BadRequest('Room with such name already exists');
  }

  room.name = name;
  await room.save();
};

const remove = async (roomId) => {
  const room = await getById(roomId);

  if (!room) {
    throw ApiError.NotFound('Room is not found');
  }

  await Room.destroy({ where: { id: roomId } });
};

const leaveRoom = async ({ userId, roomId }) => {
  const user = await userService.getById(userId);
  const room = await getById(roomId);

  if (!user || !room) {
    throw ApiError.NotFound('User or room not found');
  }

  if (!(await room.hasUser(user))) {
    throw ApiError.BadRequest('User has not joined the room');
  }

  await room.removeUser(user);
};

module.exports = {
  normalize,
  getById,
  getByName,
  getAll,
  getAllByUser,
  getAllNotByUser,
  addUserToRoom,
  getRoomUsers,
  add,
  rename,
  remove,
  leaveRoom,
};
