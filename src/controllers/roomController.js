import { ApiError } from '../exceptions/api.error.js';
import { Room, UserRoom } from '../models/index.js';
import { roomService } from '../services/room.service.js';
import { userRoomService } from '../services/userRoom.service.js';

const create = async (req, res) => {
  const { name } = req.body;
  const ownerId = req.user.id;

  const room = await Room.findOne({ where: { name } });

  if (room) {
    throw ApiError.badRequest({ message: 'This name is already taken' });
  }

  const newRoom = await roomService.createRoom(name, ownerId);

  await userRoomService.createUserRoom(newRoom.id, ownerId);

  res.status(201).json({ room: newRoom });
};

const remove = async (req, res) => {
  const roomId = req.query.roomId;
  const id = Number(roomId);

  if (isNaN(id)) {
    throw new ApiError.badRequest('Invalid roomId');
  }

  const room = await roomService.findRoomById(id);

  if (!room) {
    throw ApiError.notFound('Room not found');
  }

  await roomService.removeRoom(id);

  res.sendStatus(204);
}

const edit = async (req, res) => {
  const { roomId } = req.query;
  const name = req.body.name;
  const id = Number(roomId);

  if (isNaN(id)) {
    throw new ApiError.badRequest('Invalid roomId');
  }

  if (!name) {
    throw new ApiError.badRequest('Invalid room name');
  }

  const room = await roomService.findRoomById(id);

  if (!room) {
    throw ApiError.notFound('Room not found');
  }

  const newRoom = await roomService.editRoom(id, name);

  res.status(200).json(newRoom);
}

const get = async (req, res) => {
  const allRooms = await roomService.getAllRooms();

  res.status(200).json(allRooms);
};

const getUserRooms = async (req, res) => {
  const { roomId } = req.query;

  const id = Number(roomId);

  if (isNaN(id)) {
    throw new ApiError.badRequest('Invalid roomId');
  }

  const userRooms = await UserRoom.findAll({ where: { roomId: id } });

  res.status(200).json(userRooms);
};

const join = async (req, res) => {
  const userId = req.user.id;
  const name = req.body.name;
  const room = await roomService.findRoomByName(name);

  if (!room) {
    throw ApiError.badRequest({
      room: 'Room you want to join does not exist',
    });
  }

  const existing = await UserRoom.findOne({
    where: { userId, roomId: room.id },
  });

  if (existing) {
    throw ApiError.badRequest({ room: 'You are already in this room' });
  }

  await userRoomService.createUserRoom(room.id, userId);

  res.status(200).json({ message: 'You have successfully joined the room' });
};

export const roomController = {
  create,
  remove,
  get,
  getUserRooms,
  join,
  edit,
};
