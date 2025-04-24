import 'dotenv/config';
import client from './utils/db.js';
// import { Users } from './models/users.js';
// import { Token } from './models/token.js';
import { Rooms } from './models/room.js';
import { Message } from './models/messages.js';

async function setupDatabase() {
  try {
    await client.sync({ force: true });
    console.log('Database synced successfully (tables dropped and recreated).');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
}
setupDatabase();
