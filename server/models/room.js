import { DataTypes } from 'sequelize';
import client from '../utils/db.js';
export const Rooms = client.define('room', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
