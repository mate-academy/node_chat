import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

export const UserRooms = sequelize.define(
  'user__room',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => crypto.randomUUID(),
      primaryKey: true,
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  { tableName: 'user__rooms' },
);
