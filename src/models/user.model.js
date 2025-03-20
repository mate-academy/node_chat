import { DataTypes } from 'sequelize';

import { client } from '../utils/db.js';

export const User = client.define('user', {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
});
