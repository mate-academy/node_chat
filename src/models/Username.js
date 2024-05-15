import { client } from '../utils/db.js';
import { DataTypes } from 'sequelize';

export const Username = client.define('usernames', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
