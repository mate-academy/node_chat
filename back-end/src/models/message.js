import { DataTypes } from 'sequelize';
import { sequelize } from '../utils/db.js';

export const Message = sequelize.define('Message', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});
