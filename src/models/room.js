import { client } from '../utils/db.js';
import { DataTypes } from 'sequelize';

export const Room = client.define(
  'Room',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'rooms',
  },
);
