import { client } from '../utils/databese.js';
import { DataTypes } from 'sequelize';

export const Username = client.define('usernames', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
