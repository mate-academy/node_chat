import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

export const Message = client.define('Message', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});
