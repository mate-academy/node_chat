/* eslint-disable no-unused-vars */

import 'dotenv/config';
import { client } from './src/utils/db.js';
import { Message } from './src/models/Message.model.js'
import { ChatUser } from './src/models/ChatUser.model.js'
import { Room } from './src/models/Room.model.js'
import { setupAssociations } from './src/models/associations.js'

async function setupDatabase() {
  try {
    await client.sync({ force: true });
    console.log('Database synced successfully!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

setupDatabase();
