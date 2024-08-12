import 'dotenv/config';
import db from './models/index.js';

db.sequelize.sync({ force: true });
