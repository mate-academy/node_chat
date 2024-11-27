import 'dotenv/config';
// import { User } from './src/models/user.js';
// import { Token } from './src/models/token.js';
import { client } from './utils/db.js';
import { Room } from './models/room.js';
import { Message } from './models/message.js';

client.sync({ force: true })
