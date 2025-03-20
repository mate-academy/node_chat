import { DataTypes } from 'sequelize';

import { client } from '../utils/db.js';

export const Room = client.define('room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  roomName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
