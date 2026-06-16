import 'dotenv/config.js';
import { client } from './src/server/utils/db.js';
import './src/server/models/message.js';
import './src/server/models/room.js';

await client.sync({ force: true });
