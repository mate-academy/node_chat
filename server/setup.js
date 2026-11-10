import 'dotenv/config';
import { client } from './src/utils/db.js';
import './src/models/message.js';
import './src/models/room.js';

await client.sync({ force: true });
