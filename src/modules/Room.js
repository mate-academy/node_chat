import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const Room = client.define('room', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
