import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

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
    timestamps: false,
  },
);
