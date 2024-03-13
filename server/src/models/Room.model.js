import { DataTypes } from 'sequelize';
import { sequelize } from '../store/sqlite.db.js';

export const Room = sequelize.define('room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
  },
}, {
  updatedAt: false,
});
