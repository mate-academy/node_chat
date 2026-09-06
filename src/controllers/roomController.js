import { roomService } from '../services/roomService.js';

const getRooms = async (req, res) => {
  const rooms = await roomService.getAllRooms();

  res.json(rooms);
};

const createRoom = async (req, res) => {
  const { name, userId } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const room = await roomService.addRoom(name, userId);

  res.status(201).json(room);
};

const renameRoom = async (req, res) => {
  const { newName, roomId } = req.body;

  if (!newName || !roomId) {
    return res.status(400).json({ error: 'newName and roomId are required' });
  }

  const room = await roomService.getRoomById(roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const newRoom = await roomService.renameRoom(newName, room);

  res.json(newRoom);
};

const joinRoom = async (req, res) => {
  const { userId, roomId } = req.body;

  if (!userId || !roomId) {
    return res.status(400).json({ error: 'userId and roomId are required' });
  }

  const room = await roomService.getRoomById(roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const membership = await roomService.joinRoom(userId, roomId);

  res.json(membership);
};

const deleteRoom = async (req, res) => {
  const { roomId } = req.body;

  if (!roomId) {
    return res.status(400).json({ error: 'roomId is required' });
  }

  await roomService.deleteRoom(roomId);

  res.sendStatus(204);
};

const leaveRoom = async (req, res) => {
  const { userId, roomId } = req.body;

  if (!userId || !roomId) {
    return res.status(400).json({ error: 'userId and roomId are required' });
  }

  const room = await roomService.getRoomById(roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  await roomService.leaveRoom(userId, roomId);

  res.sendStatus(204);
};

const isUserInRoom = async (req, res) => {
  const { userId, roomId } = req.params;

  if (!userId || !roomId) {
    return res.status(400).json({ error: 'userId and roomId are required' });
  }

  const isInRoom = await roomService.isUserInRoom(userId, roomId);

  res.json({ isInRoom });
};

export const roomController = {
  getRooms,
  createRoom,
  renameRoom,
  joinRoom,
  deleteRoom,
  leaveRoom,
  isUserInRoom,
};
