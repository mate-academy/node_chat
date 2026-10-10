const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Message = require('../models/Message'); // <-- Added this import!

// GET all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ name: 1 });

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a room
router.post('/', async (req, res) => {
  try {
    const room = new Room({ name: req.body.name });

    await room.save();
    res.status(201).json(room);
  } catch (err) {
    // Send the actual Mongoose error message
    res.status(400).json({ error: err.message });
  }
});

// PUT rename a room
router.put('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true },
    );

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: 'Error renaming room' });
  }
});

// DELETE a room
router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Also delete all messages in that room (This is where 'Message' is used)
    await Message.deleteMany({ room: req.params.id });

    res.json({ message: 'Room and its messages deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
