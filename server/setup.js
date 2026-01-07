import 'dotenv/config';
import { Room } from './src/models/Room.js';
import { Message } from './src/models/Message.js';
import { client } from './src/utils/db.js';

client.sync({ force: true });
