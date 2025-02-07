import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
  room: {
    type: Schema.Types.ObjectId,
    ref: 'room',
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model('message', messageSchema);
