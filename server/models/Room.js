import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Room = sequelize.define(
  'Room',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  { timestamps: true },
);
