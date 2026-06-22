import { ApiError } from '../exeptions/api.error.js';
import { roomService } from '../services/room.service.js';

const getAll = async (req, res, next) => {
  const rooms = await roomService.getAllRooms();

  res.status(200).json(rooms);
};

const create = async (req, res, next) => {
  const { name, userId } = req.body;

  if (!name || name.trim() === '') {
    return next(ApiError.badRequest('Room name is required'));
  }

  const newRoom = await roomService.createRoom(name.trim(), userId);

  const io = req.app.get('io');
  io.emit('room_created', newRoom);

  res.status(200).json(newRoom);
};

const rename = async (req, res, next) => {
  const { id } = req.params;
  const { newName } = req.body;

  if (!newName || newName.trim() === '') {
    return next(ApiError.badRequest('New Name is required'));
  }

  const updatedRoom = await roomService.renameRoom(id, newName.trim());

  const io = req.app.get('io');
  io.emit('room_renamed', { roomId: id, newName: updatedRoom.name });

  res.status(200).json(updatedRoom);
};

const remove = async (req, res, next) => {
  const { id } = req.params;

  const result = await roomService.deleteRoom(id);

  const io = req.app.get('io');
  io.emit('room_deleted', { roomId: id });

  io.in(id).disconnectSockets();

  res.status(200).json(result);
};

const join = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return next(ApiError.badRequest('User id is required'));
  }

  const result = await roomService.joinRoom(id, userId);

  res.status(200).json(result);
};

export const roomController = {
  getAll,
  create,
  remove,
  rename,
  join,
};
