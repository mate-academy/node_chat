import 'dotenv/config';

import { Room } from './src/models/Room.model.js';
import { Message } from './src/models/Message.model.js';
import { client } from './src/utils/db.js';

client.sync({ force: true });
