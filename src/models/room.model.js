import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

export const Room = sequelize.define(
  'Room',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'rooms',
  },
);
