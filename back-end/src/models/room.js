import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const Room = client.define('Room', {
  roomName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
