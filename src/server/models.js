const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
});

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

const MessageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
});

const User = mongoose.model('User', UserSchema);
const Room = mongoose.model('Room', RoomSchema);
const Message = mongoose.model('Message', MessageSchema);

module.exports = {
  User,
  Room,
  Message,
};
