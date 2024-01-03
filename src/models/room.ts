'use strict';

import mongoose from 'mongoose';

export interface IRoom extends mongoose.Document {
  name: string;
  members: mongoose.Schema.Types.ObjectId[];
}

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

export default mongoose.model<IRoom>('Room', RoomSchema);
