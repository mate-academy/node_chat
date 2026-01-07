import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';
import { Room } from './Room.js';

export const Message = client.define('message', {
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Room.hasMany(Message, { onDelete: 'CASCADE' });
Message.belongsTo(Room);
