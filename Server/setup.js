import { client } from "./src/utils/bd.js";
import { User } from './src/models/user.js';
import { Rooms } from "./src/models/rooms.js";
import { Message } from "./src/models/messages.js";
import 'dotenv/config';
client.sync({ force: true })
