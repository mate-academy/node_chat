import { roomService } from '../services/room.service.js';
import { userService } from '../services/users.service.js';

const getAllRooms = async (req, res) => {
  try {
    const rooms = roomService.getAllRooms();

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Room name required' });

      return;
    }

    const room = await roomService.createRoom(name);

    if (!room) {
      res.status(500).json({ message: 'Internal server error' });

      return;
    }

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    roomService.deleteRoom(+roomId);

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name } = req.body;

    const room = roomService.updateRoom(+roomId, name);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.sendStatus(200).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const joinRooms = async (req, res) => {
  const id = req.body;
  const userId = +req.body.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Bad request' });
  }

  const room = await roomService.getRoom(id);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const user = await userService.getById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const members = Array.isArray(room.members) ? room.members.slice() : [];

  if (!members.includes(userId)) {
    members.push(userId);
    await room.update({ members });
  }

  res.status(200).json(room);
};

export const roomController = {
  getAllRooms,
  createRoom,
  deleteRoom,
  updateRoom,
  joinRooms,
};
