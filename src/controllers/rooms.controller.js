import { rooms } from '../data/chatData.js';

const getAllRooms = async (req, res) => {
  res.json(rooms);
};

const createRoom = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const exists = rooms.find((r) => r.name === name);

  if (exists) {
    return res.status(400).json({ error: 'Room already exists' });
  }

  const newRoom = {
    id: Date.now(),
    name,
    messages: [],
  };

  rooms.push(newRoom);
  res.status(201).json(newRoom);
};

const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const room = rooms.find((r) => r.id === Number(id));

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  room.name = name;

  res.json(room);
};

const deleteRoom = async (req, res) => {
  const { id } = req.params;
  const roomIndex = rooms.findIndex((r) => r.id === Number(id));

  if (roomIndex === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }

  rooms.splice(roomIndex, 1);
  res.status(204).send();
};

export const roomsController = {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
};
