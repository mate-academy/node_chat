import { DataTypes } from 'sequelize';
import { client } from '../db.js';
import { User } from './user.js';
import { Room } from './room.js';

export const Message = client.define(
  'message',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    updatedAt: false,
    tableName: 'messages',
  },
);

Message.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Message, { foreignKey: 'userId' });

Message.belongsTo(Room, { foreignKey: 'roomId' });
Room.hasMany(Message, { foreignKey: 'roomId' });
