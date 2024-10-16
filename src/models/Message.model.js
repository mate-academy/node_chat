import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const Message = client.define(
  'message',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'chatUsers',
        key: 'id',
      },
      allowNull: false,
    },
    roomId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'rooms',
        key: 'id',
      },
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  },
);
