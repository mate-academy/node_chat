import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const Message = client.define(
  'message',
  {
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'messages',
  },
);
