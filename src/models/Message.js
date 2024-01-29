import { DataTypes } from 'sequelize';

import { sequelize } from '../services/db.js';

export const Message = sequelize.define('message', {
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  createdAt: false,
  updatedAt: false,
});
