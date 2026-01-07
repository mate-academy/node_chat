import { DataTypes, UUIDV4 } from 'sequelize';
import { client } from '../utils/db.js';

export const Message = client.define(
  'message',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: UUIDV4,
    },

    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'messages',
    timestamps: false,
  },
);
