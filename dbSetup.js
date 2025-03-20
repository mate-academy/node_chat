import { client } from './src/utils/db.js';
import { User, Room, Message } from './src/models/index.js';

async function setupDatabase() {
  try {
    await client.authenticate();
    console.log('Database connection established successfully.');

    await client.sync({ force: true });
    console.log('All models were synchronized successfully.');

    console.log('Room associations:', Room.associations);
    console.log('Message associations:', Message.associations);

  } catch (error) {
    console.error('Unable to set up database:', error);
  }
}

setupDatabase();
