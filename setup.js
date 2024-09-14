import 'dotenv/config';

import { Message } from './src/models/message.js';
import { Room } from './src/models/room.js';

Room.sync({ force: true });
Message.sync({ force: true });
