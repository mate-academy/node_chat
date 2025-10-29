import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

export const UserRoom = sequelize.define(
  'UserRoom',
  {
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'user_rooms',
  },
);
