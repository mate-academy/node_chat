'use strict';

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
