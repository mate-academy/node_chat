import { ApiError } from '../exceptions/api.error.js';
import { roomService } from '../services/room.service.js';
import { messageController } from './message.controller.js';

const getAllRooms = async (req, res) => {
  const rooms = await roomService.findAllRooms();

  res.send(rooms.map(normolize));
};

const getRoomById = async (roomId) => {
  if (isNaN(+roomId)) {
    throw ApiError.BadRequest('Invalid room ID');
  }

  const existRoom = await roomService.findRoomById(+roomId);

  if (!existRoom) {
    throw ApiError.BadRequest('Room not exist');
  }

  return existRoom.name;
};

const createRoom = async (req, res) => {
  const { name } = req.body;
  const existRoom = await roomService.findRoomByName(name);

  if (existRoom) {
    throw ApiError.BadRequest('Room already exist');
  }

  await roomService.createRoom(name);

  res.status(201).send(`${name} was created`);
};

const renameRoom = async (req, res) => {
  const { roomId } = req.params;
  const { newName } = req.body;

  if (isNaN(+roomId)) {
    throw ApiError.BadRequest('Invalid room ID');
  }

  const existRoom = await roomService.findRoomById(+roomId);

  if (!existRoom) {
    throw ApiError.BadRequest('This room not existed');
  }

  await roomService.updateRoomName(existRoom, newName);

  res.send(`Room was renamed to ${newName}`);
};

const removeRoom = async (req, res) => {
  const { roomId } = req.params;

  if (isNaN(+roomId)) {
    throw ApiError.BadRequest('Invalid room ID');
  }

  const existRoom = await roomService.findRoomById(+roomId);

  if (!existRoom) {
    throw ApiError.BadRequest('This room not existed');
  }

  await messageController.deleteMessagesByRoomId(roomId);
  await roomService.deleteRoom(roomId);

  res.send(`The ${existRoom.name} room successfully deleted`);
};

function normolize({ id, name }) {
  return { id, name };
}

export const roomController = {
  getAllRooms,
  createRoom,
  renameRoom,
  removeRoom,
  getRoomById,
};
