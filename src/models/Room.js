const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // The 'members' field has been removed
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Room', roomSchema);
