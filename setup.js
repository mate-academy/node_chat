/* eslint-disable no-unused-vars */
import 'dotenv/config';
import { User } from './src/moduls/User.js';
import { Token } from './src/moduls/Token.js';
import { Room } from './src/moduls/Room.js';
import { Messages } from './src/moduls/Messages.js';
import { client } from './src/untils/db.js';

client.sync({ force: true });
