/* eslint-disable no-unused-vars */
import 'dotenv/config';
import { client } from './src/db.js';
import { Message } from './src/models/messages.js';
import { Room } from './src/models/room.js';

client.sync({
  force: true,
});
