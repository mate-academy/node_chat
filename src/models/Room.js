import { DataTypes } from 'sequelize';

import { sequelize } from '../services/db.js';
import { Message } from './Message.js';

export const Room = sequelize.define('room', {
  roomName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Room.hasMany(Message, {
  onDelete: 'CASCADE',
});

Message.belongsTo(Room);
