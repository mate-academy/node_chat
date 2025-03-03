import { sequelize } from './utils/db.js';

import { User } from './models/user.js';
import { Message } from './models/message.js';

await sequelize.sync({ force: true });
