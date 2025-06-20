import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

export const Room = sequelize.define('Room', {
  roomName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
