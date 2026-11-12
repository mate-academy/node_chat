import { Room } from '../models/index.js';

// GET all rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      order: [['id', 'ASC']],
    });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE room
export const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        error: 'Room name is required',
      });
    }

    const room = await Room.create({
      name: name.trim(),
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// RENAME room
export const renameRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({
        error: 'Room not found',
      });
    }

    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        error: 'Room name is required',
      });
    }

    room.name = name.trim();

    await room.save();

    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE room
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({
        error: 'Room not found',
      });
    }

    await room.destroy();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
