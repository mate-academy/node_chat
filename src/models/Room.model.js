import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const Room = client.define(
  'room',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);
