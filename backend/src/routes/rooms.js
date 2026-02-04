import { Router } from 'express';
import crypto from 'crypto';

import { getRoomsUtil, writeChat } from '../utils/fileStorage.js';

const router = Router();

const getRooms = async (req, res) => {
  const rooms = await getRoomsUtil();

  res.status(200).json({ rooms });
};

const createRoom = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  const id = crypto.randomUUID();

  const newRoom = { id, name, messages: [] };

  const rooms = await getRoomsUtil();
  const nextRooms = [...rooms, newRoom];
  await writeChat({ rooms: nextRooms });

  const io = req.app.get('io');
  if (io) {
    io.emit('roomsUpdated', nextRooms);
  }

  res.status(201).json({ message: 'Room created', room: newRoom });
};

const renameRoom = async (req, res) => {
  const { roomId } = req.params;
  const { newName } = req.body;

  const rooms = await getRoomsUtil();
  const room = rooms.find((roomItem) => roomItem.id === roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  room.name = newName;

  await writeChat({ rooms });

  const io = req.app.get('io');
  if (io) {
    io.emit('roomsUpdated', rooms);
  }

  res.status(200).json({ message: 'Room renamed' });
};

const deleteRoom = async (req, res) => {
  const { roomId } = req.params;

  let rooms = await getRoomsUtil();
  rooms = rooms.filter((roomItem) => roomItem.id !== roomId);
  await writeChat({ rooms });

  const io = req.app.get('io');
  if (io) {
    io.emit('roomsUpdated', rooms);
  }

  res.status(200).json({ message: 'Room deleted' });
};

router.get('/', getRooms);
router.post('/', createRoom);
router.put('/:roomId', renameRoom);
router.delete('/:roomId', deleteRoom);

export default router;
