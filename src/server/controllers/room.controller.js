import { roomService } from '../services/room.service.js';
import { Room } from '../models/room.js';

const getRooms = async (req, res) => {
  const rooms = await roomService.getRooms();

  return res.status(200).json(rooms);
};

const createRoom = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      error: 'Name is required',
    });
  }

  const existingRoom = await Room.findOne({ where: { name } });

  if (existingRoom) {
    return res.status(409).json({ error: 'Room already exists' });
  }

  const newRoom = await roomService.createRoom({ name });

  return res.status(201).json(newRoom);
};

const updateRoom = async (req, res) => {
  const { roomId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      error: 'Name is required',
    });
  }

  const room = await Room.findByPk(roomId);

  if (!room) {
    return res.status(404).json({
      error: 'Room not found',
    });
  }

  await roomService.updateRoom(roomId, { name });

  return res.status(200).json({
    message: 'Room updated successfully',
  });
};

const deleteRoom = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(400).json({
      error: 'Room ID is required',
    });
  }

  const room = await Room.findByPk(roomId);

  if (!room) {
    return res.status(404).json({
      error: 'Room not found',
    });
  }

  await roomService.deleteRoom(roomId);

  return res.status(200).json({
    message: 'Room deleted successfully',
  });
};

export const roomController = {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
};
