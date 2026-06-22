import 'dotenv/config';
import { User, Message, Room } from './src/models/index.js';
import { client } from './src/utils/db.js';

client.sync({ force: true });
