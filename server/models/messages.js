// test1/models/message.js
import { DataTypes } from 'sequelize';
import client from '../utils/db.js';
import { Users } from './users.js';
import { Rooms } from './room.js';

export const Message = client.define('message', {
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: 'id',
    },
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Rooms,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
});
