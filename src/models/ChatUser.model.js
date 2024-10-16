import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const ChatUser = client.define(
  'chatUser',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);
