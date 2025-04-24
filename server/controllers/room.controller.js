// @ts-nocheck
import { ApiError } from '../exeptions/api.error.js';
import {
  createNewRoom,
  getRoomByName,
  getRoomById,
  deleteRoomById,
  getAll,
} from '../services/room.services.js';
import { validateChatRoomName } from '../utils/validator.js';

export const normalize = ({ id, name }) => {
  return { id, name };
};

export const getAllRooms = async (req, res) => {
  const rooms = await getAll();
  res.send(rooms);
};

export const createRoom = async (req, res) => {
  const { name } = req.body;
  const validName = await validateChatRoomName({ name });
  const roomExist = await getRoomByName(name);

  if (validName) {
    throw new ApiError({
      messsage: 'Invalid entry',
      status: 422,
      errors: validName,
    });
  }

  if (roomExist) {
    throw ApiError.badRequest('Room already exist', {
      name: 'Room already exist',
    });
  }

  const room = await createNewRoom(name);
  res.send(normalize(room));
};

export const deleteRoom = async (req, res) => {
  const { id } = req.params;
  const roomExist = await getRoomById(id);

  if (!roomExist) {
    throw ApiError.badRequest("Room doesn't exist", {
      id: "Room doesn't exist",
    });
  }

  const room = await deleteRoomById(id);
  res.send(normalize(room));
};

export const renameRoom = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const validName = await validateChatRoomName({ name });
  const roomExist = await getRoomById(id);

  if (validName) {
    throw new ApiError({
      messsage: 'Invalid entry',
      status: 422,
      errors: validName,
    });
  }

  if (!roomExist) {
    throw ApiError.badRequest("Room doesn't exist", {
      id: "Room doesn't exist",
    });
  }

  roomExist.name = name;
  await roomExist.save();
  res.send(normalize(roomExist));
};
