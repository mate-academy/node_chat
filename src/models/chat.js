'use strict';

const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  room: String, // room is optional
});

module.exports = mongoose.model('Chat', ChatSchema);
