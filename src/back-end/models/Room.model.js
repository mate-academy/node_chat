import { DataTypes } from 'sequelize';
import { client } from '../db.js';

export const Room = client.define('Room', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
