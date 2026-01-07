import { Room } from './room.model.js';
import { Message } from './messages.model.js';

// associations
Room.hasMany(Message, {
  foreignKey: 'roomId',
  onDelete: 'CASCADE',
});

Message.belongsTo(Room, {
  foreignKey: 'roomId',
});

export { Room, Message };
