import { client } from '../utils/db.js';
import { DataTypes } from 'sequelize';

export const Message = client.define('message', {
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  chatName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
