import 'dotenv/config';
import './src/models/Messages.js';
import './src/models/Username.js';

import { client } from './src/utils/databese.js';

client.sync({ force: true });
