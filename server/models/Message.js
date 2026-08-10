import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    roomId: { type: DataTypes.UUID, allowNull: false },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Anonymous',
    },
    text: { type: DataTypes.TEXT, allowNull: false },
  },
  { timestamps: true },
);
