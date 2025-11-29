import { User } from './models/userModel.js';
import { Message } from './models/messageModel.js';
import { Room } from './models/roomModel.js';

Message.sync({ force: false });
Room.sync({ force: false });
User.sync({ force: false });
