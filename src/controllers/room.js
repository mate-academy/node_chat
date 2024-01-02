'use strict';

const Room = require('../models/Room');
const {
  NOT_FOUND,
  CREATED,
  OK,
  NO_CONTENT,
} = require('../constants/httpStatusCodes');
const {
  ROOM_NOT_FOUND,
} = require('../constants/errorMessages');

const checkRoomExists = (room, res) => {
  if (!room) {
    return res.status(NOT_FOUND).json({ message: ROOM_NOT_FOUND });
  }
};

exports.createRoom = async(req, res, next) => {
  try {
    const { name } = req.body;

    const room = await Room.create({ name });

    res.status(CREATED).json(room);
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

    checkRoomExists(room, res);

    res.status(NO_CONTENT).end();
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

    checkRoomExists(room, res);

    res.status(OK).json(room);
  } catch (err) {
    next(err);
  }
};

exports.joinRoom = async(req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    checkRoomExists(room, res);

    // Add the user to the room's members array
    room.members.push(req.user._id);
    await room.save();

    res.status(OK).json(room);
  } catch (err) {
    next(err);
  }
};
