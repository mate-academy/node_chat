import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const User = client.define('users', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
});
