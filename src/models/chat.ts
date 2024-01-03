'use strict';

import mongoose from 'mongoose';

export interface IChat extends mongoose.Document {
  message: string;
  sender: mongoose.Schema.Types.ObjectId;
  room: string;
  timestamp: Date;
}

const ChatSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required'],
  },
  room: {
    type: String,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IChat>('Chat', ChatSchema);
