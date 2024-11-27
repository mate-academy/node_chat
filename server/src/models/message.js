import { DataTypes, UUIDV4 } from 'sequelize';
import { client } from '../utils/db.js';
import { text } from 'express';
import { Room } from './room.js';

export const Message = client.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

Room.hasMany(Message, { foreignKey: 'RoomId' });
Message.belongsTo(Room, { foreignKey: 'RoomId' });
