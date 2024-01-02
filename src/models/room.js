'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
});

module.exports = mongoose.model('Room', RoomSchema);
