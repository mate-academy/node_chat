import mongoose, { Document, Model } from 'mongoose';

export interface IChat {
  message: string;
  sender: mongoose.Schema.Types.ObjectId;
  room: string;
  timestamp: Date;
}

interface IChatDocument extends IChat, Document {}

interface IChatModel extends Model<IChatDocument> {
  findByIdAndRemove(id: string): Promise<IChatDocument>;
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

export default mongoose.model<IChatDocument>('Chat', ChatSchema) as IChatModel;
