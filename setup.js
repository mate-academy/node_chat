import 'dotenv/config';
import { sequelize } from './src/services/db.js';
import './src/models/Message.js';
import './src/models/Room.js';

sequelize.sync({ force: true });
