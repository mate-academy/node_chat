import { Schema, model } from 'mongoose';

const roomSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
});

export default model('room', roomSchema);
