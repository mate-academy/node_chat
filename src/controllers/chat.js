'use strict';

const Chat = require('../models/Chat');
const Room = require('../models/Room');

exports.createMessage = async(req, res, next) => {
  try {
    const { message, sender, room } = req.body;

    // Check if the sender is a member of the room
    const roomObj = await Room.findById(room);

    if (!roomObj.members.includes(sender)) {
      return res.status(403).json({
        message: 'You must join the room before sending messages',
      });
    }

    const chat = await Chat.create({
      message,
      sender,
      room,
    });

    res.status(201).json(chat);
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

    if (!chat) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json(chat);
  } catch (err) {
    next(err);
  }
};

exports.removeMessage = async(req, res, next) => {
  try {
    const chat = await Chat.findByIdAndRemove(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
