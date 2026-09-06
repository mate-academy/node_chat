import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

export const Room = sequelize.define(
  'Room',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id: {
      type: DataTypes.UUID,
      defaultValue: () => crypto.randomUUID(),
      primaryKey: true,
      allowNull: false,
    },
  },
  { tableName: 'rooms' },
);
