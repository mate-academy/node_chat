import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const User = client.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
