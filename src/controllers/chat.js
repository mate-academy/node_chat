'use strict';

const Chat = require('../models/Chat');
const Room = require('../models/Room');
const {
  NOT_FOUND,
  FORBIDDEN,
  CREATED,
  OK,
  NO_CONTENT,
} = require('../constants/httpStatusCodes');
const {
  MESSAGE_NOT_FOUND,
  MUST_JOIN_ROOM,
} = require('../constants/errorMessages');

const checkChatExists = (chat, res) => {
  if (!chat) {
    return res.status(NOT_FOUND).json({ message: MESSAGE_NOT_FOUND });
  }
};

exports.createMessage = async(req, res, next) => {
  try {
    const { message, sender, room } = req.body;

    // Check if the sender is a member of the room
    const roomObj = await Room.findById(room);

    if (!roomObj.members.includes(sender)) {
      return res.status(FORBIDDEN).json({
        message: MUST_JOIN_ROOM,
      });
    }

    const chat = await Chat.create({
      message,
      sender,
      room,
    });

    res.status(CREATED).json(chat);
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async(req, res, next) => {
  try {
    // if no room is specified, get messages for the general chat
    const room = req.params.room || null;
    const chats = await Chat.find({ room }).populate('sender');

    res.status(200).json(chats);
  } catch (err) {
    next(err);
  }
};

exports.editMessage = async(req, res, next) => {
  try {
    const { message } = req.body;

    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { message },
      { new: true }
    );

    checkChatExists(chat, res);

    res.status(OK).json(chat);
  } catch (err) {
    next(err);
  }
};

exports.removeMessage = async(req, res, next) => {
  try {
    const chat = await Chat.findByIdAndRemove(req.params.id);

    checkChatExists(chat, res);

    res.status(NO_CONTENT).end();
  } catch (err) {
    next(err);
  }
};
