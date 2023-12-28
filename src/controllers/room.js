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
