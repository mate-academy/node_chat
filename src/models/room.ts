import mongoose, { Document, Model } from 'mongoose';

export interface IRoom extends mongoose.Document {
  name: string;
  members: mongoose.Schema.Types.ObjectId[];
}

interface IRoomDocument extends IRoom, Document {}

interface IRoomModel extends Model<IRoomDocument> {
  findByIdAndRemove(id: string): Promise<IRoomDocument>;
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

export default mongoose.model<IRoomDocument>('Room', RoomSchema) as IRoomModel;
