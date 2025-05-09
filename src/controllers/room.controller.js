import { ApiError } from '../exeptions/api.error.js';
import { Room } from '../models/room.js';
import { roomService } from '../services/room.service.js';
import { userService } from '../services/user.service.js';

const getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.findAll();

    res.send(rooms);
  } catch (error) {
    next(error);
  }
};

const getRoomById = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await roomService.getRoomById(roomId);

    if (!room) {
      throw ApiError.notFound();
    }

    res.send(room);
  } catch (error) {
    next(error);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const { title, participants } = req.body;

    if (!title) {
      throw ApiError.badRequest('Enter the title');
    }

    const user = await userService.getUser(req);

    await roomService.createRoom(user, title, participants);

    res.status(201).send({ message: 'Room created' });
  } catch (error) {
    next(error);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { title, participants } = req.body;

    const room = await roomService.getRoomById(roomId);

    if (!room) {
      throw ApiError.notFound();
    }

    if (!Array.isArray(participants)) {
      throw ApiError.badRequest('Participants shoude be an array');
    }

    const user = await userService.getUser(req);

    await roomService.updateRoom(user, room, title, participants);

    const updatedRoom = await roomService.getRoomById(roomId);

    res.send(updatedRoom);
  } catch (error) {
    next(error);
  }
};

const deleteRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await roomService.getRoomById(roomId);

    if (!room) {
      throw ApiError.notFound();
    }

    await roomService.deleteRoom(roomId);

    res.status(204).send({ message: 'Room deleted' });
  } catch (error) {
    next(error);
  }
};

export const roomController = {
  createRoom,
  updateRoom,
  deleteRoom,
  getAllRooms,
  getRoomById,
};
