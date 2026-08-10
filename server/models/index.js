import { sequelize } from '../db.js';
import { Room } from './Room.js';
import { Message } from './Message.js';

Room.hasMany(Message, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Message.belongsTo(Room, { foreignKey: 'roomId' });

export { sequelize, Room, Message };
