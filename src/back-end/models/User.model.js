import { DataTypes } from 'sequelize';
import { client } from '../db.js';

export const User = client.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
