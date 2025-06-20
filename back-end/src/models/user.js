import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

export const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
