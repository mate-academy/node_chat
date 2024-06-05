import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

export const Room = sequelize.define('rooms', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});
