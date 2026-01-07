import { client } from './utils/db.js';
import './models/index.js';

client.sync({ force: true });
