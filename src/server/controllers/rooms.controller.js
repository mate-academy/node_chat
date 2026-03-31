import { roomsRepository } from '../entity/rooms.repository.js';
import { ApiError } from '../exeptions/api.error.js';
import { validateRoomname } from '../../utils/validators.js';
import { usersRepository } from '../entity/users.repository.js';
import { messageEmitter } from '../app.js';

const createRoom = async (req, res) => {
  const { name, userId } = req.body;

  const error = validateRoomname(name);

  if (error) {
    throw ApiError.badRequest(error);
  }

  const createdRoom = await roomsRepository.create(name, userId);

  messageEmitter.emit('rooms_updated');
  messageEmitter.emit('room_updated', createdRoom);
  res.json(createdRoom);
};

const joinToRoom = async (req, res) => {
  let { id } = req.params;

  id = Array.isArray(id) ? id[0] : id;

  const room = await roomsRepository.getById(id);

  if (!room) {
    throw ApiError.notFound();
  }

  const { userId } = req.body;

  const user = await usersRepository.getById(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  if (room.users.some((u) => u.id === user.id)) {
    throw ApiError.badRequest('You are already joined to this room');
  }

  const addedRoom = await roomsRepository.addUser(id, userId);

  messageEmitter.emit('rooms_updated');
  messageEmitter.emit('room_updated', addedRoom);
  res.json(addedRoom);
};

const leaveTheRoom = async (req, res) => {
  let { id } = req.params;

  id = Array.isArray(id) ? id[0] : id;

  const room = await roomsRepository.getById(id);

  if (!room) {
    throw ApiError.notFound();
  }

  const { userId } = req.body;

  const user = await usersRepository.getById(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  if (!room.users.some((u) => u.id === user.id)) {
    throw ApiError.badRequest('You are not connected to this room');
  }

  const leavedRoom = await roomsRepository.removeUser(id, userId);

  if (leavedRoom.users.length === 0) {
    await roomsRepository.deleteOne(leavedRoom.id);
  }

  messageEmitter.emit('rooms_updated');
  messageEmitter.emit('room_leaved', { roomId: leavedRoom.id, userId });
  res.sendStatus(204);
};

const getAllRooms = async (req, res) => {
  let { userId } = req.params;

  userId = Array.isArray(userId) ? userId[0] : userId;

  const user = await usersRepository.getById(+userId);

  if (!user) {
    throw ApiError.notFound();
  }

  const rooms = await roomsRepository.getAllByUserId(+userId);

  res.json(rooms);
};

const getRoom = async (req, res) => {
  let { id } = req.params;

  id = Array.isArray(id) ? id[0] : id;

  const room = await roomsRepository.getById(id);

  if (!room) {
    throw ApiError.notFound();
  }

  res.json(room);
};

const deleteRoom = async (req, res) => {
  let { id } = req.params;

  id = Array.isArray(id) ? id[0] : id;

  const room = await roomsRepository.getById(id);

  if (!room) {
    throw ApiError.notFound();
  }

  const deletedRoom = await roomsRepository.deleteOne(id);

  messageEmitter.emit('rooms_updated');
  messageEmitter.emit('room_deleted', { id: deletedRoom.id });
  res.sendStatus(204);
};

const renameRoom = async (req, res) => {
  let { id } = req.params;

  id = Array.isArray(id) ? id[0] : id;

  const room = await roomsRepository.getById(id);

  if (!room) {
    throw ApiError.notFound();
  }

  const { name } = req.body;

  const error = validateRoomname(name);

  if (error) {
    throw ApiError.badRequest(error);
  }

  const renamedRoom = await roomsRepository.renamed(id, name);

  messageEmitter.emit('rooms_updated');
  messageEmitter.emit('room_updated', renamedRoom);
  res.json(renamedRoom);
};

export const roomsController = {
  createRoom,
  joinToRoom,
  getAllRooms,
  getRoom,
  deleteRoom,
  renameRoom,
  leaveTheRoom,
};
