import { DataTypes } from 'sequelize';
import { client } from '../db/db.js';

export const Room = client.define(
  'Room',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: true,
    tableName: 'rooms',
  },
);
