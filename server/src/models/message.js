import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const Message = client.define(
  'message',
  {
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    updatedAt: false,
  },
);
