import { client } from '../utils/databese.js';
import { DataTypes } from 'sequelize';

export const Message = client.define('messages', {
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
