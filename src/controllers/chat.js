'use strict';

const Chat = require('../models/Chat');

exports.createMessage = async(req, res, next) => {
  try {
    const { message, sender, room } = req.body;

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
