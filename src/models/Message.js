const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    author: {
      type: String, // Username provided by the client
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
); // This automatically creates 'createdAt' and 'updatedAt'

module.exports = mongoose.model('Message', messageSchema);
