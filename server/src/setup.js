// import 'dotenv/config';
import { sequelize } from './store/sqlite.db.js';

import { Message } from './models/Message.model.js';
import { Room } from './models/Room.model.js';

const RoomHasManyMessage = Room.hasMany(Message, {
  // sourceKey: 'id',
  // foreignKey: 'roomId',
  onDelete: 'CASCADE', // This will cascade delete Messages when a Room is deleted
  hooks: true // Enable hooks to automatically delete associated Messages
});

try {
  await sequelize.sync({ force: true });

  console.info(`
  Models synced successfully!
  `);
} catch (error) {
  console.error('Error syncing models:', error);
}
