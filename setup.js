import 'dotenv/config';
import './src/models/Messages.js';
import './src/models/Username.js';

import { client } from './src/utils/db.js';

client.sync({ force: true });
