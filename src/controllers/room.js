'use strict';

const Room = require('../models/Room');

exports.createRoom = async(req, res, next) => {
  try {
    const { name } = req.body;

    const room = await Room.create({ name });

    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
};

exports.getRooms = async(req, res, next) => {
  try {
    const rooms = await Room.find({});

    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};

exports.removeRoom = async(req, res, next) => {
  try {
    const room = await Room.findByIdAndRemove(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.renameRoom = async(req, res, next) => {
  try {
    const { name } = req.body;

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(room);
  } catch (err) {
    next(err);
  }
};

exports.joinRoom = async(req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Add the user to the room's members array
    room.members.push(req.user._id);
    await room.save();

    res.status(200).json(room);
  } catch (err) {
    next(err);
  }
};
