import { validate as isUuid } from 'uuid';
import { roomsService } from '../services/rooms.service.js';

const getAll = async (req, res) => {
  const rooms = await roomsService.getAll();

  return res.json(rooms);
};

const getById = async (req, res) => {
  const { id } = req.params;

  if (!isUuid(id)) {
    return res.status(400).json({ message: 'Invalid room id' });
  }

  const room = await roomsService.getById(id);

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  return res.json(room);
};

const createRoom = async (req, res) => {
  const name = req.body?.name;

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Name is required' });
  }

  if (name.trim().length > 255) {
    return res.status(400).json({
      message: 'Name must be at most 255 characters',
    });
  }

  const room = await roomsService.createRoom({
    name: name.trim(),
  });

  return res.status(201).json(room);
};

const upDateRoom = async (req, res) => {
  const { id } = req.params;
  const name = req.body?.name;

  if (!isUuid(id)) {
    return res.status(400).json({ message: 'Invalid room id' });
  }

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Name is required' });
  }

  if (name.trim().length > 255) {
    return res.status(400).json({
      message: 'Name must be at most 255 characters',
    });
  }

  const room = await roomsService.update({
    id,
    name: name.trim(),
  });

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  return res.json(room);
};

const deletedRoomById = async (req, res) => {
  const { id } = req.params;

  if (!isUuid(id)) {
    return res.status(400).json({ message: 'Invalid room id' });
  }

  const room = await roomsService.deleteById(id);

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  return res.json(room);
};

export const roomsController = {
  getAll,
  getById,
  createRoom,
  upDateRoom,
  deletedRoomById,
};
