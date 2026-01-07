import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const Room = client.define('room', {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  roomName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  authorName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
